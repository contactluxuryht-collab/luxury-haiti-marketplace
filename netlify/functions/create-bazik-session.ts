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
    const apiBase = 'https://api.bazik.io'

    const payload = JSON.parse(event.body || '{}') as {
      amount: number
      currency?: string
      metadata?: Record<string, any>
    }

    console.log('Creating Bazik payment for amount:', payload.amount)

    const res = await fetch(`${apiBase}/payment/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${secretKey}`,
      },
      body: JSON.stringify({
        user_id: userId,
        amount: payload.amount,
        currency: payload.currency || 'HTG',
      })
    })

    const data = await res.json()
    console.log('Bazik API response:', data)

    if (!res.ok) {
      return { 
        statusCode: res.status, 
        body: JSON.stringify({ error: data.message || 'Payment creation failed' }),
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


