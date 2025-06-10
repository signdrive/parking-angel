import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { createClient } from "@supabase/supabase-js"

// Create admin client for bypassing RLS when needed
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

async function checkAdminAccess(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader) return false

  try {
    const token = authHeader.replace("Bearer ", "")
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user) return false

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("is_admin, email").eq("id", user.id).single()

    return profile?.is_admin === true || ["admin@parkalgo.com", "admin@parkingangel.com"].includes(profile?.email || "")
  } catch {
    return false
  }
}

export async function GET(request: Request) {
  try {
    // Check admin access
    const isAdmin = await checkAdminAccess(request)
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user locations from the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { data: locations, error } = await supabaseAdmin
      .from("user_locations")
      .select(`
        id,
        latitude,
        longitude,
        created_at,
        user_id,
        profiles!inner(email)
      `)
      .gte("created_at", oneDayAgo)
      .order("created_at", { ascending: false })
      .limit(1000)

    if (error) {
      console.error("Error fetching user locations:", error)
      return NextResponse.json([])
    }

    const formattedLocations =
      locations?.map((location) => ({
        id: location.id,
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: location.created_at,
        userId: location.user_id,
        userEmail: location.profiles?.email,
      })) || []

    return NextResponse.json(formattedLocations)
  } catch (error) {
    console.error("Error in user locations API:", error)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const { latitude, longitude, userId } = await request.json()

    if (!latitude || !longitude || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("user_locations")
      .insert({
        latitude,
        longitude,
        user_id: userId,
        created_at: new Date().toISOString(),
        consent_given: true, // Assuming consent is given when posting
      })
      .select()

    if (error) {
      console.error("Error saving user location:", error)
      return NextResponse.json({ error: "Failed to save location" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error in POST user locations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
