import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface PaymentButtonProps {
  amount: number
  orderId?: string
  metadata?: {
    firstName?: string
    lastName?: string
    email?: string
    [key: string]: any
  }
  onSuccess?: () => void
  onError?: (error: string) => void
}

/**
 * PaymentButton Component
 * 
 * Integrates with Bazik MonCash payment via Vercel API routes
 * 
 * Flow:
 * 1. User clicks "Pay with Bazik" button
 * 2. Calls /api/create-bazik-session
 * 3. Receives Bazik checkout URL
 * 4. Redirects user to Bazik payment page
 * 5. After payment, Bazik calls webhook (/api/payment-callback)
 * 6. Webhook updates order status in Supabase
 * 7. User returns to success page
 */
export function PaymentButton({ 
  amount, 
  orderId, 
  metadata = {},
  onSuccess,
  onError
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handlePayment = async () => {
    setLoading(true)
    
    try {
      console.log('Initiating Bazik payment for amount:', amount)
      
      // Call Vercel API route to create Bazik payment session
      const response = await fetch('/api/create-bazik-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency: 'HTG',
          metadata: {
            ...metadata,
            orderId,
          }
        })
      })

      const data = await response.json()
      console.log('Bazik payment response:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Payment creation failed')
      }

      // Check if we got a payment URL from Bazik
      if (data.paymentUrl || data.payment_url || data.url) {
        const paymentUrl = data.paymentUrl || data.payment_url || data.url
        console.log('Redirecting to Bazik payment page:', paymentUrl)
        
        // Redirect to Bazik payment page
        window.location.href = paymentUrl
        
        if (onSuccess) onSuccess()
      } else {
        console.error('No payment URL in response:', data)
        throw new Error('No payment URL received from Bazik')
      }

    } catch (error: any) {
      console.error('Payment error:', error)
      
      toast({
        title: 'Payment Error',
        description: error.message || 'Failed to initiate payment. Please try again.',
        variant: 'destructive',
      })
      
      if (onError) onError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={loading}
      size="lg"
      className="w-full"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        'Pay with Bazik MonCash'
      )}
    </Button>
  )
}
