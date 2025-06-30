import { type NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server-utils";
import { verifyUser } from "@/lib/server-auth";
import { APIError, handleAPIError } from "@/lib/api-error";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user } = await verifyUser();
    const supabase = await getServerClient();

    const body = await request.json();
    const { is_available, report_type, notes } = body;

    // Update the parking spot
    const { data: spot, error: updateError } = await supabase
      .from("parking_spots")
      .update({
        is_available,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single();

    if (updateError) {

      throw new APIError("Failed to update parking spot", 500, "update_failed");
    }

    // Create a spot report if report type is provided
    if (report_type) {
      const { error: reportError } = await supabase.from("spot_reports").insert({
        spot_id: params.id,
        reporter_id: user.id,
        report_type,
        notes,
        status: "pending",
      });

      if (reportError) {

        throw new APIError("Failed to create spot report", 500, "report_failed");
      }

      // Update user reputation
      const { error: rpcError } = await supabase.rpc("update_user_reputation", {
        user_id: user.id,
        action_type: "report_spot",
        points: 1, // Award 1 point for reporting a spot
      });

      if (rpcError) {

      }
    }

    return NextResponse.json({ spot });
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user } = await verifyUser();
    const supabase = await getServerClient();

    // Verify ownership
    const { data: spot, error: fetchError } = await supabase
      .from("parking_spots")
      .select("reported_by")
      .eq("id", params.id)
      .single();

    if (fetchError) {

      throw new APIError("Could not verify spot ownership.", 500, "fetch_failed");
    }

    if (!spot || spot.reported_by !== user.id) {
      throw new APIError("Unauthorized to delete this spot", 403, "forbidden");
    }

    const { error: deleteError } = await supabase.from("parking_spots").delete().eq("id", params.id);

    if (deleteError) {

      throw new APIError("Failed to delete parking spot", 500, "delete_failed");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleAPIError(error);
  }
}
