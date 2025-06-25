import { type NextRequest, NextResponse } from "next/server"
import { getServerClient } from "@/lib/supabase/server-utils"
import { verifyUser } from "@/lib/server-auth"
import { APIError, handleAPIError } from "@/lib/api-error"

export async function POST(request: NextRequest) {
  try {
    // Check for admin role - only admins or cron jobs should run cleanup
    const isAdmin = request.headers.get("x-cron-secret") === process.env.CRON_SECRET
    if (!isAdmin) {
      await verifyUser("admin")
    }

    const supabase = await getServerClient()
    const { data, error } = await supabase.rpc("cleanup_expired_spots")

    if (error) {
      throw new APIError("Failed to cleanup expired spots", 500, "cleanup_failed")
    }

    // Also cleanup stale notification tokens (inactive for more than 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { error: tokenError } = await supabase
      .from("notification_tokens")
      .delete()
      .lt("updated_at", thirtyDaysAgo.toISOString())
      .is("is_active", false)

    if (tokenError) {
      console.error("Failed to cleanup notification tokens:", tokenError)
    }

    return NextResponse.json({
      success: true,
      spots_deleted: data,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return handleAPIError(error)
  }
}
