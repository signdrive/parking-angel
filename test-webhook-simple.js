// Test script for Stripe webhook
const testWebhook = async () => {
  // Use a real user ID from your database for testing
  const userId = process.env.TEST_USER_ID || '0462d759-46bf-4e66-8f4b-43d42d2f30d4';
  
  // Create a test event with the correct structure
  const testEvent = {
    id: `evt_test_${Date.now()}`,
    type: 'checkout.session.completed',
    data: {
      object: {
        id: `cs_test_${Date.now()}`,
        mode: 'subscription',
        payment_status: 'paid',
        customer: `cus_test_${Date.now()}`,
        subscription: `sub_test_${Date.now()}`,
        customer_email: 'test@example.com',
        metadata: {
          userId: userId,
          tier: 'navigator'  // Use one of: navigator, pro_parker, fleet_manager
        }
      }
    }
  };

  console.log(`Sending checkout event to webhook endpoint...`);
  console.log(`User ID: ${userId}`);
  console.log(`Plan: ${testEvent.data.object.metadata.tier}`);

  try {
    // Note: Use the correct webhook endpoint
    const response = await fetch('http://localhost:3000/api/stripe-webhook', {
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
