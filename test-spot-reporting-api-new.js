#!/usr/bin/env node

// Comprehensive test for NEW spot reporting API
const BASE_URL = 'http://localhost:3001';

async function testSpotReportingAPI() {
  console.log('🧪 Testing NEW Spot Reporting API...\n');

  // Test 1: Test each spot type
  console.log('1. Testing all spot types...');
  const spotTypes = ['street', 'garage', 'lot', 'private', 'disabled', 'loading'];
  
  for (const spotType of spotTypes) {
    try {
      const response = await fetch(`${BASE_URL}/api/spots/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spot_type: spotType,
          latitude: 40.7589 + Math.random() * 0.01,
          longitude: -73.9851 + Math.random() * 0.01,
          address: `123 Test ${spotType.charAt(0).toUpperCase() + spotType.slice(1)} St`,
          notes: `Test ${spotType} parking spot`,
          status: 'available',
          confidence: 90
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log(`   ✅ ${spotType}: SUCCESS`);
      } else {
        console.log(`   ❌ ${spotType}: FAILED`);
        console.log(`   📋 Error:`, data.error || data.message);
      }
    } catch (error) {
      console.log(`   ❌ ${spotType}: REQUEST FAILED`, error.message);
    }
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
        notes: 'Missing spot_type, latitude, longitude'
      })
    });

    const data = await response.json();
    
    if (response.status === 400 && data.error) {
      console.log('   ✅ Validation working correctly');
      console.log('   📋 Error message:', data.error);
    } else {
      console.log('   ❌ Validation not working properly');
      console.log('   📋 Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('   ❌ Request failed:', error.message);
  }

  console.log('');

  // Test 3: Test invalid spot type
  console.log('3. Testing invalid spot type...');
  try {
    const response = await fetch(`${BASE_URL}/api/spots/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        spot_type: 'invalid_type',
        latitude: 40.7589,
        longitude: -73.9851,
        notes: 'Invalid spot type test'
      })
    });

    const data = await response.json();
    
    if (response.status === 400 && data.error.includes('Invalid spot_type')) {
      console.log('   ✅ Invalid spot type validation working');
      console.log('   📋 Error message:', data.error);
    } else {
      console.log('   ❌ Invalid spot type validation failed');
      console.log('   📋 Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('   ❌ Request failed:', error.message);
  }

  console.log('');

  // Test 4: Test invalid coordinates
  console.log('4. Testing invalid coordinates...');
  try {
    const response = await fetch(`${BASE_URL}/api/spots/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        spot_type: 'street',
        latitude: 999, // Invalid latitude
        longitude: 999, // Invalid longitude
        notes: 'Invalid coordinates test'
      })
    });

    const data = await response.json();
    
    if (response.status === 400 && data.error.includes('Invalid coordinates')) {
      console.log('   ✅ Coordinate validation working');
      console.log('   📋 Error message:', data.error);
    } else {
      console.log('   ❌ Coordinate validation failed');
      console.log('   📋 Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('   ❌ Request failed:', error.message);
  }

  console.log('');

  // Test 5: Test GET reports endpoint
  console.log('5. Testing GET reports endpoint...');
  try {
    const response = await fetch(`${BASE_URL}/api/spots/report?lat=40.7589&lng=-73.9851&radius=1000`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('   ✅ GET reports working');
      console.log('   📊 Found', data.count, 'reports');
      if (data.reports && data.reports.length > 0) {
        console.log('   📋 Sample report:', {
          id: data.reports[0].id,
          spot_type: data.reports[0].spot_type,
          status: data.reports[0].status
        });
      }
    } else {
      console.log('   ❌ GET reports failed');
      console.log('   📋 Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('   ❌ Request failed:', error.message);
  }

  console.log('');

  // Test 6: Test filtering by spot type
  console.log('6. Testing filtering by spot type...');
  try {
    const response = await fetch(`${BASE_URL}/api/spots/report?lat=40.7589&lng=-73.9851&spot_type=street`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('   ✅ Spot type filtering working');
      console.log('   📊 Found', data.count, 'street parking reports');
    } else {
      console.log('   ❌ Spot type filtering failed');
      console.log('   📋 Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('   ❌ Request failed:', error.message);
  }

  console.log('\n🎉 NEW Spot Reporting API Test Complete!');
  console.log('🗂️  Table: spot_reports (should be recreated)');
  console.log('🎨 Modal: Refactored with spot type selection');
  console.log('🔗 API: /api/spots/report (completely rebuilt)');
  console.log('✅ Spot Types: street, garage, lot, private, disabled, loading');
  console.log('📍 Validation: Coordinates, spot types, required fields');
  console.log('🔍 Filtering: By location, spot type, status');
}

// Helper function to check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/api/spots/report?test=1`);
    return true;
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
