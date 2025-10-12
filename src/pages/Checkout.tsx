import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { useCart } from "@/hooks/useCart"
import { useSettings } from "@/hooks/useSettings"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CreditCard, ShoppingBag } from "lucide-react"

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
  const { formatPrice, convertToHtg, t } = useSettings()
  const { toast } = useToast()
  const [productsById, setProductsById] = useState<Record<string, CartProduct>>({})
  const [placing, setPlacing] = useState(false)
  const [customAmount, setCustomAmount] = useState("")
  const [paymentMode, setPaymentMode] = useState<"cart" | "custom">("cart")

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
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to checkout", variant: "destructive" })
      return
    }

    const amount = paymentMode === "custom" 
      ? parseFloat(customAmount) 
      : subtotal

    if (!amount || amount <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" })
      return
    }

    setPlacing(true)
    try {
      let orderIds: string[] = []

      // Only create orders if using cart mode
      if (paymentMode === "cart" && items.length > 0) {
        const { data: buyer, error: buyerErr } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', user.id)
          .single()
        
        if (buyerErr || !buyer) throw new Error('User not found')

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
        orderIds = (inserted || []).map((r: any) => r.id)
      }

      // Convert USD amount to HTG for Bazik payment
      const htgAmount = convertToHtg(amount)
      console.log('Creating Bazik payment for USD amount:', amount, 'converted to HTG:', htgAmount)
      
      // Generate order ID if not provided
      const orderId = orderIds.length > 0 ? orderIds[0] : `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const resp = await fetch('/api/create-bazik-session', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          amount: htgAmount, // Send HTG amount to Bazik
          orderId: orderId,
          currency: 'HTG',
          metadata: { 
            order_ids: orderIds,
            originalUsdAmount: amount, // Keep track of original USD amount
            firstName: 'John',
            lastName: 'Doe',
            email: user.email || 'customer@example.com'
          }
        })
      })

      console.log('Payment API response status:', resp.status)
      const responseText = await resp.text()
      console.log('Payment API raw response:', responseText)

      // Check if response is empty
      if (!responseText || responseText.trim() === '') {
        console.error('Empty response from payment API')
        toast({ 
          title: "Payment Error", 
          description: "Received empty response from payment server. Please try again.", 
          variant: "destructive" 
        })
        return
      }

      let data: any
      try {
        data = JSON.parse(responseText)
        console.log('Parsed payment response:', data)
      } catch (jsonError) {
        console.error('Failed to parse payment response:', jsonError)
        console.error('Raw response that failed to parse:', responseText)
        toast({ 
          title: "Payment Error", 
          description: "Invalid response from payment server. Please try again.", 
          variant: "destructive" 
        })
        return
      }

      if (!resp.ok) {
        const errorMsg = data.error || data.message || 'Failed to create payment'
        console.error('Payment API error:', errorMsg)
        toast({ 
          title: "Payment Failed", 
          description: errorMsg, 
          variant: "destructive" 
        })
        return
      }
      
      // Check if payment was created successfully
      if (data.checkout_url || data.redirect_url) {
        // Clear cart if using cart mode
        if (paymentMode === "cart") {
          await clearCart()
        }
        
        toast({ 
          title: "Redirecting to Payment", 
          description: "Redirecting to secure payment page..." 
        })
        
        // Redirect to Bazik checkout page
        window.location.href = data.checkout_url || data.redirect_url
      } else {
        console.error('No checkout URL received:', data)
        toast({ 
          title: "Payment Error", 
          description: "No payment URL received. Please try again.", 
          variant: "destructive" 
        })
      }
    } catch (e: any) {
      console.error('Payment error:', e)
      toast({ 
        title: "Payment Failed", 
        description: e.message || "Payment failed, please try again",
        variant: "destructive" 
      })
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
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Checkout</h1>
          <p className="text-muted-foreground">Complete your purchase securely with Bazik</p>
        </div>

        {/* Payment Mode Selector */}
        <div className="flex justify-center gap-4">
          <Button
            variant={paymentMode === "cart" ? "default" : "outline"}
            onClick={() => setPaymentMode("cart")}
            disabled={items.length === 0}
            className="gap-2"
          >
            <ShoppingBag className="h-4 w-4" />
            Cart Items
          </Button>
          <Button
            variant={paymentMode === "custom" ? "default" : "outline"}
            onClick={() => setPaymentMode("custom")}
            className="gap-2"
          >
            <CreditCard className="h-4 w-4" />
            Custom Amount
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Items or Custom Amount */}
          <div className="lg:col-span-2">
            {paymentMode === "cart" ? (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Your Items</h2>
                {items.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground mb-4">Your cart is empty</p>
                      <Button onClick={() => navigate('/marketplace')}>Browse Products</Button>
                    </CardContent>
                  </Card>
                ) : (
                  items.map((i) => (
                    <Card key={i.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <img 
                            src={i.product!.image_url || '/placeholder.svg'} 
                            alt={i.product!.title} 
                            className="w-20 h-20 object-cover rounded-lg" 
                          />
                          <div className="flex-1">
                            <h3 className="font-medium">{i.product!.title}</h3>
                            <p className="text-sm text-muted-foreground">Quantity: {i.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">{formatPrice(i.product!.price * i.quantity)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Enter Payment Amount</CardTitle>
                  <CardDescription>Enter the amount you wish to pay in USD</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (USD)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      min="0.01"
                      step="0.01"
                      className="text-2xl font-semibold h-16"
                    />
                  </div>
                  {customAmount && parseFloat(customAmount) > 0 && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700">
                        <strong>You will pay: {convertToHtg(parseFloat(customAmount)).toLocaleString()} HTG</strong>
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Exchange rate: 1 USD = 132 HTG
                      </p>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Enter any amount you'd like to pay. Minimum: $0.01
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Side - Payment Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal (USD)</span>
                    <span className="font-medium">
                      {paymentMode === "custom" 
                        ? `$${customAmount || 0}` 
                        : `$${subtotal.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount to Pay (HTG)</span>
                    <span className="font-medium text-green-600">
                      {paymentMode === "custom" 
                        ? `${convertToHtg(parseFloat(customAmount) || 0).toLocaleString()} HTG` 
                        : `${convertToHtg(subtotal).toLocaleString()} HTG`}
                    </span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">You will pay</span>
                      <span className="font-bold text-xl text-green-600">
                        {paymentMode === "custom" 
                          ? `${convertToHtg(parseFloat(customAmount) || 0).toLocaleString()} HTG` 
                          : `${convertToHtg(subtotal).toLocaleString()} HTG`}
                      </span>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={placeOrder} 
                  disabled={placing || (paymentMode === "cart" && items.length === 0) || (paymentMode === "custom" && !customAmount)}
                  className="w-full h-12 text-lg"
                  size="lg"
                >
                  {placing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      Pay Now
                    </>
                  )}
                </Button>

                <div className="text-xs text-center text-muted-foreground space-y-1">
                  <p>🔒 Secured by Bazik Payment Gateway</p>
                  <p>Your payment information is encrypted and secure</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}


