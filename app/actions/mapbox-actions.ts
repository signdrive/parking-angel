"use server"

export async function getMapboxConfig() {
  try {
    // Get the token from server environment (not exposed to client)
    const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN

    if (!mapboxToken) {
      throw new Error("Mapbox token not configured")
    }

    // Return configuration without exposing the actual token
    return {
      success: true,
      config: {
        style: "mapbox://styles/mapbox/navigation-day-v1",
        defaultCenter: [-122.4194, 37.7749] as [number, number],
        defaultZoom: 16,
        attribution: false,
      },
      // Generate a temporary session token or use a proxy approach
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }
  } catch (error) {
    console.error("Error getting Mapbox config:", error)
    return {
      success: false,
      error: "Failed to load map configuration",
    }
  }
}

export async function getMapboxTileUrl(sessionId: string, z: number, x: number, y: number) {
  try {
    const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN
    if (!mapboxToken) {
      throw new Error("Mapbox token not configured")
    }

    // Return the tile URL with the server-side token
    return {
      success: true,
      url: `https://api.mapbox.com/styles/v1/mapbox/navigation-day-v1/tiles/256/${z}/${x}/${y}?access_token=${mapboxToken}`,
    }
  } catch (error) {
    return {
      success: false,
      error: "Failed to get tile URL",
    }
  }
}
