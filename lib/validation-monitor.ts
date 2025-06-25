// Automated validation and monitoring system
export class ValidationMonitor {
  private static instance: ValidationMonitor
  private validationResults: Map<string, boolean> = new Map()
  private lastCheck = 0
  private checkInterval = 30000 // 30 seconds

  static getInstance(): ValidationMonitor {
    if (!ValidationMonitor.instance) {
      ValidationMonitor.instance = new ValidationMonitor()
    }
    return ValidationMonitor.instance
  }

  async validatePWACompliance(): Promise<boolean> {
    const checks = [this.checkManifest(), this.checkIcons(), this.checkServiceWorker(), this.checkHTTPS()]

    const results = await Promise.allSettled(checks)
    const allPassed = results.every((result) => result.status === "fulfilled" && result.value)

    this.validationResults.set("pwa-compliance", allPassed)
    return allPassed
  }

  private async checkManifest(): Promise<boolean> {
    try {
      const response = await fetch("/manifest.webmanifest")
      if (!response.ok) return false

      const manifest = await response.json()
      const requiredFields = ["name", "short_name", "start_url", "display", "icons"]

      return requiredFields.every((field) => manifest[field])
    } catch {
      return false
    }
  }

  private async checkIcons(): Promise<boolean> {
    const iconUrls = ["/apple-touch-icon.png", "/icons/icon-192x192.png", "/icons/icon-512x512.png", "/favicon.ico"]

    const checks = iconUrls.map(async (url) => {
      try {
        const response = await fetch(url, { method: "HEAD" })
        return response.ok
      } catch {
        return false
      }
    })

    const results = await Promise.all(checks)
    return results.every((result) => result)
  }

  private async checkServiceWorker(): Promise<boolean> {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return false
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration()
      return !!registration?.active
    } catch {
      return false
    }
  }

  private checkHTTPS(): boolean {
    if (typeof window === "undefined") return true
    return window.location.protocol === "https:" || window.location.hostname === "localhost"
  }

  async validateSupabaseConnection(): Promise<boolean> {
    try {
      const response = await fetch("/api/health/supabase")
      const result = await response.json()

      this.validationResults.set("supabase-connection", result.healthy)
      return result.healthy
    } catch {
      this.validationResults.set("supabase-connection", false)
      return false
    }
  }

  startMonitoring(): void {
    if (typeof window === "undefined") return

    const monitor = async () => {
      const now = Date.now()
      if (now - this.lastCheck < this.checkInterval) return

      this.lastCheck = now

      const [pwaCompliant, supabaseHealthy] = await Promise.all([
        this.validatePWACompliance(),
        this.validateSupabaseConnection(),
      ])

      // Dispatch custom events for monitoring
      window.dispatchEvent(
        new CustomEvent("validation-update", {
          detail: {
            pwaCompliant,
            supabaseHealthy,
            timestamp: now,
          },
        }),
      )

      // Log to analytics
      if (window.gtag) {
        window.gtag("event", "validation_check", {
          pwa_compliant: pwaCompliant,
          supabase_healthy: supabaseHealthy,
        })
      }
    }

    // Initial check
    monitor()

    // Set up interval
    setInterval(monitor, this.checkInterval)

    // Check on visibility change
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        monitor()
      }
    })
  }

  getValidationResults(): Record<string, boolean> {
    return Object.fromEntries(this.validationResults)
  }
}

// Auto-start monitoring in browser
if (typeof window !== "undefined") {
  ValidationMonitor.getInstance().startMonitoring()
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
