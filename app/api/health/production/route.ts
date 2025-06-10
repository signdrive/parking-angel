import { NextResponse } from "next/server"

export async function GET() {
  try {
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: "production",
      services: {
        database: "unknown",
        auth: "unknown",
        environment: "unknown",
      },
      version: "1.0.0",
    }

    // Check critical environment variables
    const criticalEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]

    const missingEnvVars = criticalEnvVars.filter((envVar) => !process.env[envVar])

    if (missingEnvVars.length > 0) {
      health.services.environment = `Missing critical variables: ${missingEnvVars.join(", ")}`
      health.status = "unhealthy"
    } else {
      health.services.environment = "configured"
    }

    // Test database connection
    try {
      const { createClient } = await import("@supabase/supabase-js")
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

      const { error } = await supabase.from("profiles").select("id").limit(1)

      if (error) {
        health.services.database = `Connection error: ${error.message}`
        if (health.status === "healthy") health.status = "degraded"
      } else {
        health.services.database = "connected"
      }
    } catch (dbError) {
      health.services.database = "connection failed"
      health.status = "unhealthy"
    }

    // Test auth service
    try {
      const { createClient } = await import("@supabase/supabase-js")
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

      const { error } = await supabase.auth.getSession()

      if (error) {
        health.services.auth = `Auth error: ${error.message}`
        if (health.status === "healthy") health.status = "degraded"
      } else {
        health.services.auth = "available"
      }
    } catch (authError) {
      health.services.auth = "unavailable"
      if (health.status === "healthy") health.status = "degraded"
    }

    return NextResponse.json(health, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        environment: "production",
        error: error instanceof Error ? error.message : "System error",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      },
    )
  }
}
