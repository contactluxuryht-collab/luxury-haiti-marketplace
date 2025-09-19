import { useEffect, useMemo, useState } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useCategories } from "@/hooks/useCategories"
import { useProducts } from "@/hooks/useProducts"
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Activity,
  AlertCircle
} from "lucide-react"

type SellerRow = {
  id: string
  auth_id: string
  email: string
  name: string | null
  role: string
  business_name: string | null
  phone_number: string | null
  selling_focus: string | null
  created_at: string | null
  seller_approved?: boolean | null
}

type ProductRow = {
  id: string
  title: string
  description: string | null
  price: number
  image_url: string | null
  category_id: string | null
  seller_id: string
  is_active: boolean | null
  created_at: string | null
  seller?: {
    name: string | null
    email: string
  }
  category?: {
    name: string
  }
}

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const { toast } = useToast()
  const { categories } = useCategories()
  const { products, refetch: refetchProducts } = useProducts()
  const [sellers, setSellers] = useState<SellerRow[]>([])
  const [allProducts, setAllProducts] = useState<ProductRow[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    pendingSellers: 0,
    totalProducts: 0,
    totalOrders: 0,
    activeProducts: 0,
    inactiveProducts: 0,
  })
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    price: "",
    category_id: "",
    image_url: "",
  })
  const [saving, setSaving] = useState(false)
  const isAdmin = useMemo(() => (user?.user_metadata as any)?.role === 'admin', [user])

  useEffect(() => {
    console.log('AdminDashboard useEffect - loading:', loading, 'user:', user)
    console.log('User metadata:', user?.user_metadata)
    console.log('Is admin:', isAdmin)
    
    if (!loading && user) {
      console.log('Loading admin dashboard data...')
      fetchOverview()
      fetchSellers()
      fetchAllProducts()
      
      const channel = supabase
        .channel('sellers-admin')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'users' }, (payload) => {
          console.log('New user signup detected:', payload.new)
          const row = payload.new as any
          if ((row.role === 'seller') && (!row.seller_approved || row.seller_approved === false)) {
            toast({ title: 'New seller signup', description: row.email || row.name || row.auth_id })
            fetchSellers()
          }
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'products' }, () => {
          fetchAllProducts()
          fetchOverview()
        })
        .subscribe()
      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [loading, user, isAdmin])

  useEffect(() => {
    if (products) {
      setAllProducts(products as ProductRow[])
    }
  }, [products])

  const fetchOverview = async () => {
    // Users
    const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true })
    const { count: sellersCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'seller')
    const { data: pendingData } = await supabase.from('users').select('id, seller_approved').eq('role', 'seller')
    const pending = (pendingData || []).filter((r: any) => !r.seller_approved).length
    // Products
    const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact', head: true })
    const { count: activeProductsCount } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true)
    const { count: inactiveProductsCount } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', false)
    // Orders
    const { count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true })
    setStats({
      totalUsers: usersCount || 0,
      totalSellers: sellersCount || 0,
      pendingSellers: pending || 0,
      totalProducts: productsCount || 0,
      totalOrders: ordersCount || 0,
      activeProducts: activeProductsCount || 0,
      inactiveProducts: inactiveProductsCount || 0,
    })
  }

  const fetchAllProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        seller:users!products_seller_id_fkey(name, email),
        category:categories(name)
      `)
      .order('created_at', { ascending: false })
    if (!error) setAllProducts(data as ProductRow[])
  }

  const fetchSellers = async () => {
    try {
      console.log('Fetching sellers...')
      const { data, error } = await supabase
        .from('users')
        .select('id, auth_id, email, name, role, business_name, phone_number, selling_focus, created_at, seller_approved')
        .eq('role', 'seller')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching sellers:', error)
        toast({ title: 'Error', description: 'Failed to fetch sellers: ' + error.message, variant: 'destructive' })
        setSellers([])
      } else {
        console.log('Fetched sellers:', data)
        setSellers(data as SellerRow[])
      }
    } catch (err: any) {
      console.error('Fetch sellers error:', err)
      toast({ title: 'Error', description: 'Failed to fetch sellers: ' + err.message, variant: 'destructive' })
      setSellers([])
    }
  }

  const updateApproval = async (id: string, approve: boolean) => {
    try {
      console.log('Updating seller approval:', { id, approve })
      
      // First check if the column exists by trying to select it
      const { data: testData, error: testError } = await supabase
        .from('users')
        .select('seller_approved')
        .eq('id', id)
        .single()
      
      if (testError) {
        console.error('Column check error:', testError)
        toast({ 
          title: 'Database Error', 
          description: 'The seller_approved column does not exist. Please run the database setup SQL first.', 
          variant: 'destructive' 
        })
        return
      }
      
      // Update the approval status
      const { error } = await supabase
        .from('users')
        .update({ seller_approved: approve })
        .eq('id', id)
        
      if (error) {
        console.error('Database error:', error)
        toast({ title: 'Failed to update', description: error.message, variant: 'destructive' })
        return
      }
      
      console.log('Update successful, refreshing data...')
      
      // Show success message
      toast({ 
        title: approve ? 'Seller approved successfully!' : 'Seller access denied', 
        description: approve ? 'The seller can now add products to the marketplace.' : 'The seller cannot add products until approved.'
      })
      
      // Refresh data
      await fetchSellers()
      await fetchOverview()
      
    } catch (error: any) {
      console.error('Update error:', error)
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  }

  const closeSellerAccount = async (id: string) => {
    try {
      // First, get the seller's auth_id to delete from auth.users
      const { data: sellerData, error: fetchError } = await supabase
        .from('users')
        .select('auth_id')
        .eq('id', id)
        .single()

      if (fetchError) {
        toast({ title: 'Error', description: 'Failed to fetch seller data', variant: 'destructive' })
        return
      }

      // Delete from users table (this will cascade to products, orders, etc.)
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', id)

      if (deleteError) {
        toast({ title: 'Error', description: deleteError.message, variant: 'destructive' })
        return
      }

      toast({ 
        title: 'Seller account closed', 
        description: 'The seller account and all associated data have been removed.'
      })
      
      // Refresh data
      await fetchSellers()
      await fetchOverview()
      
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  }

  const handleAddProduct = async () => {
    if (!user) return
    setSaving(true)
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single()
      if (userError) throw userError

      const { error: insertError } = await supabase
        .from('products')
        .insert([{
          title: newProduct.title,
          description: newProduct.description,
          price: parseFloat(newProduct.price),
          image_url: newProduct.image_url || null,
          category_id: newProduct.category_id,
          seller_id: userData.id,
          is_active: true,
        }])

      if (insertError) throw insertError

      toast({ title: "Product added successfully" })
      setShowAddProduct(false)
      setNewProduct({ title: "", description: "", price: "", category_id: "", image_url: "" })
      fetchAllProducts()
      fetchOverview()
    } catch (error: any) {
      toast({ title: 'Failed to add product', description: error.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const toggleProductStatus = async (productId: string, isActive: boolean) => {
    const { error } = await supabase
      .from('products')
      .update({ is_active: !isActive })
      .eq('id', productId)
    
    if (error) {
      toast({ title: 'Failed to update product', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: `Product ${!isActive ? 'activated' : 'deactivated'}` })
      fetchAllProducts()
      fetchOverview()
    }
  }

  const deleteProduct = async (productId: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
    
    if (error) {
      toast({ title: 'Failed to delete product', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Product deleted successfully' })
      fetchAllProducts()
      fetchOverview()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    )
  }
  
  if (!user) {
    console.log('No user found, redirecting to login')
    return <Navigate to="/admin/login" replace />
  }
  
  if (!isAdmin) {
    console.log('User is not admin, user metadata:', user.user_metadata)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">You need admin privileges to access this page.</p>
          <p className="text-sm text-muted-foreground">User role: {(user.user_metadata as any)?.role || 'none'}</p>
          <Button onClick={() => window.location.href = '/admin/login'} className="mt-4">
            Go to Admin Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Debug Info - Remove this after testing */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">Debug Info (Remove after testing)</h3>
        <p className="text-sm text-yellow-700">User: {user?.email}</p>
        <p className="text-sm text-yellow-700">Role: {(user?.user_metadata as any)?.role || 'none'}</p>
        <p className="text-sm text-yellow-700">Is Admin: {isAdmin ? 'Yes' : 'No'}</p>
        <p className="text-sm text-yellow-700">Sellers Count: {sellers.length}</p>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
            <Shield className="h-10 w-10 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">Manage your marketplace with complete control</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setShowAddProduct(true)} className="bg-gradient-primary hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border/50 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeProducts} active, {stats.inactiveProducts} inactive
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Activity className="h-3 w-3" />
              All time orders
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Sellers</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.pendingSellers}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="sellers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sellers">Sellers Management</TabsTrigger>
          <TabsTrigger value="products">Products Management</TabsTrigger>
        </TabsList>

        <TabsContent value="sellers" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Sellers Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Focus</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sellers.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name || '—'}</TableCell>
                      <TableCell>{s.email}</TableCell>
                      <TableCell>{s.business_name || '—'}</TableCell>
                      <TableCell>{s.phone_number || '—'}</TableCell>
                      <TableCell>{s.selling_focus || '—'}</TableCell>
                      <TableCell>
                        {s.seller_approved ? (
                          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                            <CheckCircle className="h-3 w-3" />
                            Approved
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            <XCircle className="h-3 w-3" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end space-y-2">
                          {/* Status Badge */}
                          <div>
                            {s.seller_approved === true ? (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approved
                              </Badge>
                            ) : s.seller_approved === false ? (
                              <Badge variant="destructive">
                                <XCircle className="h-3 w-3 mr-1" />
                                Denied
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex space-x-1">
                            <Button 
                              size="sm" 
                              variant="default" 
                              onClick={() => updateApproval(s.id, true)} 
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => updateApproval(s.id, false)} 
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Deny
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => closeSellerAccount(s.id)} 
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <Shield className="h-3 w-3 mr-1" />
                              Close
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Products Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
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
                            <div className="font-medium">{product.title}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {product.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.seller?.name || 'Unknown'}</div>
                          <div className="text-sm text-muted-foreground">{product.seller?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{product.category?.name || '—'}</TableCell>
                      <TableCell className="font-medium">${product.price.toLocaleString()}</TableCell>
                      <TableCell>
                        {product.is_active ? (
                          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                            <CheckCircle className="h-3 w-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            <XCircle className="h-3 w-3" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => toggleProductStatus(product.id, product.is_active || false)}
                        >
                          {product.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => deleteProduct(product.id)}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Product Dialog */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Create a new product for the marketplace
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Product Title</Label>
              <Input 
                id="title"
                value={newProduct.title} 
                onChange={(e) => setNewProduct({...newProduct, title: e.target.value})}
                placeholder="Enter product title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                value={newProduct.description} 
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                placeholder="Enter product description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input 
                  id="price"
                  type="number" 
                  step="0.01"
                  value={newProduct.price} 
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={newProduct.category_id} onValueChange={(value) => setNewProduct({...newProduct, category_id: value})}>
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
              <Label htmlFor="image">Image URL</Label>
              <Input 
                id="image"
                value={newProduct.image_url} 
                onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddProduct(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddProduct} disabled={saving}>
              {saving ? 'Adding...' : 'Add Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


