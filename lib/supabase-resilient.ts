import { createClient } from "@supabase/supabase-js"
import { DatabaseEmergencyRecovery } from "./database-emergency-recovery"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const resilientSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
}

export async function resilientQuery<T>(
  queryFn: () => Promise<{ data: T; error: any }>,
  fallbackData?: T,
): Promise<{ data: T; error: any; fromFallback?: boolean }> {
  let lastError: any = null

  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      const result = await queryFn()

      // If successful, return immediately
      if (!result.error) {
        return result
      }

      lastError = result.error

      // Check if it's a 503 or connection error
      if (
        result.error?.message?.includes("503") ||
        result.error?.message?.includes("Service Unavailable") ||
        result.error?.message?.includes("network") ||
        result.error?.status === 503
      ) {
        console.warn(`🔄 Attempt ${attempt + 1} failed with 503, retrying...`)

        if (attempt < RETRY_CONFIG.maxRetries) {
          const delay = Math.min(
            RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt),
            RETRY_CONFIG.maxDelay,
          )
          await new Promise((resolve) => setTimeout(resolve, delay))
          continue
        }
      } else {
        // Non-503 error, don't retry
        break
      }
    } catch (error) {
      lastError = error
      console.error(`🚨 Query attempt ${attempt + 1} failed:`, error)

      if (attempt < RETRY_CONFIG.maxRetries) {
        const delay = Math.min(
          RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt),
          RETRY_CONFIG.maxDelay,
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  // All retries failed, use fallback if available
  if (fallbackData !== undefined) {
    console.warn("🆘 Using fallback data due to database unavailability")
    return {
      data: fallbackData,
      error: null,
      fromFallback: true,
    }
  }

  // No fallback, return the last error
  return {
    data: null as T,
    error: lastError,
  }
}

// Specific function for parking spots with fallback
export async function getParkingSpotsResilient(params: {
  lat?: number
  lng?: number
  radius?: number
  limit?: number
}) {
  const recovery = DatabaseEmergencyRecovery.getInstance()

  return resilientQuery(
    async () => {
      if (params.lat && params.lng) {
        return await resilientSupabase.rpc("get_available_parking_spots", {
          max_results: params.limit || 50,
        })
      } else {
        return await resilientSupabase
          .from("parking_spots")
          .select("*")
          .eq("is_available", true)
          .limit(params.limit || 50)
      }
    },
    await recovery.emergencyFallback(), // Fallback data
  )
}
