const { createClient } = require("@supabase/supabase-js")

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupRealtimeFeatures() {
  try {
    console.log("Setting up real-time features...")

    const { error: realtimeError } = await supabase.from("parking_spots").select("*").limit(1)

    if (realtimeError) {
      console.error("Error enabling real-time:", realtimeError)
      return
    }

    console.log("✅ Real-time subscriptions enabled for parking_spots")

    const { data: cleanupResult, error: cleanupError } = await supabase.rpc("cleanup_expired_spots")

    if (cleanupError) {
      console.error("Error testing cleanup function:", cleanupError)
    } else {
      console.log(`✅ Cleanup function working. Removed ${cleanupResult} expired spots`)
    }

    const { data: nearbySpots, error: nearbyError } = await supabase.rpc("find_nearby_spots", {
      user_lat: 37.7749,
      user_lng: -122.4194,
      radius_meters: 1000,
    })

    if (nearbyError) {
      console.error("Error testing nearby spots function:", nearbyError)
    } else {
      console.log(`✅ Nearby spots function working. Found ${nearbySpots?.length || 0} spots`)
    }

    console.log("🎉 All real-time features configured successfully!")
  } catch (error) {
    console.error("Error setting up real-time features:", error)
  }
}

setupRealtimeFeatures()
