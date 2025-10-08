# Bazik Payment Integration

This project uses Bazik MonCash for payment processing through Netlify Functions.

## Architecture

```
Frontend (React)
    ↓
PaymentButton.tsx → calls /.netlify/functions/create-bazik-session
    ↓
Netlify Function → authenticates with Bazik API
    ↓
Bazik API → returns payment URL
    ↓
User redirected to Bazik payment page
    ↓
User completes payment on Bazik
    ↓
Bazik webhook → calls /.netlify/functions/bazik-webhook
    ↓
Webhook updates order in Supabase
    ↓
User redirected to /success page
```

## Backend (Netlify Functions)

### 1. Create Payment Session
**File**: `netlify/functions/create-bazik-session.ts`

**Endpoint**: `POST /.netlify/functions/create-bazik-session`

**Request Body**:
```json
{
  "amount": 1000,
  "currency": "HTG",
  "metadata": {
    "orderId": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }
}
```

**Response**:
```json
{
  "paymentUrl": "https://bazik.io/checkout/...",
  "referenceId": "BZK_sandbox_...",
  "amount": 1000
}
```

### 2. Payment Webhook
**File**: `netlify/functions/bazik-webhook.ts`

**Endpoint**: `POST /.netlify/functions/bazik-webhook`

Receives callbacks from Bazik after payment completion and updates order status in Supabase.

## Frontend Integration

### Using PaymentButton Component

```tsx
import { PaymentButton } from '@/components/PaymentButton'

function CheckoutPage() {
  return (
    <PaymentButton
      amount={5000}
      orderId="order-uuid"
      metadata={{
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com"
      }}
      onSuccess={() => console.log('Payment initiated')}
      onError={(error) => console.error('Payment failed:', error)}
    />
  )
}
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
# Bazik Credentials
BAZIK_USER_ID=bzk_d2f81d61_1759529138
BAZIK_SECRET_KEY=sk_57fa74cbce0ea195c6b7dbb5b45d8cfc

# Supabase (for webhook to update orders)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Testing

1. **Test Payment Creation**:
```bash
curl -X POST http://localhost:8888/.netlify/functions/create-bazik-session \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "metadata": {"test": true}}'
```

2. **Test Webhook** (after configuring in Bazik dashboard):
- Set webhook URL to: `https://your-domain.netlify.app/.netlify/functions/bazik-webhook`
- Bazik will send POST requests on payment completion

## Webhook Configuration in Bazik

1. Log in to Bazik dashboard
2. Go to Settings → Webhooks
3. Add webhook URL: `https://your-site.netlify.app/.netlify/functions/bazik-webhook`
4. Select events: `payment.succeeded`, `payment.failed`

## Security Notes

- ✅ Credentials stored in environment variables (not in code)
- ✅ Webhook signature verification implemented
- ✅ Server-side payment creation (not exposed to client)
- ✅ Order updates use Supabase service role (bypassing RLS)

## Payment Flow Sequence

1. User fills checkout form
2. Clicks "Pay with Bazik MonCash" button
3. Frontend calls Netlify Function
4. Function authenticates with Bazik (2-step: get token, create payment)
5. Function returns payment URL
6. User redirected to Bazik payment page
7. User enters MonCash credentials and pays
8. Bazik processes payment
9. Bazik calls webhook with payment result
10. Webhook updates order status in Supabase
11. User redirected back to success page

## Troubleshooting

### "No payment URL received"
- Check Netlify Function logs
- Verify Bazik credentials are correct
- Ensure amount is valid (>0)

### "Webhook not receiving calls"
- Verify webhook URL in Bazik dashboard
- Check Netlify Function logs for errors
- Ensure webhook signature verification is correct

### "Order not updating after payment"
- Check webhook logs
- Verify SUPABASE_SERVICE_ROLE_KEY is set
- Ensure orders table exists with correct schema
