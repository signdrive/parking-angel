import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Export the function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  // Check if we have the required environment variables
  const hasUrl = !!(supabaseUrl && supabaseUrl !== "")
  const hasKey = !!(supabaseAnonKey && supabaseAnonKey !== "")

  console.log("Supabase config check:", { hasUrl, hasKey, url: supabaseUrl?.substring(0, 20) + "..." })

  return hasUrl && hasKey
}

// Custom fetch function with retry logic
async function customFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const MAX_RETRIES = 3
  let retries = 0
  let lastError: Error | null = null

  while (retries < MAX_RETRIES) {
    try {
      const response = await fetch(input, {
        ...init,
        // Add a timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000),
      })

      // If we get a 503, retry
      if (response.status === 503) {
        retries++
        console.log(`Supabase returned 503, retry ${retries}/${MAX_RETRIES}`)
        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retries)))
        continue
      }

      return response
    } catch (error) {
      lastError = error as Error
      retries++

      // Only retry network errors or timeouts
      if (error instanceof TypeError || error instanceof DOMException) {
        console.log(`Network error, retry ${retries}/${MAX_RETRIES}`, error)
        await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retries)))
        continue
      }

      throw error
    }
  }

  console.error("Max retries reached for Supabase request", lastError)
  throw lastError || new Error("Max retries reached for Supabase request")
}

// Create a single supabase client for interacting with your database
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        headers: {
          "x-application-name": "parking-angel",
        },
        fetch: customFetch,
      },
    })
  : (createMockClient() as any)

// Create a mock client for when Supabase is not configured
function createMockClient() {
  return {
    auth: {
      getSession: () => {
        console.log("Mock Supabase: getSession called")
        return Promise.resolve({ data: { session: null }, error: null })
      },
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
      signUp: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: (callback: any) => {
        console.log("Mock Supabase: onAuthStateChange called")
        // Call the callback immediately with no user
        setTimeout(() => callback("INITIAL_SESSION", null), 100)
        return { data: { subscription: { unsubscribe: () => {} } } }
      },
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
          limit: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
        }),
        limit: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
      }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
        }),
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
          }),
        }),
      }),
      delete: () => ({
        eq: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
      }),
    }),
    rpc: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
    channel: () => ({
      on: () => ({ subscribe: () => {} }),
    }),
    removeChannel: () => {},
  }
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          reputation_score: number
          total_reports: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          reputation_score?: number
          total_reports?: number
        }
        Update: {
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          reputation_score?: number
          total_reports?: number
        }
      }
      parking_spots: {
        Row: {
          id: string
          latitude: number
          longitude: number
          address: string | null
          spot_type: "street" | "garage" | "lot" | "meter"
          is_available: boolean
          reported_by: string | null
          expires_at: string
          confidence_score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          latitude: number
          longitude: number
          address?: string | null
          spot_type?: "street" | "garage" | "lot" | "meter"
          is_available?: boolean
          reported_by?: string | null
          expires_at?: string
          confidence_score?: number
        }
        Update: {
          is_available?: boolean
          confidence_score?: number
          expires_at?: string
        }
      }
      spot_reports: {
        Row: {
          id: string
          spot_id: string
          reporter_id: string | null
          report_type: "available" | "taken" | "invalid"
          notes: string | null
          photo_url: string | null
          created_at: string
        }
        Insert: {
          spot_id: string
          reporter_id?: string | null
          report_type: "available" | "taken" | "invalid"
          notes?: string | null
          photo_url?: string | null
        }
      }
      spot_reviews: {
        Row: {
          id: string
          spot_id: string
          reviewer_id: string | null
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          spot_id: string
          reviewer_id?: string | null
          rating: number
          comment?: string | null
        }
      }
    }
  }
}
