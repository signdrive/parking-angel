# Stripe Webhook Setup Guide

## Overview

This document describes the webhook setup for handling Stripe events in the Parking Angel application. The webhook system processes events like subscription updates, checkout completions, and other Stripe notifications.

## Webhook Endpoints

### Primary Endpoint (Recommended)

```
POST /api/stripe-webhook
```

This is the primary webhook endpoint that handles all Stripe events. Use this endpoint for all new webhook configurations.

### Legacy Endpoint (Deprecated)

```
POST /api/stripe/webhook
```

This endpoint is maintained for backward compatibility and automatically redirects to the primary endpoint with a 308 Permanent Redirect status code.

## Supported Events

The webhook handler processes the following Stripe events:

- `customer.subscription.created` - When a new subscription is created
- `customer.subscription.updated` - When a subscription is updated (e.g., plan changes)
- `customer.subscription.deleted` - When a subscription is cancelled or ends
- `checkout.session.completed` - When a checkout session completes successfully

## Database Updates

Events are processed and stored in two tables:
- `user_subscriptions` - Stores the current state of user subscriptions
- `subscription_events` - Logs all subscription-related events for audit purposes

## Setup Instructions

1. **Environment Variables**
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. **Stripe Dashboard Configuration**
   - Go to Stripe Dashboard > Developers > Webhooks
   - Click "Add Endpoint"
   - Enter your webhook URL: `https://your-domain.com/api/stripe-webhook`
   - Select events to listen for:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `checkout.session.completed`

3. **Testing**
   ```bash
   # Run the webhook verification test
   node test/test-webhook-verify.new.js
   ```

## Security

- All webhook requests are verified using Stripe's signature verification
- Database operations use Supabase's service role for secure access
- Row Level Security (RLS) policies ensure data access control
- All sensitive operations are logged for audit purposes

## Error Handling

The webhook handler includes comprehensive error handling:
- Invalid signatures return 400 status
- Missing webhook secret returns clear error message
- Database errors include detailed error codes
- All errors are logged with tracking information

## Response Formats

### Success Response
```json
{
  "received": true
}
```

### Error Response
```json
{
  "error": "Error description",
  "error_code": "error_type_code",
  "msg": "Detailed error message"
}
```

## Logging

All webhook processing includes detailed logging:
- Event ID and type
- Processing time
- User ID (when available)
- Database operation results
- Error details (in case of failures)

## Best Practices

1. Always use the primary endpoint (`/api/stripe-webhook`) for new integrations
2. Monitor webhook processing times in logs
3. Set up alerts for webhook failures
4. Regularly check subscription_events table for audit purposes
5. Keep Stripe API version up to date

## Troubleshooting

Common issues and solutions:

1. **Signature Verification Failed**
   - Check STRIPE_WEBHOOK_SECRET is correct
   - Ensure request is not modified in transit
   - Verify correct endpoint URL in Stripe Dashboard

2. **Database Permission Errors**
   - Verify SUPABASE_SERVICE_ROLE_KEY is set
   - Check RLS policies are correctly configured
   - Ensure user_subscriptions table exists

3. **Missing Events**
   - Verify event types are selected in Stripe Dashboard
   - Check webhook endpoint status in Stripe Dashboard
   - Review server logs for any dropped events

## Testing

A comprehensive test script is available at `test/test-webhook-verify.new.js` that:
- Creates a test user
- Sets up a test subscription
- Verifies webhook processing
- Cleans up test data

Run tests regularly after making changes to webhook handling.

## Contact

For issues or questions about the webhook setup:
1. Check server logs for detailed error messages
2. Review Stripe Dashboard webhook logs
3. Contact the development team with relevant event IDs
