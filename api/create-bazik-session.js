// Vercel serverless function for creating Bazik MonCash payment sessions
// File: /api/create-bazik-session.js

// Token cache to avoid unnecessary authentication calls
let tokenCache = {
  token: null,
  expiresAt: 0
}

// Helper function to get valid access token
async function getAccessToken() {
  const now = Date.now()
  
  // Return cached token if still valid (with 5 minute buffer)
  if (tokenCache.token && tokenCache.expiresAt > now + 300000) {
    console.log('Using cached access token')
    return tokenCache.token
  }

  console.log('Fetching new access token from Bazik...')
  
  const clientId = 'bzk_d2f81d61_1759529138'
  const clientSecret = 'sk_57fa74cbce0ea195c6b7dbb5b45d8cfc'
  const apiBase = 'https://api.bazik.io'

  try {
    const authRes = await fetch(`${apiBase}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userID: clientId,
        secretKey: clientSecret
      })
    })

    if (!authRes.ok) {
      throw new Error(`Authentication failed with status: ${authRes.status}`)
    }

    const authData = await authRes.json()
    
    if (!authData.access_token) {
      throw new Error('No access token received from authentication')
    }

    // Cache the token with expiration time
    tokenCache.token = authData.access_token
    tokenCache.expiresAt = now + (authData.expires_in * 1000) || (now + 3600000) // Default 1 hour

    console.log('Successfully obtained access token')
    return authData.access_token

  } catch (error) {
    console.error('Token fetch error:', error)
    throw new Error(`Authentication failed: ${error.message}`)
  }
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method Not Allowed',
      message: `Method ${req.method} not allowed. Only POST requests are accepted.`
    })
  }

  try {
    // Safely parse incoming JSON body
    let payload
    try {
      payload = req.body
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return res.status(400).json({ 
        error: 'Invalid JSON',
        message: 'Request body must be valid JSON'
      })
    }

    const { amount, orderId, currency = 'HTG', metadata = {} } = payload

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        error: 'Invalid amount',
        message: 'Amount must be a positive number'
      })
    }

    console.log('Creating Bazik MonCash payment for amount:', amount, 'orderId:', orderId)

    // Get access token (with automatic refresh)
    const accessToken = await getAccessToken()

    // Create MonCash payment
    const apiBase = 'https://api.bazik.io'
    const requestBody = {
      gdes: amount,
      description: `Payment for Order ${orderId || 'Custom Payment'}`,
      referenceId: orderId || `BZK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customerFirstName: metadata.firstName || 'Customer',
      customerLastName: metadata.lastName || 'User',
      customerEmail: metadata.email || 'customer@example.com'
    }

    console.log('MonCash request body:', requestBody)

    const paymentRes = await fetch(`${apiBase}/moncash/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody)
    })

    const responseText = await paymentRes.text()
    console.log('Payment response status:', paymentRes.status)
    console.log('Payment response body:', responseText)

    // Parse response safely
    let data
    try {
      data = JSON.parse(responseText)
    } catch (jsonError) {
      console.error('Payment response JSON parse error:', jsonError)
      return res.status(500).json({ 
        error: 'Invalid payment response',
        message: 'Payment server returned invalid JSON response',
        details: responseText.substring(0, 200)
      })
    }

    if (!paymentRes.ok) {
      return res.status(paymentRes.status).json({ 
        error: data.message || data.error || 'Payment creation failed',
        message: 'Failed to create payment session',
        details: data
      })
    }

    // Return success response with checkout URL
    const checkoutUrl = data.checkout_url || data.payment_url || data.url
    
    if (!checkoutUrl) {
      return res.status(500).json({ 
        error: 'No checkout URL received',
        message: 'Payment created but no checkout URL provided',
        details: data
      })
    }

    return res.status(200).json({
      checkout_url: checkoutUrl,
      transaction_id: data.transaction_id || data.id,
      amount: amount,
      currency: currency,
      order_id: orderId,
      status: 'created'
    })

  } catch (error) {
    console.error('Bazik payment error:', error)
    return res.status(500).json({ 
      error: 'Payment processing failed',
      message: error.message || 'Unknown error occurred during payment processing'
    })
  }
}
