# Stripe Webhook Setup Guide

This guide explains how to set up and troubleshoot the Stripe webhook for subscription management in ParkAlgo.

## Setup Steps

1. **Set up environment variables**
   - Ensure `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are properly set in your environment

2. **Verify Webhook Endpoint URL**
   - The primary webhook endpoint is `/api/stripe-webhook` (NOT `/api/stripe/webhook`)
   - In the Stripe Dashboard, verify the webhook is pointing to: `https://yoursite.com/api/stripe-webhook`

3. **Deploy the latest migrations**
   - Make sure to apply all pending migrations, especially for subscription tiers:
   ```bash
   npx supabase db push
   ```

## Troubleshooting

### Common Issues

1. **Webhook not triggering or getting errors?**
   - Check Vercel logs for any `[Webhook]` messages
   - Verify webhook secret is correctly set in environment variables
   - Check Stripe dashboard webhook logs for delivery attempts and responses

2. **Payment successful but subscription not updated?**
   - Issue might be in mapping between Stripe plans and database tiers
   - Plan names in Stripe: 'navigator', 'pro_parker', 'fleet_manager'
   - Database subscription_tier enum: 'free', 'premium', 'pro', 'enterprise'
   - Our webhook maps them as:
     * navigator → premium
     * pro_parker → pro
     * fleet_manager → enterprise

3. **Database errors?**
   - Check Vercel logs for database-related errors
   - Verify Row Level Security (RLS) policies are properly configured
   - Make sure all migrations have been applied

### Testing Webhooks

You can simulate webhook events using the provided test script:

```bash
# Run the test script to simulate a checkout.session.completed event
node test-webhook-debug.js
```

## Stripe Events We Handle

1. `checkout.session.completed` - Updates user subscription when payment is successful
2. `customer.subscription.deleted` - Resets subscription to 'free' when canceled
