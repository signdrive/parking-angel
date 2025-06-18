import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser, createOrUpdateProfile } from "@/lib/auth"
import { APIError, handleAPIError } from "@/lib/api-error"

export async function POST(request: NextRequest) {
  try {
    const { user, error: userError } = await getCurrentUser()

    if (userError || !user) {
      throw new APIError("Not authenticated", 401, "auth_required")
    }

    // Try to create or update the profile
    const { profile, error: profileError } = await createOrUpdateProfile({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name,
      avatar_url: user.user_metadata?.avatar_url,
    })

    if (profileError) {
      throw new APIError(
        "Failed to create/update profile",
        500,
        "profile_update_failed",
      )
    }

    return NextResponse.json({
      success: true,
      msg: "Profile created/updated successfully",
      profile,
    })
  } catch (error) {
    return handleAPIError(error)
  }
}
