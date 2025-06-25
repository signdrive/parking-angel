import { getServerClient } from './supabase/server-utils'
import type { PostgrestError, AuthError } from '@supabase/supabase-js'

interface ServiceStatus {
  healthy: boolean
  error?: string
}

interface HealthCheckResult {
  isHealthy: boolean
  services: {
    auth: ServiceStatus
    database: ServiceStatus
    storage: ServiceStatus
  }
  error?: PostgrestError | AuthError | Error | null
  message: string
  healthy?: boolean // For backward compatibility
}

/**
 * Comprehensive health check for Supabase services
 * Checks database access, auth functionality, and storage
 */
export async function checkSupabaseHealth(): Promise<HealthCheckResult> {
  try {
    const supabase = await getServerClient()
    const services: HealthCheckResult['services'] = {
      database: { healthy: true },
      auth: { healthy: true },
      storage: { healthy: true }
    }

    // Check database access
    const dbCheck = await supabase
      .from('notification_log')
      .select('id')
      .limit(1)
      .single()

    if (dbCheck.error) {
      services.database = {
        healthy: false,
        error: dbCheck.error.message
      }
    }

    // Check auth service
    const authCheck = await supabase.auth.getSession()
    if (authCheck.error) {
      services.auth = {
        healthy: false,
        error: authCheck.error.message
      }
    }

    // Check storage service
    const storageCheck = await supabase
      .storage
      .listBuckets()

    if (storageCheck.error) {
      services.storage = {
        healthy: false,
        error: storageCheck.error.message
      }
    }

    const isHealthy = Object.values(services).every(service => service.healthy)
    const failedServices = Object.entries(services)
      .filter(([, status]) => !status.healthy)
      .map(([name, status]) => `${name}: ${status.error}`)

    return {
      isHealthy,
      healthy: isHealthy, // For backward compatibility
      services,
      message: isHealthy 
        ? 'All Supabase services are healthy'
        : `Supabase issues detected: ${failedServices.join('; ')}`
    }
  } catch (error) {
    const errorMessage = (error as Error).message
    console.error('Supabase health check error:', error)
    
    return {
      isHealthy: false,
      services: {
        database: { healthy: false, error: 'Connection failed' },
        auth: { healthy: false, error: 'Connection failed' },
        storage: { healthy: false, error: 'Connection failed' }
      },
      error: error as Error,
      message: `Supabase connection error: ${errorMessage}`
    }
  }
}

/**
 * Attempts to reconnect to Supabase services
 * Returns true if successful, false otherwise
 */
export async function attemptReconnect(): Promise<boolean> {
  try {
    const result = await checkSupabaseHealth()
    return result.isHealthy
  } catch {
    return false
  }
}

/**
 * Monitors the health of Supabase services
 * @param interval - Check interval in milliseconds (default: 30000)
 * @param callback - Optional callback for health status updates
 */
export function monitorHealth(
  interval = 30000,
  callback?: (status: HealthCheckResult) => void
): () => void {
  let timeoutId: NodeJS.Timeout

  const check = async () => {
    const status = await checkSupabaseHealth()
    if (callback) {
      callback(status)
    }
    timeoutId = setTimeout(check, interval)
  }

  check()

  return () => {
    clearTimeout(timeoutId)
  }
}