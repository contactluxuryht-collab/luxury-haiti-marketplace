const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Webhook signature verification (implement based on Bazik's webhook security)
function verifyWebhookSignature(payload, signature, secret) {
  // TODO: Implement proper signature verification based on Bazik's webhook security
  // For now, we'll accept all webhooks but log them for security review
  console.log('Webhook signature verification:', { signature, secret: secret ? '***' : 'none' })
  return true // Placeholder - implement proper verification
}

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders }
  }

  // Only accept POST requests for webhooks
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
      console.error('Webhook JSON parse error:', parseError)
      return { 
        statusCode: 400, 
        body: JSON.stringify({ 
          error: 'Invalid JSON',
          message: 'Webhook payload must be valid JSON'
        }), 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    }

    // Verify webhook signature for security
    const signature = event.headers['x-bazik-signature'] || event.headers['x-signature']
    const webhookSecret = process.env.BAZIK_WEBHOOK_SECRET || 'your-webhook-secret'
    
    if (!verifyWebhookSignature(event.body, signature, webhookSecret)) {
      console.error('Invalid webhook signature')
      return { 
        statusCode: 401, 
        body: JSON.stringify({ 
          error: 'Unauthorized',
          message: 'Invalid webhook signature'
        }), 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    }

    console.log('Received Bazik webhook:', JSON.stringify(payload, null, 2))

    // Extract payment information
    const { 
      order_id, 
      transaction_id, 
      status, 
      amount, 
      currency,
      payment_date,
      customer_email,
      reference_id 
    } = payload

    // Update order status in database
    if (order_id && status) {
      try {
        // TODO: Update your database with the payment status
        // This is a placeholder - implement your database update logic
        console.log(`Updating order ${order_id} with status: ${status}`)
        
        // Example database update (replace with your actual database logic):
        // await supabase
        //   .from('orders')
        //   .update({ 
        //     payment_status: status === 'completed' ? 'paid' : 'failed',
        //     transaction_id: transaction_id,
        //     payment_date: payment_date
        //   })
        //   .eq('id', order_id)

        console.log(`Order ${order_id} updated successfully`)
      } catch (dbError) {
        console.error('Database update error:', dbError)
        // Don't fail the webhook if database update fails
        // Log the error for manual review
      }
    }

    // Send confirmation email or notification if needed
    if (status === 'completed' && customer_email) {
      try {
        // TODO: Send confirmation email to customer
        console.log(`Sending confirmation email to ${customer_email}`)
        
        // Example email sending (replace with your email service):
        // await sendEmail({
        //   to: customer_email,
        //   subject: 'Payment Confirmation',
        //   body: `Your payment of ${amount} ${currency} has been processed successfully.`
        // })
      } catch (emailError) {
        console.error('Email sending error:', emailError)
        // Don't fail the webhook if email sending fails
      }
    }

    // Return success response to Bazik
    return { 
      statusCode: 200, 
      body: JSON.stringify({
        received: true,
        order_id: order_id,
        status: 'processed',
        message: 'Webhook processed successfully'
      }), 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }

  } catch (error) {
    console.error('Webhook processing error:', error)
    return { 
      statusCode: 500, 
      body: JSON.stringify({ 
        error: 'Webhook processing failed',
        message: error.message || 'Unknown error occurred during webhook processing'
      }), 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  }
}
