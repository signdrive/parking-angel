// Test script to verify webhook endpoint
async function testWebhook() {
  try {
    const response = await fetch('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test'
      },
      body: JSON.stringify({ test: 'webhook test' })
    });
    
    console.log('Webhook response status:', response.status);
    const data = await response.text();
    console.log('Webhook response:', data);
  } catch (error) {
    console.error('Webhook test error:', error);
  }
}

testWebhook();
