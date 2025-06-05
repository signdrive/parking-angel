import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const isSupabaseConfigured = () => {
  // Check if we have the required environment variables
  const hasUrl = !!(supabaseUrl && supabaseUrl !== "")
  const hasKey = !!(supabaseAnonKey && supabaseAnonKey !== "")

  console.log("Supabase config check:", { hasUrl, hasKey, url: supabaseUrl?.substring(0, 20) + "..." })

  return hasUrl && hasKey
}

// Create a mock client for when Supabase is not configured
const createMockClient = () => ({
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
})

// Only create the real client if properly configured
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (createMockClient() as any)

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
