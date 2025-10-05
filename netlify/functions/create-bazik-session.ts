import type { Handler } from '@netlify/functions'

// Expected env vars (configure in Netlify):
// BAZIK_SECRET_KEY, BAZIK_USER_ID, BAZIK_API_BASE

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const secret = process.env.BAZIK_SECRET_KEY
    const userId = process.env.BAZIK_USER_ID
    const apiBase = process.env.BAZIK_API_BASE || 'https://api.bazik.io'
    if (!secret || !userId) {
      return { statusCode: 500, body: 'Missing Bazik configuration' }
    }

    const payload = JSON.parse(event.body || '{}') as {
      currency: string
      items: Array<{ name: string; quantity: number; amount: number }>
      success_url: string
      cancel_url: string
      metadata?: Record<string, any>
    }

    // Shape below assumes a generic Bazik session create. Adjust per API docs.
    const res = await fetch(`${apiBase}/v1/checkout/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${secret}`,
        'x-bazik-user': userId,
      },
      body: JSON.stringify({
        currency: payload.currency || 'USD',
        line_items: payload.items.map(i => ({ name: i.name, quantity: i.quantity, amount: Math.round(i.amount * 100) })),
        success_url: payload.success_url,
        cancel_url: payload.cancel_url,
        metadata: payload.metadata || {},
      })
    })

    if (!res.ok) {
      const text = await res.text()
      return { statusCode: 500, body: `Bazik error: ${text}` }
    }
    const data = await res.json()
    return { statusCode: 200, body: JSON.stringify(data) }
  } catch (e: any) {
    return { statusCode: 500, body: e?.message || 'Unknown error' }
  }
}


