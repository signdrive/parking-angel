import { createClient } from "@supabase/supabase-js"

// Connection retry configuration
const CONNECTION_CONFIG = {
  maxRetries: 5,
  retryDelay: 1000,
  maxDelay: 10000,
  timeout: 30000,
}

// Create a more resilient Supabase client
export function createResilientClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials")
    throw new Error("Supabase URL and key must be provided")
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
      fetch: customFetch,
    },
    db: {
      schema: "public",
    },
    realtime: {
      params: {
        eventsPerSecond: 5, // Reduce to avoid rate limiting
      },
    },
  })
}

// Custom fetch with retry logic
async function customFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let lastError: Error | null = null
  let delay = CONNECTION_CONFIG.retryDelay

  for (let attempt = 0; attempt <= CONNECTION_CONFIG.maxRetries; attempt++) {
    try {
      // Add timeout to fetch
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), CONNECTION_CONFIG.timeout)

      const fetchInit = {
        ...init,
        signal: controller.signal,
      }

      const response = await fetch(input, fetchInit)
      clearTimeout(timeoutId)

      // If we get a 503, retry
      if (response.status === 503) {
        lastError = new Error(`Service unavailable (503) on attempt ${attempt + 1}`)

        // On last attempt, return the error response
        if (attempt === CONNECTION_CONFIG.maxRetries) {
          return response
        }
      } else {
        // For other responses, return immediately
        return response
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // If it's not a timeout or network error, don't retry
      if (
        !lastError.message.includes("timeout") &&
        !lastError.message.includes("network") &&
        !lastError.message.includes("abort") &&
        !lastError.message.includes("failed")
      ) {
        throw lastError
      }

      // On last attempt, throw the error
      if (attempt === CONNECTION_CONFIG.maxRetries) {
        throw lastError
      }
    }

    // Exponential backoff with jitter
    const jitter = Math.random() * 0.3 + 0.85 // Random value between 0.85 and 1.15
    delay = Math.min(delay * 2 * jitter, CONNECTION_CONFIG.maxDelay)

    console.log(`Retrying database connection in ${Math.round(delay)}ms (attempt ${attempt + 1})`)
    await new Promise((resolve) => setTimeout(resolve, delay))
  }

  // This should never happen due to the throw in the loop
  throw lastError || new Error("Unknown error during fetch")
}

// Singleton instance
let resilientClient: ReturnType<typeof createClient> | null = null

export function getResilientClient() {
  if (!resilientClient) {
    resilientClient = createResilientClient()
  }
  return resilientClient
}

// Health check function
export async function checkDatabaseConnection(): Promise<{
  connected: boolean
  latency?: number
  error?: string
}> {
  const startTime = Date.now()

  try {
    const client = getResilientClient()
    const { data, error } = await client.from("parking_spots").select("count").limit(1).maybeSingle()

    const latency = Date.now() - startTime

    if (error) {
      return {
        connected: false,
        latency,
        error: error.message,
      }
    }

    return {
      connected: true,
      latency,
    }
  } catch (error) {
    return {
      connected: false,
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Connection pool management
export function resetConnectionPool() {
  resilientClient = null
  console.log("Database connection pool reset")
}
