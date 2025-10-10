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
  AlertCircle,
  Settings,
  BarChart3,
  FileText,
  CreditCard,
  Bell,
  Database,
  Lock,
  Palette,
  Calendar,
  Clock,
  Eye,
  Download,
  Upload,
  RefreshCw,
  Search,
  Filter,
  MoreHorizontal,
  Star,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Wifi,
  Server,
  HardDrive,
  Cpu,
  MemoryStick,
  Zap,
  Target,
  TrendingDown,
  Minus,
  ArrowUp,
  ArrowDown,
  Equal,
  PieChart,
  LineChart,
  AreaChart
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
    totalRevenue: 0,
    monthlyRevenue: 0,
    weeklyOrders: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    totalCategories: 0,
    systemUptime: 0,
    activeUsers: 0,
    newUsersToday: 0,
    pendingReviews: 0,
    lowStockProducts: 0,
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
  const [orders, setOrders] = useState<any[]>([])
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [systemSettings, setSystemSettings] = useState({
    siteName: "Luxury Haiti Marketplace",
    siteDescription: "Marché Premium Haïtien",
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    maxFileSize: 10,
    supportedFormats: "jpg,png,gif,webp",
    currency: "USD",
    timezone: "America/Port-au-Prince",
    language: "fr",
    theme: "light",
    analyticsEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
  })
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [backupStatus, setBackupStatus] = useState({
    lastBackup: null,
    nextBackup: null,
    status: "healthy",
    size: "0 MB"
  })
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
      fetchOrders()
      fetchAllUsers()
      fetchNotifications()
      fetchAuditLogs()
      
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
      const productsWithActive = products.map(p => ({ 
        ...p, 
        is_active: true // Default to active since the Product type doesn't include this field yet
      }))
      setAllProducts(productsWithActive)
    }
  }, [products])

  const fetchOverview = async () => {
    try {
      // Users
      const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true })
      const { count: sellersCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'seller')
      const { data: pendingData } = await supabase.from('users').select('id, email, name, role, business_name').eq('role', 'seller')
      const pending = (pendingData || []).filter((r: any) => !r.seller_approved).length
      
      // Products
      const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact', head: true })
      const { count: activeProductsCount } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true)
      const { count: inactiveProductsCount } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', false)
      
      // Orders and Revenue
      const { count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true })
      const { data: ordersData } = await supabase.from('orders').select('total_amount, created_at')
      const totalRevenue = ordersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
      
      // Monthly revenue (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const monthlyOrders = ordersData?.filter(order => 
        new Date(order.created_at) >= thirtyDaysAgo
      ) || []
      const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
      
      // Weekly orders (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const weeklyOrders = ordersData?.filter(order => 
        new Date(order.created_at) >= sevenDaysAgo
      ).length || 0
      
      // Average order value
      const averageOrderValue = ordersCount > 0 ? totalRevenue / ordersCount : 0
      
      // Categories
      const { count: categoriesCount } = await supabase.from('categories').select('*', { count: 'exact', head: true })
      
      // Today's new users
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { count: newUsersToday } = await supabase.from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())
      
      // Active users (last 7 days)
      const { count: activeUsers } = await supabase.from('users')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', sevenDaysAgo.toISOString())
      
      // Reviews
      const { count: pendingReviews } = await supabase.from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
      
      setStats({
        totalUsers: usersCount || 0,
        totalSellers: sellersCount || 0,
        pendingSellers: pending || 0,
        totalProducts: productsCount || 0,
        totalOrders: ordersCount || 0,
        activeProducts: activeProductsCount || 0,
        inactiveProducts: inactiveProductsCount || 0,
        totalRevenue: totalRevenue,
        monthlyRevenue: monthlyRevenue,
        weeklyOrders: weeklyOrders,
        averageOrderValue: averageOrderValue,
        conversionRate: usersCount > 0 ? (ordersCount / usersCount) * 100 : 0,
        totalCategories: categoriesCount || 0,
        systemUptime: 99.9, // Mock data
        activeUsers: activeUsers || 0,
        newUsersToday: newUsersToday || 0,
        pendingReviews: pendingReviews || 0,
        lowStockProducts: 0, // Mock data
      })
    } catch (error) {
      console.error('Error fetching overview:', error)
    }
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
        setSellers(data || [])
      }
    } catch (err: any) {
      console.error('Fetch sellers error:', err)
      toast({ title: 'Error', description: 'Failed to fetch sellers: ' + err.message, variant: 'destructive' })
      setSellers([])
    }
  }

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          buyer:users!orders_buyer_id_fkey(name, email),
          seller:users!orders_seller_id_fkey(name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (error) {
        console.error('Error fetching orders:', error)
        setOrders([])
      } else {
        setOrders(data || [])
      }
    } catch (err: any) {
      console.error('Fetch orders error:', err)
      setOrders([])
    }
  }

  const fetchAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, auth_id, email, name, role, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(100)
      
      if (error) {
        console.error('Error fetching users:', error)
        setAllUsers([])
      } else {
        setAllUsers(data || [])
      }
    } catch (err: any) {
      console.error('Fetch users error:', err)
      setAllUsers([])
    }
  }

  const fetchNotifications = async () => {
    try {
      // Mock notifications for now
      const mockNotifications = [
        {
          id: '1',
          type: 'new_seller',
          title: 'Nouveau vendeur en attente',
          message: 'John Doe souhaite devenir vendeur',
          created_at: new Date().toISOString(),
          read: false
        },
        {
          id: '2',
          type: 'low_stock',
          title: 'Stock faible',
          message: 'Le produit "iPhone 15" est en rupture de stock',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          read: false
        },
        {
          id: '3',
          type: 'system',
          title: 'Maintenance programmée',
          message: 'Maintenance système prévue demain à 2h00',
          created_at: new Date(Date.now() - 7200000).toISOString(),
          read: true
        }
      ]
      setNotifications(mockNotifications)
    } catch (err: any) {
      console.error('Fetch notifications error:', err)
      setNotifications([])
    }
  }

  const fetchAuditLogs = async () => {
    try {
      // Mock audit logs for now
      const mockLogs = [
        {
          id: '1',
          user_id: user?.id,
          action: 'LOGIN',
          resource: 'admin_dashboard',
          details: 'Admin login successful',
          ip_address: '192.168.1.100',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          user_id: user?.id,
          action: 'UPDATE',
          resource: 'seller_approval',
          details: 'Approved seller: john@example.com',
          ip_address: '192.168.1.100',
          created_at: new Date(Date.now() - 1800000).toISOString()
        },
        {
          id: '3',
          user_id: user?.id,
          action: 'DELETE',
          resource: 'product',
          details: 'Deleted product: iPhone 14',
          ip_address: '192.168.1.100',
          created_at: new Date(Date.now() - 3600000).toISOString()
        }
      ]
      setAuditLogs(mockLogs)
    } catch (err: any) {
      console.error('Fetch audit logs error:', err)
      setAuditLogs([])
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
          <p>Chargement du tableau de bord administrateur…</p>
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
          <h2 className="text-2xl font-bold text-red-600 mb-2">Accès refusé</h2>
          <p className="text-muted-foreground mb-4">Vous devez avoir les privilèges administrateur pour accéder à cette page.</p>
          <p className="text-sm text-muted-foreground">Rôle utilisateur : {(user.user_metadata as any)?.role || 'aucun'}</p>
          <Button onClick={() => window.location.href = '/admin/login'} className="mt-4">
            Aller à la connexion admin
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
            Tableau de bord Admin
          </h1>
          <p className="text-muted-foreground text-lg">Gérez votre marché avec un contrôle complet</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setShowAddProduct(true)} className="bg-gradient-primary hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un produit
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card className="border-border/50 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +{stats.newUsersToday} aujourd'hui
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Utilisateurs actifs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Derniers 7 jours
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total produits</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeProducts} actifs, {stats.inactiveProducts} inactifs
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total commandes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {stats.weeklyOrders} cette semaine
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenus totaux</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              ${stats.monthlyRevenue.toLocaleString()} ce mois
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vendeurs en attente</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.pendingSellers}</div>
            <p className="text-xs text-muted-foreground">
              En attente d'approbation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Panier moyen</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${stats.averageOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Valeur moyenne par commande
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taux de conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Utilisateurs → Commandes
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Catégories</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalCategories}</div>
            <p className="text-xs text-muted-foreground">
              Catégories actives
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Disponibilité</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.systemUptime}%</div>
            <p className="text-xs text-muted-foreground">
              Temps de fonctionnement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="sellers">Vendeurs</TabsTrigger>
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="orders">Commandes</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border/50 hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Bell className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Notifications</h3>
                    <p className="text-sm text-muted-foreground">{notifications.filter(n => !n.read).length} non lues</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Analytics</h3>
                    <p className="text-sm text-muted-foreground">Voir les rapports</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Database className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Sauvegarde</h3>
                    <p className="text-sm text-muted-foreground">Dernière: {backupStatus.lastBackup || 'Jamais'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Settings className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Configuration</h3>
                    <p className="text-sm text-muted-foreground">Paramètres système</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Aperçu financier
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Revenus totaux</span>
                    <span className="font-semibold text-lg">${stats.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Ce mois</span>
                    <span className="font-medium">${stats.monthlyRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Panier moyen</span>
                    <span className="font-medium">${stats.averageOrderValue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Commandes totales</span>
                    <span className="font-medium">{stats.totalOrders}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Taux de conversion</span>
                      <Badge variant="secondary">{stats.conversionRate.toFixed(1)}%</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activité récente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Shield className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{log.details}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="outline">{log.action}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sellers" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestion des vendeurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Spécialité</TableHead>
                    <TableHead>Statut</TableHead>
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
                            Approuvé
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            <XCircle className="h-3 w-3" />
                            En attente
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
                                Approuvé
                              </Badge>
                            ) : s.seller_approved === false ? (
                              <Badge variant="destructive">
                                <XCircle className="h-3 w-3 mr-1" />
                                Refusé
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                En attente
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
                              Approuver
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => updateApproval(s.id, false)} 
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Refuser
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => closeSellerAccount(s.id)} 
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <Shield className="h-3 w-3 mr-1" />
                              Fermer
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
                Gestion des produits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Vendeur</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Statut</TableHead>
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
                            Actif
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            <XCircle className="h-3 w-3" />
                            Inactif
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => toggleProductStatus(product.id, product.is_active || false)}
                        >
                          {product.is_active ? 'Désactiver' : 'Activer'}
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

        <TabsContent value="orders" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Gestion des commandes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Commande</TableHead>
                    <TableHead>Acheteur</TableHead>
                    <TableHead>Vendeur</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.buyer?.name || 'Inconnu'}</div>
                          <div className="text-sm text-muted-foreground">{order.buyer?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.seller?.name || 'Inconnu'}</div>
                          <div className="text-sm text-muted-foreground">{order.seller?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">${order.total_amount?.toLocaleString() || '0'}</TableCell>
                      <TableCell>
                        <Badge variant={order.status === 'completed' ? 'default' : 'outline'}>
                          {order.status || 'En attente'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          Voir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestion des utilisateurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Inscription</TableHead>
                    <TableHead>Dernière activité</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name || '—'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : user.role === 'seller' ? 'secondary' : 'outline'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(user.updated_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          Voir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Settings */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Paramètres système
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Nom du site</Label>
                  <Input 
                    id="siteName"
                    value={systemSettings.siteName} 
                    onChange={(e) => setSystemSettings({...systemSettings, siteName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Description du site</Label>
                  <Textarea 
                    id="siteDescription"
                    value={systemSettings.siteDescription} 
                    onChange={(e) => setSystemSettings({...systemSettings, siteDescription: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Devise</Label>
                  <Select value={systemSettings.currency} onValueChange={(value) => setSystemSettings({...systemSettings, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="HTG">HTG (G)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuseau horaire</Label>
                  <Select value={systemSettings.timezone} onValueChange={(value) => setSystemSettings({...systemSettings, timezone: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Port-au-Prince">Port-au-Prince (GMT-5)</SelectItem>
                      <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                      <SelectItem value="Europe/Paris">Paris (GMT+1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Sauvegarder les paramètres
                </Button>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Sécurité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mode maintenance</Label>
                    <p className="text-sm text-muted-foreground">Désactiver l'accès public</p>
                  </div>
                  <Button 
                    variant={systemSettings.maintenanceMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSystemSettings({...systemSettings, maintenanceMode: !systemSettings.maintenanceMode})}
                  >
                    {systemSettings.maintenanceMode ? "Actif" : "Inactif"}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Inscription autorisée</Label>
                    <p className="text-sm text-muted-foreground">Permettre les nouveaux comptes</p>
                  </div>
                  <Button 
                    variant={systemSettings.allowRegistration ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSystemSettings({...systemSettings, allowRegistration: !systemSettings.allowRegistration})}
                  >
                    {systemSettings.allowRegistration ? "Autorisé" : "Interdit"}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Vérification email</Label>
                    <p className="text-sm text-muted-foreground">Exiger la vérification</p>
                  </div>
                  <Button 
                    variant={systemSettings.requireEmailVerification ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSystemSettings({...systemSettings, requireEmailVerification: !systemSettings.requireEmailVerification})}
                  >
                    {systemSettings.requireEmailVerification ? "Requis" : "Optionnel"}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Analytics</Label>
                    <p className="text-sm text-muted-foreground">Collecter les données</p>
                  </div>
                  <Button 
                    variant={systemSettings.analyticsEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSystemSettings({...systemSettings, analyticsEnabled: !systemSettings.analyticsEnabled})}
                  >
                    {systemSettings.analyticsEnabled ? "Activé" : "Désactivé"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Management */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Gestion des catégories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Catégories existantes</h4>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une catégorie
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {allProducts.filter(p => p.category_id === category.id).length} produits
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Backup & Maintenance */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Sauvegarde et maintenance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Sauvegarde automatique</h4>
                  <p className="text-sm text-muted-foreground">Dernière: {backupStatus.lastBackup || 'Jamais'}</p>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Créer une sauvegarde
                  </Button>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Cache système</h4>
                  <p className="text-sm text-muted-foreground">Nettoyer le cache</p>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Vider le cache
                  </Button>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Logs système</h4>
                  <p className="text-sm text-muted-foreground">Consulter les logs</p>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Voir les logs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Product Dialog */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ajouter un produit</DialogTitle>
            <DialogDescription>
              Créer un nouveau produit pour le marché
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre du produit</Label>
              <Input 
                id="title"
                value={newProduct.title} 
                onChange={(e) => setNewProduct({...newProduct, title: e.target.value})}
                placeholder="Saisissez le titre du produit"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                value={newProduct.description} 
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                placeholder="Saisissez la description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Prix ($)</Label>
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
                <Label htmlFor="category">Catégorie</Label>
                <Select value={newProduct.category_id} onValueChange={(value) => setNewProduct({...newProduct, category_id: value})}>
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
              <Label htmlFor="image">URL de l’image</Label>
              <Input 
                id="image"
                value={newProduct.image_url} 
                onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})}
                placeholder="https://exemple.com/image.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddProduct(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddProduct} disabled={saving}>
              {saving ? 'Ajout…' : 'Ajouter le produit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


