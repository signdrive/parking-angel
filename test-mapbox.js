const testMapboxToken = async () => {
  console.log('🔧 Testing Mapbox token API...');
  
  try {
    const response = await fetch('http://localhost:3000/api/mapbox/token');
    console.log('Status:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Token received:', data.token?.substring(0, 20) + '...');
      
      // Test if the token is valid by making a simple request to Mapbox API
      console.log('\n🔍 Testing token validity with Mapbox API...');
      const testResponse = await fetch(`https://api.mapbox.com/styles/v1/mapbox/streets-v11?access_token=${data.token}`);
      console.log('Mapbox API Status:', testResponse.status, testResponse.statusText);
      
      if (testResponse.status === 403) {
        console.log('❌ Token is invalid or expired - getting 403 Forbidden');
      } else if (testResponse.status === 401) {
        console.log('❌ Token is unauthorized - getting 401 Unauthorized');
      } else if (testResponse.ok) {
        console.log('✅ Token is valid!');
      } else {
        console.log('⚠️ Unexpected response:', testResponse.status);
      }
    } else {
      console.log('❌ Failed to fetch token from API');
      const errorData = await response.json();
      console.log('Error:', errorData);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

testMapboxToken();
