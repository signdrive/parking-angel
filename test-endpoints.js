console.log('🔧 Testing subscription endpoints status...');

const testEndpoints = async () => {
  const endpoints = [
    '/api/subscription/features',
    '/api/subscription/status',
    '/api/subscription/create-checkout'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Testing ${endpoint}...`);
      const response = await fetch(`http://localhost:3000${endpoint}`);
      console.log(`Status: ${response.status} ${response.statusText}`);
      
      if (response.status === 401) {
        console.log('✅ Correctly returns 401 (authentication required)');
      } else if (response.status === 405) {
        console.log('❌ Still getting 405 (method not allowed)');
      } else {
        const text = await response.text();
        console.log(`📄 Response: ${text.substring(0, 100)}...`);
      }
    } catch (error) {
      console.error(`❌ Error testing ${endpoint}:`, error.message);
    }
  }
};

testEndpoints();
