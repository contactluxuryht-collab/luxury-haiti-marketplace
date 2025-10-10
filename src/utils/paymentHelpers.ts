// Helper function to verify payment status using Vercel API
export async function verifyPayment(orderId: string) {
  try {
    console.log('Verifying payment for order:', orderId)
    
    const resp = await fetch(`/api/verify-payment?order_id=${encodeURIComponent(orderId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const responseText = await resp.text()
    console.log('Verification response:', responseText)

    if (!responseText || responseText.trim() === '') {
      throw new Error('Empty response from verification API')
    }

    let data: any
    try {
      data = JSON.parse(responseText)
    } catch (jsonError) {
      console.error('Failed to parse verification response:', jsonError)
      throw new Error('Invalid verification response')
    }

    if (!resp.ok) {
      throw new Error(data.error || data.message || 'Payment verification failed')
    }

    return {
      success: true,
      verified: data.verified || false,
      status: data.status,
      amount: data.amount,
      currency: data.currency,
      transaction_id: data.transaction_id,
      payment_date: data.payment_date,
      order_id: data.order_id
    }

  } catch (error) {
    console.error('Payment verification error:', error)
    return {
      success: false,
      error: error.message || 'Payment verification failed'
    }
  }
}

// Helper function to safely access DOM elements
export function safeGetElement(selector: string): Element | null {
  try {
    return document.querySelector(selector)
  } catch (error) {
    console.error('Error accessing DOM element:', error)
    return null
  }
}

// Helper function to safely get attribute from element
export function safeGetAttribute(element: Element | null, attribute: string): string | null {
  if (!element) {
    console.warn('Element is null, cannot get attribute:', attribute)
    return null
  }
  
  try {
    return element.getAttribute(attribute)
  } catch (error) {
    console.error('Error getting attribute:', error)
    return null
  }
}

// Helper function to create payment session
export async function createPaymentSession(paymentData: {
  amount: number;
  orderId: string;
  currency?: string;
  metadata?: any;
}) {
  try {
    console.log('Creating payment session:', paymentData)
    
    const resp = await fetch('/api/create-bazik-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    })

    const responseText = await resp.text()
    console.log('Payment session response:', responseText)

    if (!responseText || responseText.trim() === '') {
      throw new Error('Empty response from payment API')
    }

    let data: any
    try {
      data = JSON.parse(responseText)
    } catch (jsonError) {
      console.error('Failed to parse payment response:', jsonError)
      throw new Error('Invalid payment response')
    }

    if (!resp.ok) {
      throw new Error(data.error || data.message || 'Payment creation failed')
    }

    return {
      success: true,
      checkout_url: data.checkout_url,
      transaction_id: data.transaction_id,
      amount: data.amount,
      currency: data.currency,
      order_id: data.order_id,
      status: data.status
    }

  } catch (error) {
    console.error('Payment session creation error:', error)
    return {
      success: false,
      error: error.message || 'Payment session creation failed'
    }
  }
}

// Helper function to handle payment redirect
export function redirectToPayment(checkoutUrl: string) {
  try {
    if (!checkoutUrl) {
      throw new Error('No checkout URL provided')
    }
    
    console.log('Redirecting to payment:', checkoutUrl)
    window.location.href = checkoutUrl
  } catch (error) {
    console.error('Payment redirect error:', error)
    throw error
  }
}

// Helper function to extract order ID from URL parameters
export function getOrderIdFromUrl(): string | null {
  try {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('order_id') || urlParams.get('orderId')
  } catch (error) {
    console.error('Error extracting order ID from URL:', error)
    return null
  }
}

// Helper function to format currency
export function formatCurrency(amount: number, currency: string = 'HTG'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount)
  } catch (error) {
    console.error('Currency formatting error:', error)
    return `${currency} ${amount.toFixed(2)}`
  }
}
