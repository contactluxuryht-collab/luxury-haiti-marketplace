import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Navigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, Package, DollarSign, ShoppingCart, Edit, Trash2, Upload, X, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { useProducts } from "@/hooks/useProducts"
import { useCategories } from "@/hooks/useCategories"

interface Product {
  id: string
  title: string
  description: string | null
  price: number
  image_url: string | null
  category_id: string | null
  seller_id: string
  created_at: string
}

export default function SellerDashboard() {
  const { user, loading: authLoading } = useAuth()
  const { products, loading: productsLoading, refetch } = useProducts()
  const { categories } = useCategories()
  const [userProducts, setUserProducts] = useState<Product[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    price: "",
    category_id: "",
    quantity: "",
    colors: [] as string[],
    size: "",
    weight: "",
    image_url: "",
  })
  const [newColor, setNewColor] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalRevenue: 0,
    pendingOrders: 0
  })
  const [sellerApproved, setSellerApproved] = useState<boolean | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (user && products) {
      fetchUserProducts()
      fetchStats()
      fetchSellerApproval()
    }
  }, [user, products])

  // Real-time subscription for approval status changes
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('seller-approval')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'users',
          filter: `auth_id=eq.${user.id}`
        }, 
        (payload) => {
          const newData = payload.new as any
          if (newData.seller_approved !== undefined) {
            setSellerApproved(newData.seller_approved)
            toast({
              title: newData.seller_approved ? 'Account Approved!' : 'Account Status Updated',
              description: newData.seller_approved 
                ? 'Your seller account has been approved. You can now add products!'
                : 'Your account status has been updated.'
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, toast])

  const fetchSellerApproval = async () => {
    if (!user) return

    try {
      const { data: sellerData, error } = await supabase
        .from('users')
        .select('seller_approved')
        .eq('auth_id', user.id)
        .single()

      if (error) throw error
      setSellerApproved(sellerData?.seller_approved || false)
    } catch (error) {
      console.error('Error fetching seller approval status:', error)
      setSellerApproved(false)
    }
  }

  const fetchUserProducts = async () => {
    if (!user) return

    try {
      // Get user's internal ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (userError) throw userError

      // Filter products by seller
      const sellerProducts = products.filter(product => product.seller_id === userData.id)
      setUserProducts(sellerProducts)
    } catch (error) {
      console.error('Error fetching user products:', error)
    }
  }

  const fetchStats = async () => {
    if (!user) return

    try {
      // Get user's internal ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (userError) throw userError

      // Get orders for user's products
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*, products!inner(*)')
        .eq('products.seller_id', userData.id)

      if (ordersError) throw ordersError

      const totalProducts = userProducts.length
      const totalRevenue = 0 // Calculate from orders when implemented
      const pendingOrders = orders?.filter(order => order.status === 'pending').length || 0

      setStats({
        totalProducts,
        totalRevenue,
        pendingOrders
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleOpenAdd = () => {
    setFormError(null)
    setNewProduct({ 
      title: "", 
      description: "", 
      price: "", 
      category_id: "", 
      quantity: "", 
      colors: [], 
      size: "", 
      weight: "", 
      image_url: "" 
    })
    setNewColor("")
    setSelectedFile(null)
    setPreviewUrl(null)
    setAddOpen(true)
  }

  const addColor = () => {
    if (newColor.trim() && !newProduct.colors.includes(newColor.trim())) {
      setNewProduct({ ...newProduct, colors: [...newProduct.colors, newColor.trim()] })
      setNewColor("")
    }
  }

  const removeColor = (colorToRemove: string) => {
    setNewProduct({ ...newProduct, colors: newProduct.colors.filter(color => color !== colorToRemove) })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `products/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleSaveProduct = async () => {
    if (!user) return
    setSaving(true)
    setFormError(null)
    try {
      // Check seller approval
      const { data: sellerRow, error: sellerErr } = await supabase
        .from('users')
        .select('seller_approved')
        .eq('auth_id', user.id)
        .single()
      if (sellerErr) throw sellerErr
      if (!sellerRow?.seller_approved) {
        setFormError('Your seller account is pending approval. Please wait for admin approval before posting products.')
        setSaving(false)
        return
      }

      const priceNumber = parseFloat(newProduct.price as any)
      const quantityNumber = parseInt(newProduct.quantity as any)
      const weightNumber = parseFloat(newProduct.weight as any)
      
      if (!newProduct.title || isNaN(priceNumber) || !newProduct.category_id) {
        setFormError("Please provide a title, valid price, and select a category.")
        setSaving(false)
        return
      }

      let imageUrl = newProduct.image_url
      if (selectedFile) {
        setUploading(true)
        imageUrl = await uploadImage(selectedFile)
        setUploading(false)
      }

      // Get user's internal ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single()
      if (userError) throw userError

      // Create detailed description with all product info
      const colorsText = newProduct.colors.length > 0 ? newProduct.colors.join(', ') : 'Not specified'
      const detailedDescription = `${newProduct.description}

Product Details:
- Quantity Available: ${quantityNumber || 'Not specified'}
- Available Colors: ${colorsText}
- Size: ${newProduct.size || 'Not specified'}
- Weight: ${weightNumber ? `${weightNumber} lbs` : 'Not specified'}`

      const { error: insertError } = await supabase
        .from('products')
        .insert([
          {
            title: newProduct.title,
            description: detailedDescription,
            price: priceNumber,
            image_url: imageUrl || null,
            category_id: newProduct.category_id,
            seller_id: userData.id,
          },
        ])

      if (insertError) throw insertError

      toast({ title: "Product added", description: "Your product is now listed." })
      setAddOpen(false)
      await refetch()
      await fetchUserProducts()
      await fetchStats()
    } catch (e: any) {
      setFormError(e?.message || 'Failed to add product')
    } finally {
      setSaving(false)
      setUploading(false)
    }
  }

  if (authLoading || productsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Seller Dashboard</h1>
        <p className="text-muted-foreground">Manage your products and track your sales</p>
      </div>

      {/* Approval Status Banner */}
      {sellerApproved === false && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-800">Account Not Approved</h3>
                <p className="text-red-700">Your seller account has been denied. You cannot add products until approved by an administrator.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {sellerApproved === null && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-yellow-800">Pending Approval</h3>
                <p className="text-yellow-700">Your seller account is pending approval. You cannot add products until approved by an administrator.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {sellerApproved === true && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">Account Approved</h3>
                <p className="text-green-700">Your seller account is approved. You can now add and manage products.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Active listings</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue}</div>
            <p className="text-xs text-muted-foreground">Total earnings</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Pending orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Approval Status */}
      {sellerApproved === false && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Package className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-yellow-800">Account Pending Approval</h3>
                <p className="text-sm text-yellow-700">
                  Your seller account is currently under review. You'll be able to add products once approved by our admin team.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {sellerApproved === true && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Package className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800">Account Approved</h3>
                <p className="text-sm text-green-700">
                  Your seller account has been approved! You can now add and manage your products.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Section */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Products</CardTitle>
              <CardDescription>Manage your product listings</CardDescription>
            </div>
            <Button 
              onClick={handleOpenAdd}
              disabled={sellerApproved === false}
              className={sellerApproved === false ? "opacity-50 cursor-not-allowed" : ""}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {userProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products yet</h3>
              <p className="text-muted-foreground mb-4">Start selling by adding your first product</p>
              <Button onClick={handleOpenAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Product
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {userProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{product.title}</h3>
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">${product.price}</Badge>
                        <Badge variant="outline">Active</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a new product</DialogTitle>
            <DialogDescription>Enter all details about your product.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prod-title">Product Title *</Label>
              <Input id="prod-title" value={newProduct.title} onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })} placeholder="Enter product title" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prod-desc">Description</Label>
              <Textarea id="prod-desc" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="Describe your product..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prod-price">Price *</Label>
                <Input id="prod-price" type="number" step="0.01" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prod-category">Category *</Label>
                <Select value={newProduct.category_id} onValueChange={(value) => setNewProduct({ ...newProduct, category_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prod-quantity">Quantity Available</Label>
              <Input id="prod-quantity" type="number" value={newProduct.quantity} onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })} placeholder="How many in stock?" />
            </div>

            <div className="space-y-2">
              <Label>Available Colors</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input 
                    value={newColor} 
                    onChange={(e) => setNewColor(e.target.value)} 
                    placeholder="e.g. Red, Blue, Black" 
                    onKeyPress={(e) => e.key === 'Enter' && addColor()}
                  />
                  <Button type="button" onClick={addColor} disabled={!newColor.trim()}>
                    Add Color
                  </Button>
                </div>
                {newProduct.colors.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {newProduct.colors.map((color, index) => (
                      <div key={index} className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md">
                        <span className="text-sm">{color}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 text-primary hover:text-destructive"
                          onClick={() => removeColor(color)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prod-size">Size</Label>
                <Input id="prod-size" value={newProduct.size} onChange={(e) => setNewProduct({ ...newProduct, size: e.target.value })} placeholder="e.g. Small, Medium, Large" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prod-weight">Weight (lbs)</Label>
                <Input id="prod-weight" type="number" step="0.1" value={newProduct.weight} onChange={(e) => setNewProduct({ ...newProduct, weight: e.target.value })} placeholder="0.0" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Product Image</Label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                {previewUrl && (
                  <div className="relative w-32 h-32 border border-border rounded-lg overflow-hidden">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => {
                        setSelectedFile(null)
                        setPreviewUrl(null)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Or provide an image URL below</p>
              <Input 
                placeholder="https://example.com/image.jpg" 
                value={newProduct.image_url} 
                onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })} 
              />
            </div>

            {formError && <p className="text-sm text-destructive">{formError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProduct} disabled={saving || uploading}>
              {saving ? (uploading ? 'Uploading...' : 'Saving...') : 'Save Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}