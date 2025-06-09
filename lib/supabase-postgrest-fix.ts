import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// PostgREST-compliant Supabase client
export const supabasePostgREST = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      // PostgREST expects these specific headers
      Accept: "application/json",
      "Content-Type": "application/json",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "en-US,en;q=0.9",
      // Remove problematic headers that cause 406
      "Accept-Profile": undefined,
      "Content-Profile": undefined,
      Prefer: undefined,
    },
    fetch: (url, options = {}) => {
      // Ensure clean headers for every request
      const cleanHeaders = {
        Accept: "application/json",
        "Content-Type": "application/json",
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        // Explicitly remove PostgREST profile headers
        "Accept-Profile": undefined,
        "Content-Profile": undefined,
        Prefer: undefined,
      }

      const cleanOptions = {
        ...options,
        headers: {
          ...cleanHeaders,
          // Only keep safe headers from original request
          ...(options.headers && typeof options.headers === "object"
            ? Object.fromEntries(
                Object.entries(options.headers).filter(
                  ([key]) => !["Accept-Profile", "Content-Profile", "Prefer"].includes(key),
                ),
              )
            : {}),
        },
      }

      console.log("🔧 PostgREST-compliant request:", {
        url: url.toString(),
        method: cleanOptions.method || "GET",
        headers: cleanOptions.headers,
      })

      return fetch(url, cleanOptions)
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

// Alternative: Raw fetch with minimal headers
export async function rawSupabaseFetch(endpoint: string, params: Record<string, string> = {}) {
  try {
    const url = new URL(`${supabaseUrl}/rest/v1/${endpoint}`)

    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })

    console.log("🔗 Raw Supabase fetch:", url.toString())

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        // Minimal headers that PostgREST accepts
        Accept: "application/json",
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    })

    console.log("📊 Response status:", response.status, response.statusText)
    console.log("📋 Response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Response error:", errorText)
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    console.log("✅ Raw fetch successful, data length:", Array.isArray(data) ? data.length : "N/A")
    return { data, error: null }
  } catch (error) {
    console.error("❌ Raw fetch error:", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
