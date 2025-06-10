export class LocationService {
  private static instance: LocationService
  private currentLocation: GeolocationPosition | null = null
  private watchId: number | null = null
  private callbacks: Set<(location: GeolocationPosition) => void> = new Set()

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService()
    }
    return LocationService.instance
  }

  async getCurrentLocation(options?: PositionOptions): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.currentLocation = position
          this.notifyCallbacks(position)
          resolve(position)
        },
        (error) => {
          console.error("Geolocation error:", error)
          reject(this.getLocationError(error))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
          ...options,
        },
      )
    })
  }

  async requestPermission(): Promise<PermissionState> {
    if (!navigator.permissions) {
      // Fallback for browsers without permissions API
      try {
        await this.getCurrentLocation()
        return "granted"
      } catch {
        return "denied"
      }
    }

    const permission = await navigator.permissions.query({ name: "geolocation" })
    return permission.state
  }

  startWatching(callback: (location: GeolocationPosition) => void): number | null {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported")
      return null
    }

    this.callbacks.add(callback)

    if (!this.watchId) {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          this.currentLocation = position
          this.notifyCallbacks(position)
        },
        (error) => {
          console.error("Geolocation watch error:", error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        },
      )
    }

    return this.watchId
  }

  stopWatching(callback?: (location: GeolocationPosition) => void): void {
    if (callback) {
      this.callbacks.delete(callback)
    }

    if (this.callbacks.size === 0 && this.watchId) {
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
    }
  }

  private notifyCallbacks(location: GeolocationPosition): void {
    this.callbacks.forEach((callback) => {
      try {
        callback(location)
      } catch (error) {
        console.error("Error in location callback:", error)
      }
    })
  }

  private getLocationError(error: GeolocationPositionError): Error {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return new Error("Location access denied by user")
      case error.POSITION_UNAVAILABLE:
        return new Error("Location information unavailable")
      case error.TIMEOUT:
        return new Error("Location request timed out")
      default:
        return new Error("An unknown location error occurred")
    }
  }

  getLastKnownLocation(): GeolocationPosition | null {
    return this.currentLocation
  }

  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c * 1000 // Return distance in meters
  }
}

export default LocationService
