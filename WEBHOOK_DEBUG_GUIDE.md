# Stripe Webhook Setup Guide

This guide explains how to set up and troubleshoot the Stripe webhook for subscription management in ParkAlgo.

## Issue Identified

After investigation, we've found an issue with the subscription tier mapping between Stripe and the database:

1. Stripe uses these tiers:
   - `navigator`
   - `pro_parker`
   - `fleet_manager`

2. But the database enum uses these values:
   - `free`
   - `premium`
   - `pro`
   - `enterprise`

The webhook handler includes code that maps between these values, but we found there were inconsistencies with the database constraints.

## Setup Steps

1. **Set up environment variables**
   - Ensure `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are properly set in your environment

2. **Verify Webhook Endpoint URL**
   - The primary webhook endpoint is `/api/stripe-webhook` (NOT `/api/stripe/webhook`)
   - In the Stripe Dashboard, verify the webhook is pointing to: `https://yoursite.com/api/stripe-webhook`

3. **Deploy the latest migrations**
   - Make sure to apply all pending migrations, especially for subscription tiers:
   ```bash
   npx supabase migration up
   ```
   
   - The most important migration is `20250629_fix_subscription_mapping.sql` which:
     * Fixes the database constraint to only allow valid enum values
     * Converts any existing mismatched values to the correct ones

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
# Make sure your local server is running first
npm run dev

# In another terminal, run the test script to simulate a checkout.session.completed event
node test-webhook-debug.js
```

Check the server logs for `[Webhook]` messages, especially the tier mapping logs:

```
[Webhook] Mapping tier: { originalTier: 'navigator', mappedTier: 'premium' }
```

## Stripe Events We Handle

1. `checkout.session.completed` - Updates user subscription when payment is successful
2. `customer.subscription.deleted` - Resets subscription to 'free' when canceled
