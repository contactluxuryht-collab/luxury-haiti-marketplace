const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
  
  const clientId = process.env.BAZIK_CLIENT_ID
  const clientSecret = process.env.BAZIK_CLIENT_SECRET
  const apiBase = 'https://api.bazik.io'
  
  if (!clientId || !clientSecret) {
    throw new Error('Bazik credentials not configured. Please set BAZIK_CLIENT_ID and BAZIK_CLIENT_SECRET environment variables.')
  }

  try {
    // Create Basic Auth header
    const credentials = `${clientId}:${clientSecret}`
    const base64Credentials = Buffer.from(credentials).toString('base64')
    
    const authRes = await fetch(`${apiBase}/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${base64Credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials'
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

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders }
  }

  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ 
        error: 'Method Not Allowed',
        message: `Method ${event.httpMethod} not allowed. Only POST requests are accepted.`
      }), 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  }

  try {
    // Safely parse incoming JSON body
    let payload
    try {
      payload = JSON.parse(event.body || '{}')
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return { 
        statusCode: 400, 
        body: JSON.stringify({ 
          error: 'Invalid JSON',
          message: 'Request body must be valid JSON'
        }), 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    }

    const { amount, orderId, currency = 'HTG', metadata = {} } = payload

    // Validate required fields
    if (!amount || amount <= 0) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ 
          error: 'Invalid amount',
          message: 'Amount must be a positive number'
        }), 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    }

    console.log('Creating Bazik MonCash payment for amount:', amount, 'orderId:', orderId)

    // Get access token (with automatic refresh)
    const accessToken = await getAccessToken()

    // Create MonCash payment
    const apiBase = 'https://api.bazik.io'
    const requestBody = {
      gdes: amount,
      userID: clientId,
      successUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.luxuryhaiti.com'}/success`,
      description: `Payment for Order ${orderId || 'Custom Payment'}`,
      referenceId: orderId || `BZK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      errorUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.luxuryhaiti.com'}/error`,
      customerFirstName: metadata.firstName || 'Customer',
      customerLastName: metadata.lastName || 'User',
      customerEmail: metadata.email || 'customer@example.com',
      webhookUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.luxuryhaiti.com'}/api/payment-callback`,
      metadata: metadata
    }

    console.log('MonCash request body:', requestBody)

    const res = await fetch(`${apiBase}/moncash/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody)
    })

    const responseText = await res.text()
    console.log('Payment response status:', res.status)
    console.log('Payment response body:', responseText)

    // Parse response safely
    let data
    try {
      data = JSON.parse(responseText)
    } catch (jsonError) {
      console.error('Payment response JSON parse error:', jsonError)
      return { 
        statusCode: 500, 
        body: JSON.stringify({ 
          error: 'Invalid payment response',
          message: 'Payment server returned invalid JSON response',
          details: responseText.substring(0, 200)
        }), 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    }

    if (!res.ok) {
      return { 
        statusCode: res.status, 
        body: JSON.stringify({ 
          error: data.message || data.error || 'Payment creation failed',
          message: 'Failed to create payment session',
          details: data
        }), 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    }

    // Return success response with redirect URL
    const redirectUrl = data.redirectUrl || data.checkout_url || data.payment_url || data.url
    
    if (!redirectUrl) {
      return { 
        statusCode: 500, 
        body: JSON.stringify({ 
          error: 'No redirect URL received',
          message: 'Payment created but no redirect URL provided',
          details: data
        }), 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    }

    return { 
      statusCode: 200, 
      body: JSON.stringify({
        checkout_url: redirectUrl,  // Keep for frontend compatibility
        redirect_url: redirectUrl,  // Add for clarity
        transaction_id: data.transaction_id || data.id,
        amount: amount,
        currency: currency,
        order_id: orderId,
        status: 'created'
      }), 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }

  } catch (error) {
    console.error('Bazik payment error:', error)
    return { 
      statusCode: 500, 
      body: JSON.stringify({ 
        error: 'Payment processing failed',
        message: error.message || 'Unknown error occurred during payment processing'
      }), 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  }
}
