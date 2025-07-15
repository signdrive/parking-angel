const testMapboxDetailed = async () => {
  console.log('🔧 Testing Mapbox token and API endpoints in detail...');
  
  try {
    // 1. Test token endpoint
    console.log('\n1. Testing token endpoint...');
    const response = await fetch('http://localhost:3000/api/mapbox/token');
    console.log('Status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.log('❌ Token API Error:', errorData);
      return;
    }
    
    const data = await response.json();
    const token = data.token;
    console.log('✅ Token received:', token?.substring(0, 20) + '...');
    
    // 2. Test basic API access
    console.log('\n2. Testing basic Mapbox API access...');
    const basicTest = await fetch(`https://api.mapbox.com/styles/v1/mapbox/streets-v11?access_token=${token}`);
    console.log('Basic API Status:', basicTest.status, basicTest.statusText);
    
    // 3. Test streets-v12 style (used in your component)
    console.log('\n3. Testing streets-v12 style (used in component)...');
    const streetsV12Test = await fetch(`https://api.mapbox.com/styles/v1/mapbox/streets-v12?access_token=${token}`);
    console.log('Streets-v12 Status:', streetsV12Test.status, streetsV12Test.statusText);
    
    if (streetsV12Test.ok) {
      const styleData = await streetsV12Test.json();
      console.log('✅ Streets-v12 style accessible');
      console.log('Style sources:', Object.keys(styleData.sources || {}));
    } else {
      console.log('❌ Streets-v12 style not accessible');
    }
    
    // 4. Test tile endpoint specifically
    console.log('\n4. Testing tile endpoints...');
    
    // Test a sample tile request (zoom 1, x=0, y=0 - should always exist)
    const tileTest = await fetch(`https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/1/0/0.mvt?access_token=${token}`);
    console.log('Tile endpoint status:', tileTest.status, tileTest.statusText);
    
    // 5. Test geocoding endpoint
    console.log('\n5. Testing geocoding endpoint...');
    const geocodingTest = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/san%20francisco.json?access_token=${token}`);
    console.log('Geocoding Status:', geocodingTest.status, geocodingTest.statusText);
    
    // 6. Check token permissions and account info
    console.log('\n6. Testing token info endpoint...');
    const tokenInfoTest = await fetch(`https://api.mapbox.com/tokens/v2?access_token=${token}`);
    console.log('Token info status:', tokenInfoTest.status, tokenInfoTest.statusText);
    
    if (tokenInfoTest.ok) {
      const tokenInfo = await tokenInfoTest.json();
      console.log('Token scopes:', tokenInfo.scopes || 'No scopes info');
      console.log('Token usage:', tokenInfo.usage || 'No usage info');
    }
    
    // 7. Test map configuration
    console.log('\n7. Testing map configuration...');
    const mapConfigTest = await fetch('http://localhost:3000/api/mapbox/config');
    console.log('Map config status:', mapConfigTest.status, mapConfigTest.statusText);
    
    if (mapConfigTest.ok) {
      const config = await mapConfigTest.json();
      console.log('✅ Map config:', config);
    }
    
    console.log('\n🎯 Detailed test complete!');
    
  } catch (error) {
    console.error('❌ Detailed test error:', error.message);
  }
};

testMapboxDetailed();
