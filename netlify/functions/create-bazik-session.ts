import type { Handler } from '@netlify/functions'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed', headers: corsHeaders }
  }

  try {
    const userId = 'bzk_d2f81d61_1759529138'
    const secretKey = 'sk_57fa74cbce0ea195c6b7dbb5b45d8cfc'
    const apiBase = 'https://bazik.io/api'

    const payload = JSON.parse(event.body || '{}') as {
      amount: number
      currency?: string
      metadata?: Record<string, any>
    }

    console.log('Creating Bazik MonCash payment for amount:', payload.amount)

    // Step 1: Authenticate and get access token
    console.log('Step 1: Authenticating with Bazik...')
    console.log('Using credentials:', { userID: userId, secretKey: '***' })
    
    const authRes = await fetch(`${apiBase}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${userId}:${secretKey}`).toString('base64')}`
      },
      body: 'scope=SERVER_ACCESS'
    })

    const authText = await authRes.text()
    console.log('Auth response status:', authRes.status)
    console.log('Auth response body:', authText)

    let authData: any
    try {
      authData = JSON.parse(authText)
    } catch (jsonError) {
      console.error('Auth JSON parse error:', jsonError)
      return { 
        statusCode: 500, 
        body: JSON.stringify({ 
          error: 'Authentication failed: Invalid response from server',
          rawResponse: authText.substring(0, 200)
        }),
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    }

    if (!authRes.ok) {
      return { 
        statusCode: authRes.status, 
        body: JSON.stringify({ error: authData.message || authData.error || 'Authentication failed' }),
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    }

    const accessToken = authData.access_token
    if (!accessToken) {
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: 'No access token received from authentication' }),
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    }

    console.log('Authentication successful!')
    console.log('Access token:', accessToken)

    // Step 2: Create MonCash payment
    console.log('Step 2: Creating MonCash payment...')
    const requestBody = {
      amount: payload.amount,
      orderId: `BZK_sandbox_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      successUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.luxuryhaiti.com'}/success`,
      errorUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.luxuryhaiti.com'}/error`
    }

    console.log('MonCash request body:', requestBody)

    const res = await fetch(`${apiBase}/moncash/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody)
    })

    // Get raw response text first
    const responseText = await res.text()
    console.log('Payment response status:', res.status)
    console.log('Payment response body:', responseText)

    // Try to parse JSON
    let data: any
    try {
      data = JSON.parse(responseText)
      console.log('Parsed payment response:', JSON.stringify(data, null, 2))
    } catch (jsonError) {
      console.error('JSON parse error:', jsonError)
      return { 
        statusCode: 500, 
        body: JSON.stringify({ 
          error: 'Payment failed: Invalid response from server',
          rawResponse: responseText.substring(0, 200) // Include first 200 chars for debugging
        }),
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    }

    if (!res.ok) {
      return { 
        statusCode: res.status, 
        body: JSON.stringify({ error: data.message || data.error || 'Payment creation failed' }),
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    }

    return { 
      statusCode: 200, 
      body: JSON.stringify(data),
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  } catch (e: any) {
    console.error('Bazik payment error:', e)
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: e?.message || 'Unknown error' }),
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  }
}


