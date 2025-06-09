import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a Supabase client that specifically fixes the 406 error
export const supabase406Fix = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      // The key fix: use application/json instead of application/vnd.pgrst.object+json
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    fetch: (url, options = {}) => {
      // Ensure every request uses the correct headers
      const fixedHeaders = {
        Accept: "application/json",
        "Content-Type": "application/json",
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      }

      // If there's an auth token, use it
      if (options.headers && typeof options.headers === "object") {
        const headers = options.headers as Record<string, string>
        if (headers.Authorization && headers.Authorization !== `Bearer ${supabaseAnonKey}`) {
          fixedHeaders.Authorization = headers.Authorization
        }
      }

      const fixedOptions = {
        ...options,
        headers: fixedHeaders,
      }

      console.log("🔧 406 Fix - Request URL:", url.toString())
      console.log("🔧 406 Fix - Headers:", fixedHeaders)

      return fetch(url, fixedOptions)
    },
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Test function to verify the fix works
export async function test406Fix() {
  try {
    console.log("🧪 Testing 406 fix with parking spot query...")

    const { data, error } = await supabase406Fix
      .from("parking_spots")
      .select("id, latitude, longitude, spot_type, address")
      .eq("id", "osm_564759009")
      .maybeSingle()

    if (error) {
      console.error("❌ Test failed:", error)
      return { success: false, error: error.message }
    }

    console.log("✅ Test successful:", data)
    return { success: true, data }
  } catch (error) {
    console.error("❌ Test exception:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
