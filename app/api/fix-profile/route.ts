import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser, createOrUpdateProfile } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

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
