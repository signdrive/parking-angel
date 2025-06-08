import { NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabase-fixed"

export async function GET() {
  try {
    console.log("Testing Supabase connection...")

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing environment variables",
          details: {
            hasUrl: !!supabaseUrl,
            hasKey: !!supabaseAnonKey,
            urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : "MISSING",
            keyPreview: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : "MISSING",
          },
        },
        { status: 500 },
      )
    }

    // Test connection
    const supabase = getSupabaseClient()

    // Simple query to test connection
    const { data, error } = await supabase.from("profiles").select("count").limit(1)

    if (error) {
      console.error("Supabase query error:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Database query failed",
          details: error,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Supabase connection successful",
      data: data,
    })
  } catch (error) {
    console.error("Supabase connection test failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Connection test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
