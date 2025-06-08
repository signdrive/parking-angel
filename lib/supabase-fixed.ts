import { createClient } from "@supabase/supabase-js"
import { checkSupabaseConfig } from "./supabase-config-check"

let supabaseClient: any = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    try {
      const { supabaseUrl, supabaseAnonKey } = checkSupabaseConfig()

      supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
        global: {
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
        },
      })

      console.log("Supabase client created successfully")
    } catch (error) {
      console.error("Failed to create Supabase client:", error)
      throw error
    }
  }

  return supabaseClient
}

// Export the client
const supabase = getSupabaseClient()
export { supabase }
