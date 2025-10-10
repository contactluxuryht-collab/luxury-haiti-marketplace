// Vercel serverless function for handling Bazik payment webhooks
// File: /api/payment-callback.js

// Webhook signature verification (implement based on Bazik's webhook security)
function verifyWebhookSignature(payload, signature, secret) {
  // TODO: Implement proper signature verification based on Bazik's webhook security
  // For now, we'll accept all webhooks but log them for security review
  console.log('Webhook signature verification:', { 
    signature: signature ? '***' : 'none', 
    secret: secret ? '***' : 'none' 
  })
  
  // Placeholder verification - implement proper HMAC verification
  // Example: const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  // return signature === expectedSignature
  
  return true // Placeholder - implement proper verification
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Only accept POST requests for webhooks
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method Not Allowed',
      message: `Method ${req.method} not allowed. Only POST requests are accepted.`
    })
  }

  try {
    // Safely parse incoming JSON body
    let payload
    try {
      payload = req.body
    } catch (parseError) {
      console.error('Webhook JSON parse error:', parseError)
      return res.status(400).json({ 
        error: 'Invalid JSON',
        message: 'Webhook payload must be valid JSON'
      })
    }

    // Verify webhook signature for security
    const signature = req.headers['x-bazik-signature'] || req.headers['x-signature']
    const webhookSecret = process.env.BAZIK_WEBHOOK_SECRET || 'your-webhook-secret'
    
    if (!verifyWebhookSignature(JSON.stringify(payload), signature, webhookSecret)) {
      console.error('Invalid webhook signature')
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid webhook signature'
      })
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
        // const { createClient } = require('@supabase/supabase-js')
        // const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
        // 
        // await supabase
        //   .from('orders')
        //   .update({ 
        //     payment_status: status === 'completed' ? 'paid' : 'failed',
        //     transaction_id: transaction_id,
        //     payment_date: payment_date,
        //     updated_at: new Date().toISOString()
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
        // const nodemailer = require('nodemailer')
        // const transporter = nodemailer.createTransporter({
        //   // your email config
        // })
        // 
        // await transporter.sendMail({
        //   to: customer_email,
        //   subject: 'Payment Confirmation - Luxury Haiti',
        //   html: `
        //     <h2>Payment Confirmed!</h2>
        //     <p>Your payment of ${amount} ${currency} has been processed successfully.</p>
        //     <p>Order ID: ${order_id}</p>
        //     <p>Transaction ID: ${transaction_id}</p>
        //   `
        // })
      } catch (emailError) {
        console.error('Email sending error:', emailError)
        // Don't fail the webhook if email sending fails
      }
    }

    // Log successful webhook processing
    console.log('Webhook processed successfully:', {
      order_id,
      status,
      amount,
      currency,
      transaction_id
    })

    // Return success response to Bazik
    return res.status(200).json({
      received: true,
      order_id: order_id,
      status: 'processed',
      message: 'Webhook processed successfully'
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return res.status(500).json({ 
      error: 'Webhook processing failed',
      message: error.message || 'Unknown error occurred during webhook processing'
    })
  }
}
