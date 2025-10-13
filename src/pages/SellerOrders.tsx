import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ShoppingCart, CheckCircle, XCircle, Truck, MapPin, Clock, User, Mail, Phone, RefreshCw } from "lucide-react"

interface OrderRow {
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
  product?: {
    title: string
  }
  buyer?: {
    name: string
    email: string
    phone_number?: string
  }
  delivery_option?: 'pickup' | 'delivery'
  delivery_fee?: number
}

export default function SellerOrders() {
  const { user, loading } = useAuth()
  const { toast } = useToast()
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [updatingOrder, setUpdatingOrder] = useState(false)

  useEffect(() => {
    if (user) fetchOrders()
  }, [user])

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
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError
      setOrders(orders || [])
    } catch (e) {
      toast({ title: 'Erreur', description: 'Impossible de charger les commandes', variant: 'destructive' })
    } finally {
      setOrdersLoading(false)
    }
  }

  const getStatusLabel = (status: OrderRow['status']) => ({
    pending: 'En attente',
    processing: 'En cours de traitement',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
  }[status] || status)

  const getStatusColor = (status: OrderRow['status']) => ({
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }[status] || 'bg-gray-100 text-gray-800')

  const getStatusIcon = (status: OrderRow['status']) => {
    const icons = { pending: Clock, processing: RefreshCw, shipped: Truck, delivered: CheckCircle, cancelled: XCircle }
    const Icon = (icons as any)[status] || Clock
    return <Icon className="h-4 w-4" />
  }

  const getNextStatus = (current: OrderRow['status']): OrderRow['status'] | null => {
    const flow = { pending: 'processing', processing: 'shipped', shipped: 'delivered', delivered: null, cancelled: null } as const
    return (flow as any)[current] || null
  }

  const updateOrderStatus = async (orderId: string, newStatus: OrderRow['status']) => {
    if (!user) return
    setUpdatingOrder(true)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)
      if (error) throw error
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      toast({ title: 'Statut mis à jour', description: `La commande est maintenant ${getStatusLabel(newStatus)}` })
    } catch {
      toast({ title: 'Erreur', description: 'Mise à jour du statut impossible', variant: 'destructive' })
    } finally {
      setUpdatingOrder(false)
    }
  }

  if (loading) {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <ShoppingCart className="h-7 w-7" />
            Gestion des commandes
          </h1>
          <p className="text-muted-foreground">Traitez vos commandes sur une page dédiée</p>
        </div>
        <Button variant="outline" onClick={fetchOrders} disabled={ordersLoading}>
          {ordersLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Actualiser
        </Button>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Commandes</CardTitle>
          <CardDescription>Toutes vos commandes récentes</CardDescription>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
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
                        <span className="text-sm text-muted-foreground">#{order.id.slice(0, 8)}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium">{order.product?.title}</h4>
                          <p className="text-sm text-muted-foreground">Quantité: {order.quantity} × ${order.price_per_unit}</p>
                          <p className="text-sm text-muted-foreground">Total: ${order.total_amount}</p>
                          {order.delivery_option === 'delivery' && order.delivery_fee && (
                            <p className="text-sm text-muted-foreground">Livraison: +${order.delivery_fee}</p>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1"><User className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{order.buyer?.name || 'Client'}</span></div>
                          <div className="flex items-center gap-2 mb-1"><Mail className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">{order.buyer?.email}</span></div>
                          {order.buyer?.phone_number && (
                            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">{order.buyer.phone_number}</span></div>
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
                                {typeof order.shipping_address === 'string' ? order.shipping_address : `${order.shipping_address.address || ''} ${order.shipping_address.city || ''} ${order.shipping_address.postalCode || ''}`.trim()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-muted-foreground">Commandé le {new Date(order.created_at).toLocaleDateString('fr-FR')}</span>
                        <div className="flex items-center gap-2">
                          {getNextStatus(order.status) && (
                            <Button size="sm" onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)} disabled={updatingOrder}>
                              {updatingOrder ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : getStatusIcon(getNextStatus(order.status)!)}
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
    </div>
  )
}


