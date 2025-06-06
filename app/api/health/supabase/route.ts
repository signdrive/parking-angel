import { NextResponse } from "next/server"
import { checkSupabaseHealth } from "@/lib/supabase-bulletproof"

export async function GET() {
  try {
    const isHealthy = await checkSupabaseHealth()

    return NextResponse.json({
      healthy: isHealthy,
      timestamp: new Date().toISOString(),
      service: "supabase",
    })
  } catch (error) {
    return NextResponse.json(
      {
        healthy: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
        service: "supabase",
      },
      { status: 503 },
    )
  }
}
