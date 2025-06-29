// Test successful payment flow
require('dotenv').config();
console.log('🔥 TESTING PAYMENT SUCCESS FLOW');

// Test the payment success page directly
const testPaymentSuccess = async () => {
  try {
    // This simulates what should happen after Stripe redirects back
    const testSessionId = process.env.STRIPE_TEST_SESSION_ID || 'PLACEHOLDER_SESSION_ID';
    const tier = 'navigator';
    
    console.log('Testing payment success page with session:', testSessionId);
    
    const response = await fetch(`https://parkalgo.com/api/stripe/verify-session?session_id=${testSessionId}&retry=0`);
    const result = await response.json();
    
    console.log('Verify session response:', {
      status: response.status,
      result
    });
    
    if (response.ok && result.success) {
      console.log('✅ Payment verification would succeed!');
      console.log('User would be redirected to dashboard');
    } else {
      console.log('❌ Payment verification failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testPaymentSuccess();
