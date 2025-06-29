# Stripe Test Cards for ParkAlgo

When testing the subscription flow on parkalgo.com, use these test card numbers to simulate different payment scenarios.

## 🟢 Successful Payments

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Succeeds and immediately creates a subscription |
| `4000 0000 0000 0077` | Succeeds immediately (charge and auth) |
| `4000 0000 0000 0093` | Succeeds but creates an auth hold (not a charge) |

## 🟡 Authentication Required

| Card Number | Description |
|-------------|-------------|
| `4000 0025 0000 3155` | Requires authentication (3D Secure) |
| `4000 0027 6000 3184` | Requires authentication (3D Secure 2) |

## 🔴 Failed Payments

| Card Number | Description |
|-------------|-------------|
| `4000 0000 0000 0002` | Fails with a decline code of `card_declined` |
| `4000 0000 0000 9995` | Fails with a decline code of `insufficient_funds` |
| `4000 0000 0000 9987` | Fails with a decline code of `lost_card` |
| `4000 0000 0000 9979` | Fails with a decline code of `stolen_card` |

## ⏳ Processing Errors

| Card Number | Description |
|-------------|-------------|
| `4000 0000 0000 0044` | Succeeds but triggers an SCA required (will show pending then succeed) |
| `4000 0000 0000 0010` | The address_line1_check and address_zip_check verifications fail |
| `4000 0000 0000 0028` | The CVC verification fails |

## 📊 Country-Specific Cards

| Card Number | Description |
|-------------|-------------|
| `4000 0000 0000 0101` | International card (non-U.S.) |
| `4000 0582 6000 0005` | Test for specific European countries |

## 🔁 Testing Webhooks

When testing the entire subscription flow, the standard process is:

1. Select a plan on the subscription page
2. Use one of the test cards above
3. Complete the checkout process
4. Wait for the success page
5. Check the user's subscription status in the database

If you need to debug webhook issues:

1. Run `node test-live-webhook.js` to check webhook deliveries
2. Check Stripe dashboard > Developers > Webhooks > Recent deliveries
3. Look for any errors in the webhook delivery details
4. If needed, manually update a user with `node test-subscription-update.js USER_ID`

## ⚠️ Important Notes

- All test card details can be:
  - Any future expiration date
  - Any 3-digit CVC
  - Any billing postal code

- Always use a real email address when testing so you can receive Stripe email receipts
- Never use real card numbers in test mode
- These test cards only work in Stripe test mode, not live mode
