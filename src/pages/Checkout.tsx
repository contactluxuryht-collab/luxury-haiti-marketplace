import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { useCart } from "@/hooks/useCart"
import { useSettings } from "@/hooks/useSettings"

type CartProduct = {
  id: string
  title: string
  price: number
  image_url: string | null
  seller_id: string
}

export default function Checkout() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { cartItems, loading, refetch, clearCart } = useCart()
  const { formatPrice, t } = useSettings()
  const [productsById, setProductsById] = useState<Record<string, CartProduct>>({})
  const [placing, setPlacing] = useState(false)

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

  const placeOrder = async () => {
    if (!user || items.length === 0) return
    setPlacing(true)
    try {
      // Resolve buyer internal id
      const { data: buyer, error: buyerErr } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single()
      if (buyerErr || !buyer) throw buyerErr || new Error('No buyer')

      // Insert one order row per cart item (simple MVP)
      const rows = items.map((i) => ({
        buyer_id: buyer.id,
        seller_id: i.product!.seller_id,
        product_id: i.product_id,
        quantity: i.quantity,
        price_per_unit: i.product!.price,
        total_amount: i.product!.price * i.quantity,
        status: 'pending',
        payment_status: 'pending',
      }))
      const { data: inserted, error } = await supabase.from('orders').insert(rows).select('id')
      if (error) throw error

      // Create Bazik session via Netlify function
      const resp = await fetch('/.netlify/functions/create-bazik-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currency: 'USD',
          items: items.map(i => ({ name: i.product!.title, quantity: i.quantity, amount: i.product!.price })),
          success_url: window.location.origin + '/profile',
          cancel_url: window.location.origin + '/checkout',
          metadata: { order_ids: (inserted || []).map((r: any) => r.id) }
        })
      })
      if (!resp.ok) throw new Error('Failed to create Bazik session')
      const session = await resp.json()
      const redirectUrl = session?.url || session?.checkout_url || session?.data?.url
      if (redirectUrl) {
        window.location.assign(redirectUrl)
      } else {
        // Fallback: if no URL, clear cart and go to profile
        await clearCart()
        navigate('/profile')
      }
    } catch (e) {
      // no-op (could toast)
    } finally {
      setPlacing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading') || 'Loading…'}</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button onClick={() => navigate('/marketplace')}>{t('continue_shopping') || 'Continue shopping'}</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
        <p className="text-muted-foreground">Review your items and place your order</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {items.map((i) => (
            <div key={i.id} className="flex items-center gap-4 p-4 border border-border rounded-lg">
              <img src={i.product!.image_url || '/placeholder.svg'} alt={i.product!.title} className="w-20 h-20 object-cover rounded" />
              <div className="flex-1">
                <div className="font-medium">{i.product!.title}</div>
                <div className="text-sm text-muted-foreground">Qty: {i.quantity}</div>
              </div>
              <div className="text-right font-semibold">{formatPrice(i.product!.price * i.quantity)}</div>
            </div>
          ))}
        </div>
        <div className="space-y-3 p-4 border border-border rounded-lg h-fit">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold">{formatPrice(subtotal)}</span>
          </div>
          <div className="text-xs text-muted-foreground">Taxes and shipping calculated at next step.</div>
          <Button className="w-full" onClick={placeOrder} disabled={placing}>{placing ? 'Placing…' : 'Place order'}</Button>
        </div>
      </div>
    </div>
  )
}


