import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../src/integrations/supabase/types'

// Env required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const SUPABASE_URL = process.env.SUPABASE_URL
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return { statusCode: 500, body: 'Supabase env missing' }

    const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const payload = JSON.parse(event.body || '{}') as any
    // Expect payload to include our metadata.cart_item_ids or order refs
    const status = payload?.status || payload?.event || ''
    const orderIds: string[] = payload?.metadata?.order_ids || []

    if (['paid', 'payment_succeeded', 'checkout.session.completed'].includes(status) && orderIds.length > 0) {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: 'paid', status: 'paid' })
        .in('id', orderIds)
      if (error) return { statusCode: 500, body: error.message }
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) }
  } catch (e: any) {
    return { statusCode: 500, body: e?.message || 'Unknown error' }
  }
}


