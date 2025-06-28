// Test script to verify webhook endpoint
async function testWebhook() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('https://parkalgo.com/api/stripe-webhook', {
      signal: controller.signal,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test'
      },
      body: JSON.stringify({
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_b1WDnfQb3nhpvNl1QIZ11PKoDDvwLy7YxT3iKFOT4K5A5njB1RIRHqnimA',
            customer_email: 'test@example.com',
            metadata: {
              userId: 'test-user-id',
              tier: 'premium'
            },
            customer: 'cus_test123',
            customer_email: 'test@example.com',
            subscription: 'sub_test123'
          }
        }
      })
    });
    
    console.log('Webhook response status:', response.status);
    const data = await response.text();
    console.log('Webhook response:', data);
  } catch (error) {
    console.error('Webhook test error:', error);
  }
}

testWebhook();
