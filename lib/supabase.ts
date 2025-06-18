import { createBrowserClient } from '@supabase/ssr'

export type Database = {
  public: {
    Tables: {
      parking_spots: {
        Row: {
          id: string
          created_at?: string
          updated_at?: string
          latitude: number
          longitude: number
          address?: string
          available: boolean
          type: string
          price_per_hour?: number
          restrictions?: string
          reported_by?: string
          last_reported?: string
          verified?: boolean
        }
      }
      // Add other tables as needed
    }
  }
}

export function isSupabaseConfigured() {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
