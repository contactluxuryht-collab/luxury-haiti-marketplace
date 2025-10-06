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
    const bearerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    const apiEndpoint = 'https://api.bazik.io/moncash/token'

    const payload = JSON.parse(event.body || '{}') as {
      amount: number
      currency?: string
      metadata?: Record<string, any>
    }

    console.log('Creating Bazik MonCash payment for amount:', payload.amount)

    const requestBody = {
      gdes: payload.amount,
      description: `Payment for Order`,
      referenceId: `BZK_sandbox_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customerFirstName: payload.metadata?.firstName || 'Customer',
      customerLastName: payload.metadata?.lastName || 'User',
      customerEmail: payload.metadata?.email || 'customer@example.com'
    }

    console.log('Request body:', requestBody)

    const res = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
      },
      body: JSON.stringify(requestBody)
    })

    // Get raw response text first
    const responseText = await res.text()
    console.log('Raw API response:', responseText)

    // Try to parse JSON
    let data: any
    try {
      data = JSON.parse(responseText)
      console.log('Parsed API response:', data)
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


