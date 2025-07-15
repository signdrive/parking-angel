const testMapboxPermissions = async () => {
  console.log('🔧 Testing Mapbox token permissions and suggesting fixes...');
  
  try {
    // Get token
    const response = await fetch('http://localhost:3000/api/mapbox/token');
    const data = await response.json();
    const token = data.token;
    
    console.log('✅ Token retrieved:', token?.substring(0, 30) + '...');
    
    // Test different endpoints to determine token scope
    const tests = [
      {
        name: 'Basic Styles API',
        url: `https://api.mapbox.com/styles/v1/mapbox/streets-v11?access_token=${token}`,
        critical: true,
        description: 'Required for basic map display'
      },
      {
        name: 'Streets v12 Style',
        url: `https://api.mapbox.com/styles/v1/mapbox/streets-v12?access_token=${token}`,
        critical: true,
        description: 'Current style used in app'
      },
      {
        name: 'Vector Tiles',
        url: `https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/1/0/0.mvt?access_token=${token}`,
        critical: true,
        description: 'Required for map tiles to display'
      },
      {
        name: 'Geocoding API',
        url: `https://api.mapbox.com/geocoding/v5/mapbox.places/test.json?access_token=${token}`,
        critical: false,
        description: 'Used for search and location features'
      },
      {
        name: 'Directions API',
        url: `https://api.mapbox.com/directions/v5/mapbox/driving/-122.4194,37.7749;-122.4094,37.7649?access_token=${token}`,
        critical: false,
        description: 'Used for navigation features'
      }
    ];
    
    console.log('\n📊 Testing API endpoints...\n');
    
    const results = [];
    
    for (const test of tests) {
      try {
        const testResponse = await fetch(test.url);
        const status = testResponse.status;
        const success = testResponse.ok;
        
        results.push({
          ...test,
          status,
          success,
          statusText: testResponse.statusText
        });
        
        const emoji = success ? '✅' : (status === 403 ? '🔒' : '❌');
        const criticality = test.critical ? '[CRITICAL]' : '[OPTIONAL]';
        
        console.log(`${emoji} ${criticality} ${test.name}: ${status} ${testResponse.statusText}`);
        console.log(`   ${test.description}`);
        
        if (!success && test.critical) {
          if (status === 403) {
            console.log(`   🔧 Fix: Your token needs additional permissions for ${test.name.toLowerCase()}`);
          } else if (status === 401) {
            console.log(`   🔧 Fix: Token authentication failed - check if token is valid`);
          }
        }
        console.log('');
        
      } catch (error) {
        results.push({
          ...test,
          status: 'ERROR',
          success: false,
          error: error.message
        });
        console.log(`❌ [ERROR] ${test.name}: ${error.message}`);
        console.log('');
      }
    }
    
    // Analyze results and provide recommendations
    console.log('\n🎯 ANALYSIS & RECOMMENDATIONS:\n');
    
    const criticalFailures = results.filter(r => !r.success && r.critical);
    const optionalFailures = results.filter(r => !r.success && !r.critical);
    
    if (criticalFailures.length === 0) {
      console.log('✅ All critical APIs are working! Your map should function properly.');
    } else {
      console.log('⚠️  CRITICAL ISSUES FOUND:');
      criticalFailures.forEach(failure => {
        console.log(`   - ${failure.name}: ${failure.status}`);
      });
      
      console.log('\n🔧 SOLUTIONS:');
      
      if (criticalFailures.some(f => f.status === 403)) {
        console.log(`
1. UPDATE TOKEN PERMISSIONS:
   Go to https://account.mapbox.com/access-tokens/
   Create a new token or edit existing one with these scopes:
   ✓ styles:read
   ✓ fonts:read
   ✓ sprites:read
   ✓ tiles:read (THIS IS LIKELY MISSING)
   
2. UPDATE ENVIRONMENT VARIABLE:
   Replace the token in your .env.local file:
   NEXT_PUBLIC_MAPBOX_TOKEN="your_new_token_here"
   
3. RESTART YOUR DEVELOPMENT SERVER:
   npm run dev (or yarn dev)`);
      }
      
      if (criticalFailures.some(f => f.status === 401)) {
        console.log(`
🔑 TOKEN AUTHENTICATION ISSUE:
   Your token may be expired or invalid.
   Generate a new token at: https://account.mapbox.com/access-tokens/`);
      }
    }
    
    if (optionalFailures.length > 0) {
      console.log('\n📋 OPTIONAL FEATURES AFFECTED:');
      optionalFailures.forEach(failure => {
        console.log(`   - ${failure.name}: Limited functionality (${failure.status})`);
      });
    }
    
    console.log('\n🔄 TEMPORARY WORKAROUNDS:');
    console.log('   - Map tiles may still load partially');
    console.log('   - Consider using OpenStreetMap as a fallback');
    console.log('   - Some features may work in degraded mode');
    
  } catch (error) {
    console.error('❌ Permission test failed:', error.message);
  }
};

testMapboxPermissions();
