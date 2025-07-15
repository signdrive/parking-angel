#!/usr/bin/env node

// Comprehensive test for spot reporting API
const BASE_URL = 'http://localhost:3001';

async function testSpotReportingAPI() {
  console.log('🧪 Testing Spot Reporting API...\n');

  // Test 1: Create a new spot report
  console.log('1. Testing spot report creation...');
  try {
    const response = await fetch(`${BASE_URL}/api/spots/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // You may need to add proper auth
      },
      body: JSON.stringify({
        latitude: 40.7589,
        longitude: -73.9851,
        spot_type: 'street',
        notes: 'Great street parking spot near Times Square',
        report_type: 'new_spot'
      })
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('   ✅ Spot report created successfully');
      console.log('   📍 Spot ID:', data.spot_id);
      console.log('   📋 Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('   ❌ Failed to create spot report');
      console.log('   📋 Error:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('   ❌ Request failed:', error.message);
  }

  console.log('');

  // Test 2: Test validation with missing required fields
  console.log('2. Testing validation (missing required fields)...');
  try {
    const response = await fetch(`${BASE_URL}/api/spots/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notes: 'Missing latitude, longitude, and spot_type'
      })
    });

    const data = await response.json();
    
    if (response.status === 400) {
      console.log('   ✅ Validation working correctly');
      console.log('   📋 Error message:', data.message || data.error);
    } else {
      console.log('   ❌ Validation not working properly');
      console.log('   📋 Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('   ❌ Request failed:', error.message);
  }

  console.log('');

  // Test 3: Test invalid coordinates
  console.log('3. Testing invalid coordinates...');
  try {
    const response = await fetch(`${BASE_URL}/api/spots/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latitude: 999, // Invalid latitude
        longitude: 999, // Invalid longitude
        spot_type: 'street',
        notes: 'Invalid coordinates test'
      })
    });

    const data = await response.json();
    console.log('   📋 Response for invalid coordinates:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('   ❌ Request failed:', error.message);
  }

  console.log('');

  // Test 4: Test different spot types
  console.log('4. Testing different spot types...');
  const spotTypes = ['street', 'garage', 'lot', 'meter'];
  
  for (const spotType of spotTypes) {
    try {
      const response = await fetch(`${BASE_URL}/api/spots/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: 40.7500 + Math.random() * 0.01, // Random nearby coordinates
          longitude: -73.9900 + Math.random() * 0.01,
          spot_type: spotType,
          notes: `Test ${spotType} parking spot`,
          report_type: 'new_spot'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log(`   ✅ ${spotType} spot type working`);
      } else {
        console.log(`   ❌ ${spotType} spot type failed:`, data.message || data.error);
      }
    } catch (error) {
      console.log(`   ❌ ${spotType} request failed:`, error.message);
    }
  }

  console.log('\n🎉 Spot Reporting API Test Complete!');
}

// Helper function to check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}

// Run tests
async function main() {
  console.log('🔍 Checking if server is running...');
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Server not running at', BASE_URL);
    console.log('💡 Start the server with: npm run dev');
    process.exit(1);
  }

  console.log('✅ Server is running\n');
  await testSpotReportingAPI();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testSpotReportingAPI };
