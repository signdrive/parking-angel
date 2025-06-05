import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    // This endpoint should be called by a cron job every 5 minutes
    const { data, error } = await supabase.rpc("cleanup_expired_spots")

    if (error) {
      console.error("Error cleaning up expired spots:", error)
      return NextResponse.json({ error: "Failed to cleanup expired spots" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      deleted_count: data,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in cleanup API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
