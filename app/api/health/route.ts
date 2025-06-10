import { NextResponse } from "next/server"

export async function GET() {
  try {
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: "checking...",
        auth: "checking...",
        environment: "checking...",
      },
    }

    // Check environment variables
    const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]

    const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

    if (missingEnvVars.length > 0) {
      health.services.environment = `Missing: ${missingEnvVars.join(", ")}`
      health.status = "degraded"
    } else {
      health.services.environment = "configured"
    }

    // Check database connection
    try {
      const { supabase } = await import("@/lib/supabase")
      const { error } = await supabase.from("profiles").select("id").limit(1)

      if (error) {
        health.services.database = `Error: ${error.message}`
        health.status = "degraded"
      } else {
        health.services.database = "connected"
      }
    } catch (dbError) {
      health.services.database = `Connection failed: ${dbError instanceof Error ? dbError.message : "Unknown error"}`
      health.status = "degraded"
    }

    // Check auth service
    try {
      await import("@/lib/auth")
      health.services.auth = "available"
    } catch (authError) {
      health.services.auth = `Not available: ${authError instanceof Error ? authError.message : "Unknown error"}`
      health.status = "degraded"
    }

    return NextResponse.json(health)
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    )
  }
}
