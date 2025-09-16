import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Navigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, Package, DollarSign, ShoppingCart, Edit, Trash2 } from "lucide-react"
import { useProducts } from "@/hooks/useProducts"

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
  const [userProducts, setUserProducts] = useState<Product[]>([])
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalRevenue: 0,
    pendingOrders: 0
  })
  const { toast } = useToast()

  useEffect(() => {
    if (user && products) {
      fetchUserProducts()
      fetchStats()
    }
  }, [user, products])

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

      {/* Products Section */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Products</CardTitle>
              <CardDescription>Manage your product listings</CardDescription>
            </div>
            <Button>
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
              <Button>
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
    </div>
  )
}