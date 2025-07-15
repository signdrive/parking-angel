#!/usr/bin/env node

// Simple test to verify the parking data service fix
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Test data that matches your table structure
const testData = [
  {
    provider_id: "test_spot_1",
    provider: "test_provider",
    name: "Test Parking Spot",
    latitude: 51.5074,
    longitude: -0.1278,
    address: "123 Test Street, London",
    spot_type: "lot",
    price_per_hour: 2.50,
    is_available: true,
    total_spaces: 10,
    available_spaces: 8,
    real_time_data: false,
    last_updated: new Date().toISOString(),
    metadata: {
      restrictions: ["Max 2 hours"],
      payment_methods: ["card", "cash"],
      accessibility: true,
      covered: false,
      security: true,
      ev_charging: false
    }
  }
]

async function testParkingDataInsert() {
  try {
    console.log("🧪 Testing parking data insert...")
    
    // Test the upsert operation
    const { data, error } = await supabase
      .from("real_parking_spots")
      .upsert(testData, { 
        onConflict: "provider,provider_id",
        ignoreDuplicates: false 
      })

    if (error) {
      console.error("❌ Test failed with error:", error)
      console.error("Error details:", error.message, error.details, error.hint)
      process.exit(1)
    } else {
      console.log("✅ Test passed! Data inserted successfully:", data)
    }

    // Clean up test data
    await supabase
      .from("real_parking_spots")
      .delete()
      .eq("provider", "test_provider")
      .eq("provider_id", "test_spot_1")
    
    console.log("🧹 Test data cleaned up")
    
  } catch (error) {
    console.error("❌ Test failed with exception:", error)
    process.exit(1)
  }
}

testParkingDataInsert()
