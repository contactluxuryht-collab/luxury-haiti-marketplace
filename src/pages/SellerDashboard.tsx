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
import { Loader2, Plus, Package, DollarSign, ShoppingCart, Edit, Trash2, Upload, X, CheckCircle, XCircle, AlertCircle, Truck, MapPin, Clock, User, Phone, Mail, Eye, RefreshCw } from "lucide-react"
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
  delivery_available?: boolean
  delivery_price?: number
}

interface Order {
  id: string
  buyer_id: string
  seller_id: string
  product_id: string
  quantity: number
  price_per_unit: number
  total_amount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  shipping_address: any
  payment_method?: string
  payment_status?: string
  notes?: string
  created_at: string
  updated_at: string
  product?: Product
  buyer?: {
    name: string
    email: string
    phone_number?: string
  }
  delivery_option?: 'pickup' | 'delivery'
  delivery_fee?: number
}

export default function SellerDashboard() {
  const { user, loading: authLoading } = useAuth()
  const { products, loading: productsLoading, refetch } = useProducts()
  const { categories } = useCategories()
  const [userProducts, setUserProducts] = useState<Product[]>([])
  const [sellerPhone, setSellerPhone] = useState<string>("")
  const [savingPhone, setSavingPhone] = useState<boolean>(false)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    offer_amount: "",
    offer_threshold: "",
    price: "",
    category_id: "",
    quantity: "",
    colors: [] as string[],
    size: "",
    weight: "",
    image_url: "",
    delivery_available: false,
    delivery_price: "",
  })
  const [newColor, setNewColor] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalOrders: 0
  })
  const [sellerApproved, setSellerApproved] = useState<boolean | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false)
  const [updatingOrder, setUpdatingOrder] = useState(false)
  const { toast } = useToast()

  // Edit product state
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [editProduct, setEditProduct] = useState({
    title: "",
    description: "",
    offer_amount: "",
    offer_threshold: "",
    price: "",
    category_id: "",
    image_url: "",
    delivery_available: false,
    delivery_price: "",
  })
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null)
  const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (user && products) {
      fetchUserProducts()
      fetchStats()
      fetchSellerApproval()
      fetchSellerPhone()
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
        .select('id, email, name')
        .eq('auth_id', user.id)
        .single()

      if (error) throw error
      setSellerApproved(true) // Temporarily set to true until schema is updated
    } catch (error) {
      console.error('Error fetching seller approval status:', error)
      setSellerApproved(false)
    }
  }

  const fetchSellerPhone = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('users')
        .select('phone_number')
        .eq('auth_id', user.id)
        .single()
      if (error) throw error
      setSellerPhone(data?.phone_number || "")
      setPhoneError(null)
    } catch (e) {
      console.error('Error fetching seller phone:', e)
    }
  }

  const saveSellerPhone = async () => {
    if (!user) return
    setSavingPhone(true)
    try {
      // Basic validation: keep digits, allow optional +, require 8-15 digits
      const digits = (sellerPhone || "").replace(/\D/g, "")
      if (digits && (digits.length < 8 || digits.length > 15)) {
        setPhoneError('Enter 8 to 15 digits (include country code).')
        setSavingPhone(false)
        return
      }
      setPhoneError(null)

      // Normalize to +<digits> for storage if present
      const normalized = digits ? `+${digits}` : null
      const { error } = await supabase
        .from('users')
        .update({ phone_number: normalized })
        .eq('auth_id', user.id)
      if (error) throw error
      setSellerPhone(normalized || "")
      toast({ title: 'Phone updated', description: 'Your WhatsApp number was saved.' })
    } catch (e: any) {
      toast({ title: 'Failed to save phone', description: e?.message || 'Unknown error', variant: 'destructive' })
    } finally {
      setSavingPhone(false)
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
      
      // Calculate real revenue from completed orders
      const completedOrders = orders?.filter(order => order.status === 'completed') || []
      const totalRevenue = completedOrders.reduce((sum, order) => {
        // Find the product that belongs to this seller
        const sellerProduct = order.products.find((p: any) => p.seller_id === userData.id)
        return sum + (sellerProduct ? (sellerProduct.price || 0) : 0)
      }, 0)
      
      const pendingOrders = orders?.filter(order => order.status === 'pending').length || 0
      const completedOrdersCount = completedOrders.length
      const totalOrders = orders?.length || 0

      setStats({
        totalProducts,
        totalRevenue,
        pendingOrders,
        completedOrders: completedOrdersCount,
        totalOrders: totalOrders
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
      offer_amount: "",
      offer_threshold: "",
      price: "", 
      category_id: "", 
      quantity: "", 
      colors: [], 
      size: "", 
      weight: "", 
      image_url: "" 
    })
    setNewColor("")
    setSelectedFiles([])
    setPreviewUrls([])
    setAddOpen(true)
  }

  const handleOpenEdit = (product: Product) => {
    setFormError(null)
    setEditingProductId(product.id)
    setEditProduct({
      title: product.title || "",
      description: product.description || "",
      offer_amount: (() => {
        const m = (product.description || '').match(/\[OFFER\]:[^\n]*amount\s*=\s*([0-9]+(?:\.[0-9]+)?)/i)
        return m ? m[1] : ""
      })(),
      offer_threshold: (() => {
        const m = (product.description || '').match(/\[OFFER\]:[^\n]*threshold\s*=\s*([0-9]+(?:\.[0-9]+)?)/i)
        return m ? m[1] : ""
      })(),
      price: String(product.price ?? ""),
      category_id: product.category_id || "",
      image_url: product.image_url || "",
    })
    setEditSelectedFile(null)
    setEditPreviewUrl(product.image_url || null)
    setEditOpen(true)
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
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setSelectedFiles(files)
      const urls = files.map((f) => URL.createObjectURL(f))
      setPreviewUrls(urls)
    } else {
      setSelectedFiles([])
      setPreviewUrls([])
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
        .select('id, email, name')
        .eq('auth_id', user.id)
        .single()
      if (sellerErr) throw sellerErr
      // Temporarily skip approval check
      // if (!sellerRow?.seller_approved) {
      //   setFormError('Your seller account is pending approval. Please wait for admin approval before posting products.')
      //   setSaving(false)
      //   return
      // }

      const priceNumber = parseFloat(newProduct.price as any)
      const quantityNumber = parseInt(newProduct.quantity as any)
      const weightNumber = parseFloat(newProduct.weight as any)
      
      if (!newProduct.title || isNaN(priceNumber) || !newProduct.category_id) {
        setFormError("Please provide a title, valid price, and select a category.")
        setSaving(false)
        return
      }

      let imageUrl = newProduct.image_url
      let extraImageUrls: string[] = []
      if (selectedFiles.length > 0) {
        setUploading(true)
        const uploaded: string[] = []
        for (const f of selectedFiles) {
          // eslint-disable-next-line no-await-in-loop
          const url = await uploadImage(f)
          uploaded.push(url)
        }
        setUploading(false)
        imageUrl = uploaded[0] || imageUrl
        extraImageUrls = uploaded.slice(1)
      }

      // Get user's internal ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single()
      if (userError) throw userError

      // Create detailed description with all product info
      const colorsText = newProduct.colors.length > 0 ? newProduct.colors.join(', ') : 'Non spécifié'
      const imagesSection = extraImageUrls.length > 0 ? `\n\nImages supplémentaires:\n${extraImageUrls.map(u => `- ${u}`).join('\n')}` : ''
      const offerLine = newProduct.offer_amount && newProduct.offer_threshold
        ? `\n[OFFER]: amount=${newProduct.offer_amount} threshold=${newProduct.offer_threshold}`
        : ''
      const detailedDescription = `${newProduct.description}${offerLine}

Détails du produit:
- Quantité disponible: ${quantityNumber || 'Non spécifié'}
- Couleurs disponibles: ${colorsText}
- Taille: ${newProduct.size || 'Non spécifiée'}
- Poids: ${weightNumber ? `${weightNumber} lbs` : 'Non spécifié'}${imagesSection}`

      const { data: inserted, error: insertError } = await supabase
        .from('products')
        .insert([
          {
            title: newProduct.title,
            description: detailedDescription,
            price: priceNumber,
            image_url: imageUrl || null,
            category_id: newProduct.category_id,
            seller_id: userData.id,
            quantity: isNaN(quantityNumber) ? null : quantityNumber,
            colors: newProduct.colors.length ? newProduct.colors : null,
            size: newProduct.size || null,
            weight: isNaN(weightNumber) ? null : weightNumber,
            delivery_available: newProduct.delivery_available,
            delivery_price: newProduct.delivery_available && newProduct.delivery_price ? parseFloat(newProduct.delivery_price) : null,
          },
        ])
        .select('id')
        .single()

      if (insertError) throw insertError

      // Create offer row if provided
      if (newProduct.offer_amount && newProduct.offer_threshold && inserted?.id) {
        const amountNum = parseFloat(newProduct.offer_amount as any)
        const thresholdNum = parseFloat(newProduct.offer_threshold as any)
        if (!isNaN(amountNum) && !isNaN(thresholdNum)) {
          await supabase.from('offers').insert([
            {
              product_id: inserted.id,
              seller_id: userData.id,
              amount: amountNum,
              threshold: thresholdNum,
              active: true,
            }
          ])
        }
      }

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

  const handleUpdateProduct = async () => {
    if (!user || !editingProductId) return
    setSaving(true)
    setFormError(null)
    try {
      const priceNumber = parseFloat(editProduct.price as any)
      if (!editProduct.title || isNaN(priceNumber) || !editProduct.category_id) {
        setFormError("Veuillez fournir un titre, un prix valide et une catégorie.")
        setSaving(false)
        return
      }

      let imageUrl = editProduct.image_url
      if (editSelectedFile) {
        setUploading(true)
        imageUrl = await uploadImage(editSelectedFile)
        setUploading(false)
      }

      const offerLineEdit = editProduct.offer_amount && editProduct.offer_threshold
        ? `\n[OFFER]: amount=${editProduct.offer_amount} threshold=${editProduct.offer_threshold}`
        : ''
      const newDesc = `${editProduct.description}${offerLineEdit}`
      const { error } = await supabase
        .from('products')
        .update({
          title: editProduct.title,
          description: newDesc,
          price: priceNumber,
          image_url: imageUrl || null,
          category_id: editProduct.category_id,
        })
        .eq('id', editingProductId)

      if (error) throw error

      // Upsert offer
      if (editProduct.offer_amount && editProduct.offer_threshold) {
        const amountNum = parseFloat(editProduct.offer_amount as any)
        const thresholdNum = parseFloat(editProduct.offer_threshold as any)
        if (!isNaN(amountNum) && !isNaN(thresholdNum)) {
          // Resolve seller id again
          const { data: userData2 } = await supabase
            .from('users')
            .select('id')
            .eq('auth_id', user.id)
            .single()
          if (userData2) {
            // If exists, update; else insert
            const { data: existing } = await supabase
              .from('offers')
              .select('id')
              .eq('product_id', editingProductId)
              .limit(1)
            if (existing && existing.length > 0) {
              await supabase
                .from('offers')
                .update({ amount: amountNum, threshold: thresholdNum, active: true })
                .eq('id', existing[0].id)
            } else {
              await supabase
                .from('offers')
                .insert([{ product_id: editingProductId, seller_id: userData2.id, amount: amountNum, threshold: thresholdNum, active: true }])
            }
          }
        }
      }

      toast({ title: "Produit mis à jour" })
      setEditOpen(false)
      setEditingProductId(null)
      await refetch()
      await fetchUserProducts()
    } catch (e: any) {
      setFormError(e?.message || 'Échec de la mise à jour du produit')
    } finally {
      setSaving(false)
      setUploading(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
      if (error) throw error
      toast({ title: 'Produit supprimé' })
      await refetch()
      await fetchUserProducts()
    } catch (e: any) {
      toast({ title: 'Suppression échouée', description: e?.message || 'Erreur inconnue', variant: 'destructive' })
    }
  }

  // Order Management Functions
  const fetchOrders = async () => {
    if (!user) return
    setOrdersLoading(true)
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (userError) throw userError

      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          product:products(*),
          buyer:users!orders_buyer_id_fkey(name, email, phone_number)
        `)
        .eq('seller_id', userData.id)
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError

      setOrders(orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast({ title: 'Erreur', description: 'Impossible de charger les commandes', variant: 'destructive' })
    } finally {
      setOrdersLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    if (!user) return
    setUpdatingOrder(true)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (error) throw error

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))

      // Update stats
      await fetchStats()

      toast({ 
        title: 'Statut mis à jour', 
        description: `La commande est maintenant ${getStatusLabel(newStatus)}` 
      })
    } catch (error) {
      console.error('Error updating order status:', error)
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour le statut', variant: 'destructive' })
    } finally {
      setUpdatingOrder(false)
    }
  }

  const getStatusLabel = (status: Order['status']) => {
    const labels = {
      pending: 'En attente',
      processing: 'En cours de traitement',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    }
    return labels[status] || status
  }

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getNextStatus = (currentStatus: Order['status']): Order['status'] | null => {
    const statusFlow = {
      pending: 'processing' as Order['status'],
      processing: 'shipped' as Order['status'],
      shipped: 'delivered' as Order['status'],
      delivered: null,
      cancelled: null
    }
    return statusFlow[currentStatus] || null
  }

  const getStatusIcon = (status: Order['status']) => {
    const icons = {
      pending: Clock,
      processing: RefreshCw,
      shipped: Truck,
      delivered: CheckCircle,
      cancelled: XCircle
    }
    const Icon = icons[status] || Clock
    return <Icon className="h-4 w-4" />
  }

  // Load orders when component mounts
  useEffect(() => {
    if (user && sellerApproved === true) {
      fetchOrders()
    }
  }, [user, sellerApproved])

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
        <h1 className="text-3xl font-bold text-foreground">Espace Vendeur</h1>
        <p className="text-muted-foreground">Gérez vos produits et suivez vos ventes</p>
      </div>

      {/* Approval Status Banner */}
      {sellerApproved === false && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-800">Compte non approuvé</h3>
                <p className="text-red-700">Votre compte vendeur a été refusé. Vous ne pouvez pas ajouter de produits sans approbation.</p>
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
                <h3 className="font-semibold text-yellow-800">En attente d’approbation</h3>
                <p className="text-yellow-700">Votre compte vendeur est en cours d’examen. Vous pourrez ajouter des produits après approbation.</p>
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
                <h3 className="font-semibold text-green-800">Compte approuvé</h3>
                <p className="text-green-700">Votre compte vendeur est approuvé. Vous pouvez maintenant ajouter et gérer vos produits.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Contact / WhatsApp Settings */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Préférences de contact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="seller-phone">Numéro WhatsApp</Label>
              <Input
                id="seller-phone"
                placeholder="e.g. +509 1234 5678"
                value={sellerPhone}
                onChange={(e) => {
                  setSellerPhone(e.target.value)
                  setPhoneError(null)
                }}
              />
              {phoneError ? (
                <p className="text-xs text-destructive">{phoneError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Incluez l’indicatif du pays. Chiffres seuls ou avec +. Exemple : +50912345678</p>
              )}
            </div>
            <div>
              <Button onClick={saveSellerPhone} disabled={savingPhone}>
                {savingPhone ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Annonces actives</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue}</div>
            <p className="text-xs text-muted-foreground">Gains totaux</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">{stats.pendingOrders} en attente</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes terminées</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedOrders}</div>
            <p className="text-xs text-muted-foreground">Commandes complétées</p>
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
                <h3 className="font-semibold text-yellow-800">Compte en attente d’approbation</h3>
                <p className="text-sm text-yellow-700">Votre compte vendeur est en cours d’examen. Vous pourrez ajouter des produits après approbation.</p>
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
                <h3 className="font-semibold text-green-800">Compte approuvé</h3>
                <p className="text-sm text-green-700">Votre compte vendeur a été approuvé ! Vous pouvez maintenant ajouter et gérer vos produits.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Management Section */}
      {sellerApproved === true && (
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Gestion des commandes
                </CardTitle>
                <CardDescription>Suivez et gérez les commandes de vos produits</CardDescription>
              </div>
              <Button 
                variant="outline" 
                onClick={fetchOrders}
                disabled={ordersLoading}
              >
                {ordersLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Actualiser
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Chargement des commandes...</span>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">Aucune commande</h3>
                <p className="text-sm text-muted-foreground">Vous n'avez pas encore de commandes.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1">{getStatusLabel(order.status)}</span>
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            #{order.id.slice(0, 8)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium">{order.product?.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              Quantité: {order.quantity} × ${order.price_per_unit}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Total: ${order.total_amount}
                            </p>
                            {order.delivery_option === 'delivery' && order.delivery_fee && (
                              <p className="text-sm text-muted-foreground">
                                Livraison: +${order.delivery_fee}
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{order.buyer?.name || 'Client'}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{order.buyer?.email}</span>
                            </div>
                            {order.buyer?.phone_number && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{order.buyer.phone_number}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {order.shipping_address && (
                          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="text-sm font-medium">Adresse de livraison:</p>
                                <p className="text-sm text-muted-foreground">
                                  {typeof order.shipping_address === 'string' 
                                    ? order.shipping_address 
                                    : `${order.shipping_address.address || ''} ${order.shipping_address.city || ''} ${order.shipping_address.postalCode || ''}`.trim()
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-muted-foreground">
                            Commandé le {new Date(order.created_at).toLocaleDateString('fr-FR')}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order)
                                setOrderDetailsOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Détails
                            </Button>
                            {getNextStatus(order.status) && (
                              <Button
                                size="sm"
                                onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                                disabled={updatingOrder}
                              >
                                {updatingOrder ? (
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                  getStatusIcon(getNextStatus(order.status)!)
                                )}
                                <span className="ml-1">
                                  {getNextStatus(order.status) === 'processing' && 'Traiter'}
                                  {getNextStatus(order.status) === 'shipped' && 'Expédier'}
                                  {getNextStatus(order.status) === 'delivered' && 'Marquer livré'}
                                </span>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Order Details Dialog */}
      <Dialog open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la commande</DialogTitle>
            <DialogDescription>
              Commande #{selectedOrder?.id.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Informations produit</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Produit:</span> {selectedOrder.product?.title}</p>
                    <p><span className="font-medium">Quantité:</span> {selectedOrder.quantity}</p>
                    <p><span className="font-medium">Prix unitaire:</span> ${selectedOrder.price_per_unit}</p>
                    <p><span className="font-medium">Total:</span> ${selectedOrder.total_amount}</p>
                    {selectedOrder.delivery_option === 'delivery' && selectedOrder.delivery_fee && (
                      <p><span className="font-medium">Frais de livraison:</span> +${selectedOrder.delivery_fee}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Informations client</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Nom:</span> {selectedOrder.buyer?.name || 'Non fourni'}</p>
                    <p><span className="font-medium">Email:</span> {selectedOrder.buyer?.email}</p>
                    <p><span className="font-medium">Téléphone:</span> {selectedOrder.buyer?.phone_number || 'Non fourni'}</p>
                  </div>
                </div>
              </div>

              {selectedOrder.shipping_address && (
                <div>
                  <h4 className="font-medium mb-3">Adresse de livraison</h4>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm">
                      {typeof selectedOrder.shipping_address === 'string' 
                        ? selectedOrder.shipping_address 
                        : `${selectedOrder.shipping_address.address || ''} ${selectedOrder.shipping_address.city || ''} ${selectedOrder.shipping_address.postalCode || ''}`.trim()
                      }
                    </p>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-3">Statut de la commande</h4>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {getStatusIcon(selectedOrder.status)}
                    <span className="ml-1">{getStatusLabel(selectedOrder.status)}</span>
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Commandé le {new Date(selectedOrder.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <h4 className="font-medium mb-3">Notes</h4>
                  <p className="text-sm text-muted-foreground">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderDetailsOpen(false)}>
              Fermer
            </Button>
            {selectedOrder && getNextStatus(selectedOrder.status) && (
              <Button
                onClick={() => {
                  updateOrderStatus(selectedOrder.id, getNextStatus(selectedOrder.status)!)
                  setOrderDetailsOpen(false)
                }}
                disabled={updatingOrder}
              >
                {updatingOrder ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  getStatusIcon(getNextStatus(selectedOrder.status)!)
                )}
                <span className="ml-1">
                  {getNextStatus(selectedOrder.status) === 'processing' && 'Traiter la commande'}
                  {getNextStatus(selectedOrder.status) === 'shipped' && 'Marquer comme expédiée'}
                  {getNextStatus(selectedOrder.status) === 'delivered' && 'Marquer comme livrée'}
                </span>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Products Section */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Vos produits</CardTitle>
              <CardDescription>Gérez vos annonces</CardDescription>
            </div>
            <Button 
              onClick={handleOpenAdd}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un produit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {userProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun produit pour le moment</h3>
              <p className="text-muted-foreground mb-4">Commencez à vendre en ajoutant votre premier produit</p>
              <Button onClick={handleOpenAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter votre premier produit
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
                        <Badge variant="outline">Actif</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(product)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)}>
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
            <DialogTitle>Ajouter un nouveau produit</DialogTitle>
            <DialogDescription>Entrez tous les détails de votre produit.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prod-title">Titre du produit *</Label>
              <Input id="prod-title" value={newProduct.title} onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })} placeholder="Saisissez le titre du produit" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prod-desc">Description</Label>
              <Textarea id="prod-desc" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="Décrivez votre produit…" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="offer-amount">Remise (montant)</Label>
                <Input id="offer-amount" type="number" step="0.01" value={newProduct.offer_amount} onChange={(e) => setNewProduct({ ...newProduct, offer_amount: e.target.value })} placeholder="ex. 2" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="offer-threshold">Seuil d’achat</Label>
                <Input id="offer-threshold" type="number" step="0.01" value={newProduct.offer_threshold} onChange={(e) => setNewProduct({ ...newProduct, offer_threshold: e.target.value })} placeholder="ex. 15" />
              </div>
              <p className="text-xs text-muted-foreground md:col-span-2">Astuce : Une ligne d’offre sera ajoutée dans la description pour affichage sur la fiche produit.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prod-price">Prix *</Label>
                <Input id="prod-price" type="number" step="0.01" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prod-category">Catégorie *</Label>
                <Select value={newProduct.category_id} onValueChange={(value) => setNewProduct({ ...newProduct, category_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une catégorie" />
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
              <Label htmlFor="prod-quantity">Quantité disponible</Label>
              <Input id="prod-quantity" type="number" value={newProduct.quantity} onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })} placeholder="Combien en stock ?" />
            </div>

            <div className="space-y-2">
              <Label>Couleurs disponibles</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input 
                    value={newColor} 
                    onChange={(e) => setNewColor(e.target.value)} 
                    placeholder="ex. Rouge, Bleu, Noir" 
                    onKeyPress={(e) => e.key === 'Enter' && addColor()}
                  />
                  <Button type="button" onClick={addColor} disabled={!newColor.trim()}>
                    Ajouter une couleur
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
                <Label htmlFor="prod-size">Taille</Label>
                <Input id="prod-size" value={newProduct.size} onChange={(e) => setNewProduct({ ...newProduct, size: e.target.value })} placeholder="ex. S, M, L" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prod-weight">Poids (lbs)</Label>
                <Input id="prod-weight" type="number" step="0.1" value={newProduct.weight} onChange={(e) => setNewProduct({ ...newProduct, weight: e.target.value })} placeholder="0.0" />
              </div>
            </div>

            {/* Delivery Options */}
            <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Options de livraison</h4>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="delivery-available"
                    checked={newProduct.delivery_available}
                    onChange={(e) => setNewProduct({ ...newProduct, delivery_available: e.target.checked })}
                    className="rounded border-border"
                  />
                  <Label htmlFor="delivery-available" className="text-sm font-medium">
                    Proposer la livraison pour ce produit
                  </Label>
                </div>
                
                {newProduct.delivery_available && (
                  <div className="space-y-2">
                    <Label htmlFor="delivery-price">Prix de livraison (USD)</Label>
                    <Input
                      id="delivery-price"
                      type="number"
                      step="0.01"
                      value={newProduct.delivery_price}
                      onChange={(e) => setNewProduct({ ...newProduct, delivery_price: e.target.value })}
                      placeholder="0.00"
                    />
                    <p className="text-xs text-muted-foreground">
                      Les clients pourront choisir entre retrait sur place (gratuit) ou livraison (frais supplémentaires)
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Images du produit</Label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                {previewUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {previewUrls.map((url, idx) => (
                      <div key={idx} className="relative w-24 h-24 border border-border rounded-lg overflow-hidden">
                        <img src={url} alt={`Prévisualisation ${idx+1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedFiles([])
                        setPreviewUrls([])
                      }}
                    >
                      Effacer les images
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Vous pouvez aussi fournir une URL d’image ci‑dessous (utilisée si aucun fichier n’est sélectionné)</p>
              <Input 
                placeholder="https://exemple.com/image.jpg" 
                value={newProduct.image_url} 
                onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })} 
              />
            </div>

            {formError && <p className="text-sm text-destructive">{formError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Annuler</Button>
            <Button onClick={handleSaveProduct} disabled={saving || uploading}>
              {saving ? (uploading ? 'Téléversement…' : 'Enregistrement…') : 'Enregistrer le produit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le produit</DialogTitle>
            <DialogDescription>Mettez à jour les informations du produit.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Titre du produit *</Label>
              <Input id="edit-title" value={editProduct.title} onChange={(e) => setEditProduct({ ...editProduct, title: e.target.value })} placeholder="Saisissez le titre du produit" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Description</Label>
              <Textarea id="edit-desc" value={editProduct.description} onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })} placeholder="Décrivez votre produit…" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-offer-amount">Remise (montant)</Label>
                <Input id="edit-offer-amount" type="number" step="0.01" value={editProduct.offer_amount} onChange={(e) => setEditProduct({ ...editProduct, offer_amount: e.target.value })} placeholder="ex. 2" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-offer-threshold">Seuil d’achat</Label>
                <Input id="edit-offer-threshold" type="number" step="0.01" value={editProduct.offer_threshold} onChange={(e) => setEditProduct({ ...editProduct, offer_threshold: e.target.value })} placeholder="ex. 15" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Prix *</Label>
                <Input id="edit-price" type="number" step="0.01" value={editProduct.price} onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Catégorie *</Label>
                <Select value={editProduct.category_id} onValueChange={(value) => setEditProduct({ ...editProduct, category_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une catégorie" />
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

            {/* Delivery Options for Edit */}
            <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Options de livraison</h4>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-delivery-available"
                    checked={editProduct.delivery_available}
                    onChange={(e) => setEditProduct({ ...editProduct, delivery_available: e.target.checked })}
                    className="rounded border-border"
                  />
                  <Label htmlFor="edit-delivery-available" className="text-sm font-medium">
                    Proposer la livraison pour ce produit
                  </Label>
                </div>
                
                {editProduct.delivery_available && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-delivery-price">Prix de livraison (USD)</Label>
                    <Input
                      id="edit-delivery-price"
                      type="number"
                      step="0.01"
                      value={editProduct.delivery_price}
                      onChange={(e) => setEditProduct({ ...editProduct, delivery_price: e.target.value })}
                      placeholder="0.00"
                    />
                    <p className="text-xs text-muted-foreground">
                      Les clients pourront choisir entre retrait sur place (gratuit) ou livraison (frais supplémentaires)
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Image principale</Label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null
                    setEditSelectedFile(file)
                    setEditPreviewUrl(file ? URL.createObjectURL(file) : editProduct.image_url || null)
                  }}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                {editPreviewUrl && (
                  <div className="relative w-32 h-32 border border-border rounded-lg overflow-hidden">
                    <img src={editPreviewUrl} alt="Aperçu" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Annuler</Button>
            <Button onClick={handleUpdateProduct} disabled={saving || uploading}>
              {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}