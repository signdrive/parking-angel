// Test script for Stripe webhook
const testWebhook = async () => {
  const testEvent = {
    id: 'evt_test_webhook',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_session',
        mode: 'subscription',
        payment_status: 'paid',
        subscription: 'sub_test_subscription',
        customer_email: 'test@example.com',
        metadata: {
          userId: 'test-user-id',
          tier: 'navigator'
        }
      }
    }
  };

  try {
    const response = await fetch('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test_signature'
      },
      body: JSON.stringify(testEvent)
    });

    const result = await response.text();
    console.log('Response Status:', response.status);
    console.log('Response:', result);
  } catch (error) {
    console.error('Error:', error);
  }
};

console.log('Testing webhook endpoint...');
testWebhook();
