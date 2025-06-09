import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Only use the server-side API key, never reference NEXT_PUBLIC_ variables
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      console.error("Missing Google Maps API key in server environment")
      return NextResponse.json(
        {
          error: "Maps configuration not available",
          useFallback: true,
        },
        { status: 200 }, // Return 200 so client can use fallback
      )
    }

    return NextResponse.json({
      apiKey,
      libraries: ["places", "geometry"],
      region: "US",
      language: "en",
    })
  } catch (error) {
    console.error("Error fetching maps config:", error)
    return NextResponse.json(
      {
        error: "Failed to load maps configuration",
        useFallback: true,
      },
      { status: 200 }, // Return 200 so client can use fallback
    )
  }
}
