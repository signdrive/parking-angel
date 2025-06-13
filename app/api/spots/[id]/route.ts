import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { is_available, report_type, notes } = body

    // Update the parking spot
    const { data: spot, error: updateError } = await supabase
      .from("parking_spots")
      .update({
        is_available,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating parking spot:", updateError)
      return NextResponse.json({ error: "Failed to update parking spot" }, { status: 500 })
    }

    // Create a spot report
    if (report_type) {
      await supabase.from("spot_reports").insert({
        spot_id: params.id,
        reporter_id: user.id,
        report_type,
        notes: notes || null,
      })

      // Update user reputation based on report type
      const reputationChange = report_type === "taken" ? 2 : report_type === "invalid" ? -1 : 1
      await supabase.rpc("update_user_reputation", {
        user_id: user.id,
        reputation_change: reputationChange,
      })
    }

    return NextResponse.json({ success: true, spot })
  } catch (error) {
    console.error("Error in spot update API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user owns the spot or has admin privileges
    const { data: spot } = await supabase.from("parking_spots").select("reported_by").eq("id", params.id).single()

    if (!spot || spot.reported_by !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete the parking spot
    const { error: deleteError } = await supabase.from("parking_spots").delete().eq("id", params.id)

    if (deleteError) {
      console.error("Error deleting parking spot:", deleteError)
      return NextResponse.json({ error: "Failed to delete parking spot" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in spot delete API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
