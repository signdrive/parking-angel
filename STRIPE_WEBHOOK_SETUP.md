# Stripe Webhook Setup Guide - ParkAlgo

## 🚀 QUICK START - LOCAL TESTING (NO EXTERNAL TOOLS NEEDED)

### ⚡ Super Quick Test (30 seconds)
```bash
# 1. Start your app
npm run dev

# 2. In another terminal, test webhook
node scripts/test-webhook.js

# 3. Check your app console for webhook logs
```

### 🎯 Test Different Events
```bash
# Test subscription creation
node scripts/test-webhook.js --event customer.subscription.created

# Test payment success
node scripts/test-webhook.js --event invoice.payment_succeeded

# Test checkout completion (default)
node scripts/test-webhook.js --event checkout.session.completed
```

**✅ This is the fastest way to test webhooks locally without any external dependencies!**

---

### 1. **UPDATE YOUR STRIPE_WEBHOOK_SECRET** (CRITICAL)
Your current `.env.local` has a placeholder. Replace it with the real secret from Stripe:

```bash
# In your .env.local file, replace this line:
STRIPE_WEBHOOK_SECRET="whsec_your_real_secret_from_stripe_here"

# With your actual webhook secret from Stripe Dashboard:
STRIPE_WEBHOOK_SECRET="whsec_your_real_secret_from_stripe_here"
```

### 2. **Get Real Stripe Keys** (IMPORTANT)
Replace test keys with your actual Stripe keys:

```bash
# Update these in .env.local:
STRIPE_PUBLISHABLE_KEY="pk_test_your_real_publishable_key"
STRIPE_SECRET_KEY="sk_test_your_real_secret_key"
```

### 3. **Quick Test Your Setup**
```bash
# Test your webhook locally
node scripts/verify-stripe-webhook.js

# Or test the endpoint directly
curl -X POST http://localhost:3000/api/stripe-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'
```

---

## 🎯 Complete Step-by-Step Webhook Configuration

### Prerequisites
- Stripe account with API access
- Deployed application URL (for production) or ngrok (for development)
- Admin access to your hosting platform

---

## 📋 Step 1: Prepare Your Environment

### 1.1 Current Webhook Endpoint
Your webhook endpoint is already implemented at:
```
POST /api/stripe-webhook
```

### 1.2 Required Environment Variables
Add these to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_51... # or pk_live_51... for production
STRIPE_SECRET_KEY=sk_test_51...      # or sk_live_51... for production
STRIPE_WEBHOOK_SECRET=whsec_...      # Will be provided by Stripe after webhook creation

# Stripe Price IDs for each tier
STRIPE_PRICE_ID_NAVIGATOR=price_...
STRIPE_PRICE_ID_PRO_PARKER=price_...
STRIPE_PRICE_ID_FLEET_MANAGER=price_...
```

---

## 🚀 Step 2: Create Webhook in Stripe Dashboard

### 2.1 Access Stripe Dashboard
1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Log in to your Stripe account
3. Navigate to **Developers** → **Webhooks**

### 2.2 Create New Webhook
1. Click **"Add endpoint"**
2. Enter your webhook URL:
   - **Development**: `https://your-ngrok-url.ngrok.io/api/stripe-webhook`
   - **Production**: `https://your-domain.com/api/stripe-webhook`

### 2.3 Select Events to Listen For
Select these essential events:
```
✅ customer.subscription.created
✅ customer.subscription.updated
✅ customer.subscription.deleted
✅ invoice.payment_succeeded
✅ invoice.payment_failed
✅ checkout.session.completed
✅ payment_intent.succeeded
✅ payment_intent.payment_failed
```

### 2.4 Configure Webhook Settings
- **API Version**: Use latest (2023-10-16 or newer)
- **Metadata**: Add any custom metadata if needed

---

## 🔐 Step 3: Get Webhook Secret

### 3.1 Retrieve Signing Secret
1. After creating the webhook, click on it
2. In the **Signing secret** section, click **"Reveal"**
3. Copy the secret (starts with `whsec_`)

### 3.2 Add to Environment
```bash
STRIPE_WEBHOOK_SECRET=whsec_your_actual_secret_here
```

---

## 🧪 Step 4: Development Setup (Local Testing Options)

### Option A: Stripe CLI (Recommended - No ngrok needed!)

#### 4A.1 Install Stripe CLI
```bash
# Windows (using chocolatey)
choco install stripe

# Or download from https://stripe.com/docs/stripe-cli
# Manual install: Download and add to PATH
```

#### 4A.2 Login to Stripe CLI
```bash
stripe login
# Follow the browser authentication flow
```

#### 4A.3 Start local webhook forwarding
```bash
# Start your Next.js app first
npm run dev

# In another terminal, forward webhooks
stripe listen --forward-to localhost:3000/api/stripe-webhook

# This will output your webhook signing secret like:
# Your webhook signing secret is whsec_1234567890abcdef...
```

#### 4A.4 Update your .env.local
```bash
# Copy the webhook secret from the CLI output
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef...
```

#### 4A.5 Test events
```bash
# In another terminal, trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded
```

---

### Option B: Manual Testing (Pure Local)

#### 4B.1 Create test webhook endpoint
Create a test script to simulate webhook events:

```bash
# Create test-webhook.js
```

#### 4B.2 Test your webhook handler directly
```bash
# Test with curl
curl -X POST http://localhost:3000/api/stripe-webhook \
  -H "Content-Type: application/json" \
  -H "stripe-signature: test" \
  -d '{
    "id": "evt_test_webhook",
    "object": "event",
    "type": "checkout.session.completed",
    "data": {
      "object": {
        "id": "cs_test_123",
        "customer": "cus_test_123",
        "subscription": "sub_test_123"
      }
    }
  }'
```

---

### Option C: ngrok (If you prefer external URL)

#### 4C.1 Install ngrok
```bash
# Windows (using chocolatey)
choco install ngrok

# Or download from https://ngrok.com/download
```

#### 4C.2 Start ngrok tunnel
```bash
# Start your Next.js app first
npm run dev

# In another terminal, create tunnel
ngrok http 3000
```

#### 4C.3 Update Webhook URL in Stripe Dashboard
1. Copy the ngrok HTTPS URL (e.g., `https://abc123.ngrok.io`)
2. Go back to Stripe Dashboard → Webhooks
3. Edit your webhook endpoint
4. Update URL to: `https://abc123.ngrok.io/api/stripe-webhook`

---

## 🔧 Step 5: Configure Your Application

### 5.1 Update Environment Variables
Create/update your `.env.local` file:

```bash
# Stripe Keys (from Stripe Dashboard → Developers → API Keys)
STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_SECRET_KEY=sk_test_51...

# Webhook Secret (from Step 3)
STRIPE_WEBHOOK_SECRET=whsec_...

# Product/Price IDs (from Stripe Dashboard → Products)
STRIPE_PRICE_ID_NAVIGATOR=price_1234567890
STRIPE_PRICE_ID_PRO_PARKER=price_0987654321
STRIPE_PRICE_ID_FLEET_MANAGER=price_1122334455

# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Mapbox (existing)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token
NEXT_PUBLIC_MAPBOX_DISABLE_TELEMETRY=true
```

### 5.2 Restart Development Server
```bash
# Stop current server (Ctrl+C)
# Restart with new environment variables
npm run dev
```

---

## ✅ Step 6: Test Webhook Integration

### 6.1 Test from Stripe Dashboard
1. Go to **Developers** → **Webhooks**
2. Click on your webhook
3. Click **"Send test webhook"**
4. Select an event (e.g., `checkout.session.completed`)
5. Click **"Send test webhook"**

### 6.2 Check Your Application Logs
You should see webhook received messages in your console:
```
Webhook received: checkout.session.completed
Processing subscription for customer: cus_...
```

### 6.3 Test Real Payment Flow
1. Navigate to your app's subscription page
2. Complete a test payment using Stripe test cards:
   - **Success**: `4242 4242 4242 4242`
   - **Declined**: `4000 0000 0000 0002`

---

## 🛡️ Step 7: Security Verification

### 7.1 Webhook Signature Verification
Your implementation already includes signature verification:
```typescript
const signature = request.headers.get('stripe-signature')
const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
```

### 7.2 Test Security
Try sending a request without proper signature - it should be rejected.

---

## 🚀 Step 8: Production Deployment

### 8.1 Update Production Environment
1. Deploy your app to production (Vercel, etc.)
2. Update environment variables in production dashboard
3. Use production Stripe keys (`pk_live_...`, `sk_live_...`)

### 8.2 Update Webhook URL
1. Go to Stripe Dashboard
2. Edit webhook endpoint
3. Change URL to production: `https://your-domain.com/api/stripe-webhook`

### 8.3 Test Production Webhook
1. Complete a real payment (small amount)
2. Verify webhook events are received
3. Check user subscription status in your database

---

## 📊 Step 9: Monitoring & Troubleshooting

### 9.1 Monitor Webhook Delivery
In Stripe Dashboard → Webhooks → Your Webhook:
- Check **"Recent events"** tab
- Look for successful/failed deliveries
- Review response codes and timing

### 9.2 Common Issues & Solutions

#### Issue: Webhook URL not reachable
```bash
# Solution: Verify URL is publicly accessible
curl -X POST https://your-domain.com/api/stripe-webhook
```

#### Issue: Signature verification failed
```bash
# Solution: Verify webhook secret in environment
echo $STRIPE_WEBHOOK_SECRET
```

#### Issue: Events not being processed
```bash
# Solution: Check your webhook handler logs
# Ensure you're handling the specific event types
```

### 9.3 Debug Webhook Events
Add logging to your webhook handler:
```typescript
console.log('Webhook event type:', event.type)
console.log('Webhook data:', JSON.stringify(event.data, null, 2))
```

---

## 🎯 Step 10: Verify Complete Setup

### 10.1 Checklist
- [ ] Webhook endpoint created in Stripe
- [ ] All required events selected
- [ ] Webhook secret added to environment
- [ ] Test webhook successful
- [ ] Real payment flow tested
- [ ] Production deployment updated
- [ ] Monitoring configured

### 10.2 Final Test
1. Create a new user account
2. Subscribe to a plan
3. Verify:
   - Payment processes successfully
   - Webhook events received
   - User subscription status updated
   - Access permissions granted

---

## 📞 Support & Resources

### Stripe Resources
- [Webhook Documentation](https://stripe.com/docs/webhooks)
- [Test Event Reference](https://stripe.com/docs/webhooks/test)
- [Webhook Security](https://stripe.com/docs/webhooks/signatures)

### Common Event Types Reference
```
checkout.session.completed    → New subscription created
customer.subscription.updated → Plan changes, renewals
invoice.payment_succeeded     → Successful payment
invoice.payment_failed        → Failed payment
customer.subscription.deleted → Cancellation
```

---

## 🔧 Troubleshooting Commands

```bash
# Check webhook endpoint locally
curl -X POST http://localhost:3000/api/stripe-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Test environment variables
node -e "console.log(process.env.STRIPE_WEBHOOK_SECRET)"

# Check ngrok tunnel status
curl http://127.0.0.1:4040/api/tunnels

# Verify Stripe CLI installation
stripe --version

# Listen to webhooks with Stripe CLI (alternative to ngrok)
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

---

**✅ Your webhook setup is now complete and ready for production!**
