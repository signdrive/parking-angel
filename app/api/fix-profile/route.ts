import { type NextRequest, NextResponse } from "next/server"
import { getServerClient } from "@/lib/supabase/server-utils"
import { getUser } from "@/lib/server-auth"

async function createOrUpdateProfile(user: any) {
  const supabase = await getServerClient()
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, email: user.email }, { onConflict: "id" })
    .select()
    .single()
  return { data, error }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Try to create or update the profile
    const result = await createOrUpdateProfile(user)

    if (result.error) {
      return NextResponse.json(
        {
          error: "Failed to create profile",
          details: result.error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Profile created/updated successfully",
      profile: result.data,
    })
  } catch (error) {
    console.error("Error in fix-profile API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
