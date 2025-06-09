import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create Supabase client with fixed headers
export const supabaseWithFixedHeaders = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      // Fix 406 errors by using standard headers
      Accept: "application/json",
      "Content-Type": "application/json",
      // Remove problematic PostgREST headers
      "Accept-Profile": undefined,
      "Content-Profile": undefined,
      // Ensure proper API key header
      apikey: supabaseAnonKey,
    },
    fetch: (url, options = {}) => {
      // Custom fetch to ensure proper headers
      const fixedOptions = {
        ...options,
        headers: {
          ...options.headers,
          Accept: "application/json",
          "Content-Type": "application/json",
          apikey: supabaseAnonKey,
          // Remove any problematic headers
          "Accept-Profile": undefined,
          "Content-Profile": undefined,
        },
      }

      console.log("🔧 Fixed Supabase request:", url, fixedOptions.headers)
      return fetch(url, fixedOptions)
    },
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: "public",
  },
})

// Alternative direct fetch function for problematic queries
export async function directSupabaseFetch(endpoint: string, params: Record<string, string> = {}) {
  try {
    const url = new URL(`${supabaseUrl}/rest/v1/${endpoint}`)

    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })

    console.log("🔗 Direct Supabase fetch:", url.toString())

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        // Use only essential headers to avoid 406 errors
        Accept: "application/json",
        "Content-Type": "application/json",
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        // Explicitly avoid problematic headers
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Direct fetch successful")
    return { data, error: null }
  } catch (error) {
    console.error("❌ Direct fetch error:", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
