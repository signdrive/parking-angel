import { createClient } from "@supabase/supabase-js"

export class DatabaseEmergencyRecovery {
  private static instance: DatabaseEmergencyRecovery
  private healthCheckInterval: NodeJS.Timeout | null = null
  private isRecovering = false
  private lastHealthCheck = 0
  private consecutiveFailures = 0

  static getInstance(): DatabaseEmergencyRecovery {
    if (!DatabaseEmergencyRecovery.instance) {
      DatabaseEmergencyRecovery.instance = new DatabaseEmergencyRecovery()
    }
    return DatabaseEmergencyRecovery.instance
  }

  async checkDatabaseHealth(): Promise<{
    healthy: boolean
    status: string
    responseTime: number
    error?: string
  }> {
    const startTime = Date.now()

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        return {
          healthy: false,
          status: "Configuration Error",
          responseTime: 0,
          error: "Missing Supabase configuration",
        }
      }

      const supabase = createClient(supabaseUrl, supabaseKey, {
        global: {
          headers: {
            "Cache-Control": "no-cache",
          },
        },
      })

      // Simple health check query
      const { data, error } = await supabase.from("parking_spots").select("count").limit(1)

      const responseTime = Date.now() - startTime

      if (error) {
        this.consecutiveFailures++
        return {
          healthy: false,
          status: "Database Error",
          responseTime,
          error: error.message,
        }
      }

      this.consecutiveFailures = 0
      return {
        healthy: true,
        status: "Healthy",
        responseTime,
      }
    } catch (error) {
      this.consecutiveFailures++
      return {
        healthy: false,
        status: "Connection Failed",
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async emergencyFallback(): Promise<any[]> {
    // Return mock data when database is unavailable
    return [
      {
        id: "emergency_fallback_1",
        latitude: 51.5074,
        longitude: -0.1278,
        address: "London, UK (Fallback Data)",
        spot_type: "street",
        is_available: true,
        provider: "emergency_fallback",
        confidence_score: 0,
        last_updated: new Date().toISOString(),
      },
    ]
  }

  startHealthMonitoring() {
    if (this.healthCheckInterval) return

    this.healthCheckInterval = setInterval(async () => {
      const health = await this.checkDatabaseHealth()
      this.lastHealthCheck = Date.now()

      // Emit health status event
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("database-health-update", {
            detail: health,
          }),
        )
      }

      console.log(`🏥 Database Health: ${health.status} (${health.responseTime}ms)`)

      if (!health.healthy && this.consecutiveFailures >= 3) {
        console.warn("🚨 Database appears to be down. Consider emergency recovery.")
      }
    }, 30000) // Check every 30 seconds
  }

  stopHealthMonitoring() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }
  }

  getHealthStatus() {
    return {
      lastCheck: this.lastHealthCheck,
      consecutiveFailures: this.consecutiveFailures,
      isRecovering: this.isRecovering,
    }
  }
}
