# Live Testing Guide for ParkAlgo Subscription Flow

This guide will help you verify the subscription flow on the live parkalgo.com site.

## Prerequisites

1. Ensure you have the following in your `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://supabase.parkalgo.com
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_webhook_secret
   ```

2. Make sure you have Node.js installed.

## Testing the Complete Subscription Flow

### 1. End-to-End User Flow Test

1. Visit: https://parkalgo.com/subscription
2. Select a plan (Navigator/Pro Parker/Fleet Manager)
3. Complete the Stripe checkout using a test card:
   - For successful payment: `4242 4242 4242 4242`
   - For payment requiring authentication: `4000 0027 6000 3184`
   - For payment that fails: `4000 0000 0000 0002`
4. Observe the redirect to success or failure page
5. Verify you are redirected to the dashboard after successful payment
6. Check that your subscription tier is displayed correctly in the dashboard

### 2. Verify Webhook Processing

After a successful subscription, check the Stripe dashboard:
1. Go to https://dashboard.stripe.com/test/events
2. Look for the recent `checkout.session.completed` event
3. Check that it shows as "Delivered" to your webhook endpoint
4. Click on the event to view details, then look for "Webhook Endpoints" section
5. Verify that it shows "Status: Succeeded" for your parkalgo.com webhook endpoint

### 3. Manual Database Verification/Update

If you need to verify or manually update a user's subscription:

```bash
# Check and update a user's subscription (defaults to premium tier)
node test-subscription-update.js USER_ID

# Specify a different tier (free, premium, pro, enterprise)
node test-subscription-update.js USER_ID pro
```

This script will:
- Show the user's current subscription details
- Prompt for confirmation before making changes
- Update their subscription tier and status
- Log the change in the subscription_events table

## Troubleshooting

### If the webhook isn't working:

1. Check Stripe Dashboard > Developers > Webhooks for any delivery errors
2. Verify that the STRIPE_WEBHOOK_SECRET is correct
3. Check logs in your Vercel dashboard

### If subscription status isn't updating:

1. Verify the user exists in the database
2. Check for errors in the Supabase/Vercel logs
3. Use the `test-subscription-update.js` script to manually fix the subscription

### Security Issues:

If you're having GitHub push issues due to detected secrets:
1. Visit: https://github.com/signdrive/parking-angel/security/secret-scanning
2. Resolve any detected secrets by marking as resolved or updating them
3. Consider regenerating any exposed keys/secrets for security

## Important Notes

- Always use test mode in Stripe when testing to avoid real charges
- The subscription_events table can be useful for debugging issues
- For production issues, check both Supabase and Vercel logs
- Remember to approve any pending GitHub security alerts before pushing
