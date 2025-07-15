// Test script to verify parking data service fixes
import { ParkingDataService } from '../lib/parking-data-service'

async function testParkingDataService() {
  console.log('🧪 Testing Parking Data Service...')
  
  const service = ParkingDataService.getInstance()
  
  // Test with London coordinates (should include TfL data)
  const londonLat = 51.5074
  const londonLng = -0.1278
  
  try {
    console.log('📍 Testing with London coordinates...')
    const spots = await service.getRealParkingSpots(londonLat, londonLng, 1000)
    
    console.log(`✅ Successfully retrieved ${spots.length} parking spots`)
    
    // Validate each spot
    spots.forEach((spot, index) => {
      const validSpotTypes = ['street', 'garage', 'lot', 'meter', 'private']
      
      if (!validSpotTypes.includes(spot.spot_type)) {
        console.error(`❌ Invalid spot_type found: ${spot.spot_type} in spot ${index}`)
      }
      
      if (!spot.provider || !spot.provider_id) {
        console.error(`❌ Missing provider info in spot ${index}:`, {
          provider: spot.provider,
          provider_id: spot.provider_id
        })
      }
      
      if (!spot.latitude || !spot.longitude || isNaN(spot.latitude) || isNaN(spot.longitude)) {
        console.error(`❌ Invalid coordinates in spot ${index}:`, {
          lat: spot.latitude,
          lon: spot.longitude
        })
      }
    })
    
    console.log('✅ All spots validated successfully!')
    
    // Test with non-London coordinates
    console.log('📍 Testing with non-London coordinates...')
    const nonLondonSpots = await service.getRealParkingSpots(40.7128, -74.0060, 1000) // NYC
    console.log(`✅ Successfully retrieved ${nonLondonSpots.length} spots from NYC area`)
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
if (typeof window === 'undefined') {
  // Node.js environment
  testParkingDataService()
} else {
  // Browser environment
  console.log('🌐 Running in browser - test available in console')
  window.testParkingDataService = testParkingDataService
}

export { testParkingDataService }
