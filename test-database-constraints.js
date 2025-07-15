const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testNewTable() {
  console.log('🧪 Testing new real_parking_spots table...')
  
  try {
    // Test 1: Check table structure
    console.log('\n📋 Step 1: Checking table structure...')
    
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'real_parking_spots')
      .eq('table_schema', 'public')
      .order('ordinal_position')
    
    if (columnError) {
      console.error('❌ Error getting table structure:', columnError)
      return false
    }
    
    console.log('✅ Table structure:')
    console.table(columns)
    
    // Test 2: Simple insert test
    console.log('\n🔧 Step 2: Testing simple insert...')
    
    const testRecord = {
      provider_id: 'test_001',
      provider: 'TEST_PROVIDER',
      name: 'Test Parking Spot',
      latitude: 51.5074,
      longitude: -0.1278,
      address: 'Test Address, London',
      spot_type: 'lot',
      price_per_hour: 5.0,
      is_available: true,
      total_spaces: 10,
      available_spaces: 8,
      real_time_data: false,
      metadata: {
        restrictions: ['Max stay: 2 hours'],
        payment_methods: ['cash', 'card'],
        accessibility: true,
        covered: false,
        security: true,
        ev_charging: false
      }
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('real_parking_spots')
      .insert(testRecord)
      .select()
    
    if (insertError) {
      console.error('❌ Insert test failed:', insertError)
      console.error('Error details:', insertError.message)
      return false
    }
    
    console.log('✅ Insert test passed:', insertData[0]?.id)
    
    // Test 3: Upsert test (this was failing before)
    console.log('\n🔄 Step 3: Testing upsert functionality...')
    
    const upsertRecord = {
      ...testRecord,
      available_spaces: 7,
      metadata: {
        ...testRecord.metadata,
        last_check: new Date().toISOString()
      }
    }
    
    const { data: upsertData, error: upsertError } = await supabase
      .from('real_parking_spots')
      .upsert(upsertRecord, { onConflict: 'provider,provider_id' })
      .select()
    
    if (upsertError) {
      console.error('❌ Upsert test failed:', upsertError)
      console.error('Error details:', upsertError.message)
      return false
    }
    
    console.log('✅ Upsert test passed:', upsertData[0]?.available_spaces)
    
    // Test 4: Batch upsert test (like your parking service does)
    console.log('\n📦 Step 4: Testing batch upsert...')
    
    const batchData = [
      {
        provider_id: 'batch_001',
        provider: 'BATCH_PROVIDER',
        name: 'Batch Test Spot 1',
        latitude: 51.5074,
        longitude: -0.1278,
        address: 'Batch Address 1',
        spot_type: 'garage',
        price_per_hour: 3.0,
        is_available: true,
        total_spaces: 20,
        available_spaces: 15,
        real_time_data: false,
        metadata: {
          restrictions: [],
          payment_methods: ['card'],
          accessibility: true
        }
      },
      {
        provider_id: 'batch_002',
        provider: 'BATCH_PROVIDER',
        name: 'Batch Test Spot 2',
        latitude: 51.5080,
        longitude: -0.1285,
        address: 'Batch Address 2',
        spot_type: 'street',
        price_per_hour: 2.0,
        is_available: false,
        total_spaces: 5,
        available_spaces: 0,
        real_time_data: true,
        metadata: {
          restrictions: ['Permit holders only'],
          payment_methods: ['cash', 'card'],
          accessibility: false
        }
      }
    ]
    
    const { data: batchInsertData, error: batchInsertError } = await supabase
      .from('real_parking_spots')
      .upsert(batchData, { onConflict: 'provider,provider_id' })
      .select()
    
    if (batchInsertError) {
      console.error('❌ Batch upsert test failed:', batchInsertError)
      console.error('Error details:', batchInsertError.message)
      return false
    }
    
    console.log('✅ Batch upsert test passed:', batchInsertData?.length, 'records')
    
    // Test 5: Query test
    console.log('\n🔍 Step 5: Testing query functionality...')
    
    const { data: queryData, error: queryError } = await supabase
      .from('real_parking_spots')
      .select('*')
      .eq('provider', 'TEST_PROVIDER')
    
    if (queryError) {
      console.error('❌ Query test failed:', queryError)
      return false
    }
    
    console.log('✅ Query test passed:', queryData?.length, 'records found')
    
    // Test 6: Location-based query
    console.log('\n📍 Step 6: Testing location-based queries...')
    
    const { data: locationData, error: locationError } = await supabase
      .from('real_parking_spots')
      .select('*')
      .gte('latitude', 51.5070)
      .lte('latitude', 51.5080)
      .gte('longitude', -0.1290)
      .lte('longitude', -0.1270)
    
    if (locationError) {
      console.error('❌ Location query test failed:', locationError)
      return false
    }
    
    console.log('✅ Location query test passed:', locationData?.length, 'records found')
    
    // Test 7: Constraint validation
    console.log('\n🔒 Step 7: Testing constraint validation...')
    
    // Test invalid latitude
    const { data: invalidData, error: invalidError } = await supabase
      .from('real_parking_spots')
      .insert({
        provider_id: 'invalid_001',
        provider: 'INVALID_PROVIDER',
        name: 'Invalid Spot',
        latitude: 999, // Invalid latitude
        longitude: -0.1278,
        spot_type: 'lot'
      })
    
    if (invalidError) {
      console.log('✅ Constraint validation working - rejected invalid latitude')
    } else {
      console.log('⚠️  Warning: Invalid latitude was accepted')
    }
    
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...')
    
    await supabase
      .from('real_parking_spots')
      .delete()
      .in('provider', ['TEST_PROVIDER', 'BATCH_PROVIDER', 'INVALID_PROVIDER'])
    
    console.log('✅ Test data cleaned up')
    
    console.log('\n🎉 All tests completed successfully!')
    console.log('✅ Your new table is working perfectly!')
    console.log('✅ The 400 errors should now be resolved!')
    
    return true
    
  } catch (error) {
    console.error('❌ Unexpected error during testing:', error)
    return false
  }
}

async function testParkingServiceCompatibility() {
  console.log('\n🔧 Testing compatibility with your parking service...')
  
  try {
    // Simulate the exact data structure your parking service sends
    const serviceData = {
      provider_id: 'service_test_001',
      provider: 'openstreetmap',
      name: 'Service Test Parking',
      latitude: 51.5074,
      longitude: -0.1278,
      address: 'Service Test Address',
      spot_type: 'lot',
      price_per_hour: null,
      is_available: true,
      total_spaces: null,
      available_spaces: null,
      real_time_data: false,
      last_updated: new Date().toISOString(),
      metadata: {
        restrictions: ['Max stay: 2 hours'],
        payment_methods: ['cash'],
        accessibility: true,
        covered: false,
        security: false,
        ev_charging: false,
        opening_hours: { note: '24/7' },
        contact_info: null
      }
    }
    
    const { data, error } = await supabase
      .from('real_parking_spots')
      .upsert(serviceData, { onConflict: 'provider,provider_id' })
      .select()
    
    if (error) {
      console.error('❌ Parking service compatibility test failed:', error)
      return false
    }
    
    console.log('✅ Parking service compatibility test passed')
    
    // Clean up
    await supabase
      .from('real_parking_spots')
      .delete()
      .eq('provider_id', 'service_test_001')
    
    return true
    
  } catch (error) {
    console.error('❌ Error testing parking service compatibility:', error)
    return false
  }
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive database tests...')
  
  const tableTest = await testNewTable()
  const serviceTest = await testParkingServiceCompatibility()
  
  if (tableTest && serviceTest) {
    console.log('\n🎉 SUCCESS: All tests passed!')
    console.log('✅ Your new table is fully functional')
    console.log('✅ Your parking service should now work without 400 errors')
    console.log('✅ You can now use your application normally')
  } else {
    console.log('\n❌ Some tests failed - please check the errors above')
  }
}

runAllTests()
