import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Bulletproof client configuration
export const supabase: SupabaseClient<Database> = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
  db: {
    schema: "public",
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Error codes that require specific handling
export const SUPABASE_ERROR_CODES = {
  PGRST116: "PGRST116", // No rows returned
  PGRST106: "PGRST106", // Multiple rows returned
  PGRST301: "PGRST301", // Invalid JWT
  "406": "406", // Not Acceptable
} as const

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 5000,
}

// Exponential backoff utility
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Generic retry wrapper with exponential backoff
export async function withRetry<T>(operation: () => Promise<T>, retries = RETRY_CONFIG.maxRetries): Promise<T> {
  try {
    return await operation()
  } catch (error: any) {
    if (retries > 0 && shouldRetry(error)) {
      const delayMs = Math.min(
        RETRY_CONFIG.baseDelay * Math.pow(2, RETRY_CONFIG.maxRetries - retries),
        RETRY_CONFIG.maxDelay,
      )

      console.warn(`Retrying operation in ${delayMs}ms. Retries left: ${retries}`, error)
      await delay(delayMs)
      return withRetry(operation, retries - 1)
    }
    throw error
  }
}

// Determine if error should trigger retry
function shouldRetry(error: any): boolean {
  const retryableCodes = ["PGRST116", "PGRST301", "406", "429", "500", "502", "503", "504"]
  return (
    retryableCodes.includes(error?.code) ||
    retryableCodes.includes(error?.status?.toString()) ||
    error?.message?.includes("network") ||
    error?.message?.includes("timeout")
  )
}

// Bulletproof profile operations
export class ProfileService {
  static async getProfile(userId: string) {
    return withRetry(async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle() // Use maybeSingle to avoid PGRST116

      if (error && error.code !== SUPABASE_ERROR_CODES.PGRST116) {
        throw error
      }

      return { data, error: null }
    })
  }

  static async upsertProfile(userId: string, profileData: any) {
    return withRetry(async () => {
      // First, try to get existing profile
      const { data: existing } = await this.getProfile(userId)

      if (existing) {
        // Update existing profile
        const { data, error } = await supabase
          .from("profiles")
          .update({
            ...profileData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId)
          .select()
          .single()

        if (error) throw error
        return { data, error: null }
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from("profiles")
          .insert({
            id: userId,
            ...profileData,
            reputation_score: 100,
            total_reports: 0,
          })
          .select()
          .single()

        if (error) throw error
        return { data, error: null }
      }
    })
  }

  static async atomicProfileCreation(user: any) {
    const profileData = {
      email: user.email,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || "Anonymous User",
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
    }

    try {
      return await this.upsertProfile(user.id, profileData)
    } catch (error: any) {
      console.error("Profile creation failed:", error)

      // Log error for monitoring
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "exception", {
          description: `Profile creation failed: ${error.message}`,
          fatal: false,
        })
      }

      // Return a safe fallback
      return {
        data: null,
        error: { message: "Profile creation failed, but authentication succeeded" },
      }
    }
  }
}

// Health check utility
export async function checkSupabaseHealth(): Promise<boolean> {
  try {
    const { error } = await supabase.from("profiles").select("id").limit(1)

    return !error
  } catch {
    return false
  }
}

// Connection status monitoring
export function monitorSupabaseConnection() {
  if (typeof window === "undefined") return

  let isOnline = true

  const checkConnection = async () => {
    const wasOnline = isOnline
    isOnline = await checkSupabaseHealth()

    if (wasOnline !== isOnline) {
      window.dispatchEvent(
        new CustomEvent("supabase-connection-change", {
          detail: { isOnline },
        }),
      )
    }
  }

  // Check every 30 seconds
  setInterval(checkConnection, 30000)

  // Initial check
  checkConnection()
}
