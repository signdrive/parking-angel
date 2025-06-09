import { NextResponse } from "next/server"
import { checkDatabaseConnection, resetConnectionPool } from "@/lib/supabase-connection-fix"

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams
  const reset = searchParams.get("reset") === "true"

  if (reset) {
    resetConnectionPool()
  }

  try {
    const health = await checkDatabaseConnection()

    if (!health.connected) {
      return NextResponse.json(
        {
          status: "error",
          message: "Database connection failed",
          details: health,
          timestamp: new Date().toISOString(),
        },
        { status: 503 },
      )
    }

    return NextResponse.json({
      status: "healthy",
      message: "Database connection successful",
      details: health,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Health check failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
