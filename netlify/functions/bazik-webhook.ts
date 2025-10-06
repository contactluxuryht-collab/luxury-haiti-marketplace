import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../src/integrations/supabase/types'
import crypto from 'crypto'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-bazik-signature',
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed', headers: corsHeaders }
  }

  try {
    const SUPABASE_URL = process.env.SUPABASE_URL
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
    const BAZIK_SECRET_KEY = 'sk_57fa74cbce0ea195c6b7dbb5b45d8cfc'
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return { statusCode: 500, body: 'Supabase env missing', headers: corsHeaders }
    }

    const signature = event.headers['x-bazik-signature'] || event.headers['X-Bazik-Signature']
    const payload = event.body || '{}'
    
    // Validate webhook signature
    if (signature) {
      const computedSignature = crypto
        .createHmac('sha256', BAZIK_SECRET_KEY)
        .update(payload)
        .digest('hex')
      
      if (signature !== computedSignature) {
        console.warn('Invalid webhook signature')
        return { statusCode: 401, body: 'Invalid signature', headers: corsHeaders }
      }
    }

    const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const data = JSON.parse(payload) as any
    
    console.log('Bazik webhook received:', data)

    const status = data?.status || data?.event || ''
    const orderIds: string[] = data?.metadata?.order_ids || []
    const paymentId = data?.payment_id || data?.id

    // Handle successful payment
    if (['paid', 'payment_succeeded', 'completed', 'success'].includes(status.toLowerCase())) {
      if (orderIds.length > 0) {
        const { error } = await supabase
          .from('orders')
          .update({ payment_status: 'paid', status: 'paid' })
          .in('id', orderIds)
        
        if (error) {
          console.error('Error updating orders:', error)
          return { statusCode: 500, body: error.message, headers: corsHeaders }
        }
        
        console.log(`Updated ${orderIds.length} orders to paid status`)
      }
    }

    return { 
      statusCode: 200, 
      body: JSON.stringify({ received: true, payment_id: paymentId }),
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  } catch (e: any) {
    console.error('Webhook error:', e)
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: e?.message || 'Unknown error' }),
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  }
}


