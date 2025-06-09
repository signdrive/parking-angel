import { NextResponse } from "next/server"
import { test406Fix } from "@/lib/supabase-406-fix"

export async function GET() {
  try {
    console.log("🧪 Testing 406 fix via API route...")

    const result = await test406Fix()

    return NextResponse.json({
      ...result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ API test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
