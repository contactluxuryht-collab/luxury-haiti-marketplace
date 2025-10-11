// Vercel serverless function for verifying Bazik MonCash payments
// File: /api/verify-payment.js

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
  const apiBase = 'https://bazik.io/api'

  try {
    const authRes = await fetch(`${apiBase}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: 'scope=SERVER_ACCESS'
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Only accept GET requests for verification
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method Not Allowed',
      message: `Method ${req.method} not allowed. Only GET requests are accepted.`
    })
  }

  try {
    // Extract order_id from query parameters
    const orderId = req.query.order_id

    if (!orderId) {
      return res.status(400).json({ 
        error: 'Missing order_id',
        message: 'order_id query parameter is required'
      })
    }

    console.log('Verifying payment for order_id:', orderId)

    // Get access token
    const accessToken = await getAccessToken()

    // Verify payment with Bazik
    const apiBase = 'https://bazik.io/api'
    const verifyRes = await fetch(`${apiBase}/moncash/payment/verify/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    })

    const responseText = await verifyRes.text()
    console.log('Verification response status:', verifyRes.status)
    console.log('Verification response body:', responseText)

    // Parse response safely
    let data
    try {
      data = JSON.parse(responseText)
    } catch (jsonError) {
      console.error('Verification response JSON parse error:', jsonError)
      return res.status(500).json({ 
        error: 'Invalid verification response',
        message: 'Payment verification server returned invalid JSON response',
        details: responseText.substring(0, 200)
      })
    }

    if (!verifyRes.ok) {
      return res.status(verifyRes.status).json({ 
        error: data.message || data.error || 'Payment verification failed',
        message: 'Failed to verify payment status',
        details: data
      })
    }

    // Return payment verification details
    return res.status(200).json({
      order_id: orderId,
      status: data.status || 'unknown',
      amount: data.amount,
      currency: data.currency || 'HTG',
      transaction_id: data.transaction_id || data.id,
      payment_date: data.payment_date || data.created_at,
      verified: true,
      details: data
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    return res.status(500).json({ 
      error: 'Payment verification failed',
      message: error.message || 'Unknown error occurred during payment verification'
    })
  }
}
