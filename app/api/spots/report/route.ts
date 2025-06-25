import { type NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server-utils";
import { verifyUser } from "@/lib/server-auth";
import { APIError, handleAPIError } from "@/lib/api-error";
import type { Database } from "@/lib/types/supabase";

type ParkingSpot = Database["public"]["Tables"]["parking_spots"]["Row"];
type SpotReport = Database["public"]["Tables"]["spot_reports"]["Insert"];

export async function POST(request: NextRequest) {
  try {
    const { user } = await verifyUser();
    const supabase = await getServerClient();

    const body = await request.json();
    const { latitude, longitude, spot_type, notes, report_type } = body;

    if (!latitude || !longitude || !spot_type) {
      throw new APIError("Missing required fields", 400, "missing_fields");
    }

    // Create a new parking spot with report
    const { data: spot, error: spotError } = await supabase
      .from("parking_spots")
      .insert({
        name: `Reported Spot at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        latitude,
        longitude,
        spot_type,
        is_available: true,
        reported_by: user.id,
        status: "pending_review",
      })
      .select()
      .single();

    if (spotError) {
      console.error("Error creating parking spot:", spotError);
      throw new APIError("Failed to create parking spot", 500, "spot_creation_failed");
    }

    if (!spot) {
      throw new APIError("Spot creation succeeded but no data returned", 500, "spot_data_missing");
    }

    // Create the associated report
    const { error: reportError } = await supabase.from("spot_reports").insert({
      spot_id: spot.id,
      reporter_id: user.id,
      report_type: report_type || "new_spot",
      notes: notes || `New spot reported at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      status: "pending",
    });

    if (reportError) {
      console.error("Error creating spot report:", reportError);
      // If report creation fails, we should probably delete the spot to avoid orphans
      await supabase.from("parking_spots").delete().eq("id", spot.id);

      throw new APIError("Failed to create spot report", 500, "report_creation_failed");
    }

    return NextResponse.json({
      success: true,
      spot_id: spot.id,
      message: "Spot reported successfully",
    });
  } catch (error) {
    return handleAPIError(error);
  }
}
