export interface LocationCoordinates {
  latitude: number
  longitude: number
  accuracy?: number
  timestamp: number
}

export interface LocationServiceOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
  autoCenter?: boolean
}

export class LocationService {
  private static instance: LocationService
  private currentLocation: LocationCoordinates | null = null
  private watchId: number | null = null
  private callbacks: Set<(location: LocationCoordinates | null) => void> = new Set()
  private errorCallbacks: Set<(error: GeolocationPositionError) => void> = new Set()

  private constructor() {}

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService()
    }
    return LocationService.instance
  }

  async getCurrentLocation(options: LocationServiceOptions = {}): Promise<LocationCoordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"))
        return
      }

      const defaultOptions: PositionOptions = {
        enableHighAccuracy: options.enableHighAccuracy ?? true,
        timeout: options.timeout ?? 10000,
        maximumAge: options.maximumAge ?? 300000, // 5 minutes
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: LocationCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now(),
          }

          this.currentLocation = location
          this.notifyCallbacks(location)
          resolve(location)
        },
        (error) => {
          this.notifyErrorCallbacks(error)
          reject(error)
        },
        defaultOptions,
      )
    })
  }

  startWatching(options: LocationServiceOptions = {}): void {
    if (!navigator.geolocation) {
      throw new Error("Geolocation is not supported by this browser")
    }

    if (this.watchId !== null) {
      this.stopWatching()
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: options.enableHighAccuracy ?? true,
      timeout: options.timeout ?? 10000,
      maximumAge: options.maximumAge ?? 60000, // 1 minute for watching
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location: LocationCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
        }

        this.currentLocation = location
        this.notifyCallbacks(location)
      },
      (error) => {
        this.notifyErrorCallbacks(error)
      },
      defaultOptions,
    )
  }

  stopWatching(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
    }
  }

  getLastKnownLocation(): LocationCoordinates | null {
    return this.currentLocation
  }

  onLocationUpdate(callback: (location: LocationCoordinates | null) => void): () => void {
    this.callbacks.add(callback)

    // Immediately call with current location if available
    if (this.currentLocation) {
      callback(this.currentLocation)
    }

    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback)
    }
  }

  onLocationError(callback: (error: GeolocationPositionError) => void): () => void {
    this.errorCallbacks.add(callback)

    // Return unsubscribe function
    return () => {
      this.errorCallbacks.delete(callback)
    }
  }

  private notifyCallbacks(location: LocationCoordinates): void {
    this.callbacks.forEach((callback) => callback(location))
  }

  private notifyErrorCallbacks(error: GeolocationPositionError): void {
    this.errorCallbacks.forEach((callback) => callback(error))
  }

  async requestPermission(): Promise<PermissionState> {
    if (!navigator.permissions) {
      throw new Error("Permissions API not supported")
    }

    const permission = await navigator.permissions.query({ name: "geolocation" })
    return permission.state
  }

  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1)
    const dLng = this.toRadians(lng2 - lng1)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c * 1000 // Return distance in meters
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }
}
