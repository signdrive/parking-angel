export class NavigationHealthCheck {
  private static instance: NavigationHealthCheck

  private constructor() {}

  static getInstance(): NavigationHealthCheck {
    if (!NavigationHealthCheck.instance) {
      NavigationHealthCheck.instance = new NavigationHealthCheck()
    }
    return NavigationHealthCheck.instance
  }

  async checkNavigationReadiness(): Promise<{
    isReady: boolean
    issues: string[]
    recommendations: string[]
  }> {
    const issues: string[] = []
    const recommendations: string[] = []

    // Check geolocation
    if (!navigator.geolocation) {
      issues.push("Geolocation not supported")
      recommendations.push("Use a modern browser with location support")
    }

    // Check network connectivity
    if (!navigator.onLine) {
      issues.push("No network connection")
      recommendations.push("Check your internet connection")
    }

    // Check local storage
    try {
      localStorage.setItem("test", "test")
      localStorage.removeItem("test")
    } catch (error) {
      issues.push("Local storage unavailable")
      recommendations.push("Enable local storage in browser settings")
    }

    // Check speech synthesis for voice guidance
    if (!window.speechSynthesis) {
      issues.push("Voice guidance unavailable")
      recommendations.push("Voice navigation will be disabled")
    }

    // Test API connectivity
    try {
      const response = await fetch("/api/mapbox/status", {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      })
      if (!response.ok) {
        issues.push("Map service unavailable")
        recommendations.push("Map will use fallback mode")
      }
    } catch (error) {
      issues.push("Cannot connect to map service")
      recommendations.push("Using offline navigation mode")
    }

    return {
      isReady: issues.length === 0,
      issues,
      recommendations,
    }
  }

  async performLocationTest(): Promise<{
    success: boolean
    location?: { latitude: number; longitude: number }
    error?: string
  }> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ success: false, error: "Geolocation not supported" })
        return
      }

      const timeout = setTimeout(() => {
        resolve({ success: false, error: "Location request timed out" })
      }, 10000)

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeout)
          resolve({
            success: true,
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          })
        },
        (error) => {
          clearTimeout(timeout)
          resolve({
            success: false,
            error: `Location error: ${error.message}`,
          })
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 60000,
        },
      )
    })
  }
}
