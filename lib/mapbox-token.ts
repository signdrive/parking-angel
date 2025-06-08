// Cache for the Mapbox token
let mapboxToken: string | null = null

/**
 * Sets the Mapbox token for use throughout the application
 * @param token The Mapbox access token
 */
export const setMapboxToken = (token: string): void => {
  if (!token) {
    console.error("Attempted to set empty Mapbox token")
    return
  }

  console.log("Setting Mapbox token:", token.substring(0, 5) + "...")
  mapboxToken = token
}

/**
 * Gets the cached Mapbox token or fetches a new one if not available
 * @returns Promise resolving to the Mapbox token
 */
export const getMapboxToken = async (): Promise<string> => {
  // Return cached token if available
  if (mapboxToken) {
    return mapboxToken
  }

  try {
    // Fetch token from our secure API endpoint
    const response = await fetch("/api/mapbox/token")

    if (!response.ok) {
      throw new Error(`Failed to fetch Mapbox token: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.token) {
      throw new Error("No token returned from API")
    }

    // Cache the token
    setMapboxToken(data.token)
    return data.token
  } catch (error) {
    console.error("Error fetching Mapbox token:", error)
    throw error
  }
}

/**
 * Initializes Mapbox with the token
 * @param mapboxgl The mapboxgl instance to initialize
 * @returns Promise resolving when initialization is complete
 */
export const initializeMapbox = async (mapboxgl: any): Promise<void> => {
  try {
    const token = await getMapboxToken()

    // Check if mapboxgl is properly loaded
    if (!mapboxgl || typeof mapboxgl.accessToken === "undefined") {
      throw new Error("Mapbox GL JS not properly loaded")
    }

    // Set the token on the mapboxgl instance
    mapboxgl.accessToken = token

    console.log("Mapbox initialized successfully")
  } catch (error) {
    console.error("Failed to initialize Mapbox:", error)
    throw error
  }
}
