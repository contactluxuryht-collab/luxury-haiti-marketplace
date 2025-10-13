import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { useSettings } from '@/hooks/useSettings'
import { supabase } from '@/integrations/supabase/client'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

type CartProduct = {
  id: string
  title: string
  price: number
  image_url: string | null
  seller_id: string
}

export default function Cart() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { cartItems, loading, updateQuantity, removeFromCart, clearCart, refetch } = useCart()
  const { formatPrice, t } = useSettings()
  const { toast } = useToast()
  const [productsById, setProductsById] = useState<Record<string, CartProduct>>({})
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    const loadProducts = async () => {
      if (cartItems.length === 0) {
        setProductsById({})
        return
      }
      const productIds = [...new Set(cartItems.map((c) => c.product_id))]
      const { data } = await supabase
        .from('products')
        .select('id, title, price, image_url, seller_id')
        .in('id', productIds)
        .eq('is_active', true)
      const map: Record<string, CartProduct> = {}
      ;(data || []).forEach((p: any) => { map[p.id] = p })
      setProductsById(map)
    }
    loadProducts()
  }, [cartItems])

  const items = useMemo(() => cartItems.map(ci => ({
    ...ci,
    product: productsById[ci.product_id]
  })).filter(i => !!i.product), [cartItems, productsById])

  const subtotal = items.reduce((sum, i) => sum + (i.product!.price * i.quantity), 0)

  const handleQuantityChange = async (cartItemId: string, newQuantity: number) => {
    setUpdating(cartItemId)
    try {
      await updateQuantity(cartItemId, newQuantity)
    } finally {
      setUpdating(null)
    }
  }

  const handleRemoveItem = async (cartItemId: string) => {
    setUpdating(cartItemId)
    try {
      await removeFromCart(cartItemId)
    } finally {
      setUpdating(null)
    }
  }

  const handleClearCart = async () => {
    await clearCart()
  }

  const handleCheckout = () => {
    navigate('/checkout')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement du panier...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Mon Panier</h1>
        {items.length > 0 && (
          <Badge variant="secondary" className="text-sm">
            {items.length} article{items.length > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {items.length === 0 ? (
        <Card className="max-w-md mx-auto">
          <CardContent className="py-12 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Votre panier est vide</h3>
            <p className="text-muted-foreground mb-6">
              Découvrez nos produits et ajoutez-les à votre panier
            </p>
            <Button onClick={() => navigate('/marketplace')} className="w-full">
              Parcourir les produits
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <img 
                      src={item.product!.image_url || '/placeholder.svg'} 
                      alt={item.product!.title} 
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-lg truncate">{item.product!.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Prix unitaire: {formatPrice(item.product!.price)}
                      </p>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={updating === item.id || item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {updating === item.id ? '...' : item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={updating === item.id}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {/* Price */}
                    <div className="text-right min-w-0">
                      <p className="font-semibold text-lg">
                        {formatPrice(item.product!.price * item.quantity)}
                      </p>
                    </div>
                    
                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={updating === item.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Clear Cart Button */}
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={handleClearCart}
                className="text-destructive hover:text-destructive"
              >
                Vider le panier
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Résumé de la commande</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Sous-total ({items.length} article{items.length > 1 ? 's' : ''})</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Livraison</span>
                  <span className="text-muted-foreground">Calculée à l'étape suivante</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                </div>
                <Button 
                  onClick={handleCheckout} 
                  className="w-full"
                  size="lg"
                >
                  Passer la commande
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/marketplace')} 
                  className="w-full"
                >
                  Continuer mes achats
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
