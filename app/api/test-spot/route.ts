import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = await fetch(
      "https://vzhvpecwnjssurxbyzph.supabase.co/rest/v1/parking_spots?select=id,latitude,longitude,spot_type,address&limit=1",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        },
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      data,
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
    })
  } catch (error) {
    console.error("Test spot error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
