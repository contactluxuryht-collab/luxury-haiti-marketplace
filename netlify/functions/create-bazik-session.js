const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed', headers: corsHeaders }
  }

  try {
    const userId = 'bzk_d2f81d61_1759529138'
    const secretKey = 'sk_57fa74cbce0ea195c6b7dbb5b45d8cfc'
    const apiBase = 'https://api.bazik.io'

    const payload = JSON.parse(event.body || '{}')
    const { amount, currency = 'HTG', metadata = {} } = payload

    console.log('Creating Bazik MonCash payment for amount:', amount)

    // Step 1: Authenticate and get access token
    console.log('Step 1: Authenticating with Bazik...')
    
    const authRes = await fetch(`${apiBase}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userID: userId,
        secretKey: secretKey
      })
    })

    const authText = await authRes.text()
    console.log('Auth response status:', authRes.status)
    console.log('Auth response body:', authText)

    let authData
    try {
      authData = JSON.parse(authText)
    } catch (jsonError) {
      console.error('Auth JSON parse error:', jsonError)
      return { 
        statusCode: 500, 
        body: JSON.stringify({ 
          error: 'Authentication failed: Invalid response from server',
          details: 'Failed to parse authentication response',
          rawResponse: authText.substring(0, 200)
        }),
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    }

    if (!authRes.ok) {
      return { 
        statusCode: authRes.status, 
        body: JSON.stringify({ 
          error: authData.message || authData.error || 'Authentication failed',
          details: 'Bazik authentication returned error'
        }),
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    }

    const accessToken = authData.access_token
    if (!accessToken) {
      return { 
        statusCode: 500, 
        body: JSON.stringify({ 
          error: 'No access token received from authentication',
          details: 'Authentication succeeded but no token provided'
        }),
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    }

    console.log('Authentication successful!')

    // Step 2: Create MonCash payment
    console.log('Step 2: Creating MonCash payment...')
    const requestBody = {
      gdes: amount,
      description: `Payment for Order - ${metadata.order_ids ? metadata.order_ids.join(', ') : 'Custom Payment'}`,
      referenceId: `BZK_sandbox_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customerFirstName: metadata.firstName || 'Customer',
      customerLastName: metadata.lastName || 'User',
      customerEmail: metadata.email || 'customer@example.com'
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

    // Get raw response text first
    const responseText = await res.text()
    console.log('Payment response status:', res.status)
    console.log('Payment response body:', responseText)

    // Try to parse JSON
    let data
    try {
      data = JSON.parse(responseText)
      console.log('Parsed payment response:', JSON.stringify(data, null, 2))
    } catch (jsonError) {
      console.error('JSON parse error:', jsonError)
      return { 
        statusCode: 500, 
        body: JSON.stringify({ 
          error: 'Payment failed: Invalid response from server',
          details: 'Failed to parse payment response',
          rawResponse: responseText.substring(0, 200)
        }),
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    }

    if (!res.ok) {
      return { 
        statusCode: res.status, 
        body: JSON.stringify({ 
          error: data.message || data.error || 'Payment creation failed',
          details: 'Bazik payment creation returned error'
        }),
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    }

    // Return success response with proper structure
    return { 
      statusCode: 200, 
      body: JSON.stringify({
        success: true,
        status: 'success',
        payment_url: data.payment_url || data.checkout_url || data.url,
        transaction_id: data.transaction_id || data.id,
        amount: amount,
        currency: currency,
        data: data
      }),
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  } catch (e) {
    console.error('Bazik payment error:', e)
    return { 
      statusCode: 500, 
      body: JSON.stringify({ 
        error: e?.message || 'Unknown error occurred',
        details: 'Internal server error during payment processing'
      }),
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  }
}
