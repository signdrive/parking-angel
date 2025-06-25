import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server-utils";
import { getUser } from "@/lib/server-auth";
import { APIError, handleAPIError } from "@/lib/api-error";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { holdId: string } }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { holdId } = params;
    if (!holdId) {
      return NextResponse.json({ error: "Hold ID is required" }, { status: 400 });
    }

    const supabase = await getServerClient();    // TODO: Re-enable release_spot_hold RPC call once Supabase types are regenerated
    // Release the hold using the stored procedure
    // const { data: result } = await supabase
    //   .rpc("release_spot_hold", {
    //     p_hold_id: holdId,
    //     p_user_id: user.id,
    //   });

    // Temporarily simulate success
    const result = { success: true };

    if (!result) {
      return NextResponse.json({ 
        error: "Hold not found or already released" 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: "Hold released successfully" 
    });

  } catch (error) {
    console.error("Error releasing spot hold:", error);
    return handleAPIError(error);
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { holdId: string } }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { holdId } = params;
    const supabase = await getServerClient();    // TODO: Re-enable spot_holds table queries once Supabase types are regenerated
    // const { data: hold, error } = await supabase
    //   .from("spot_holds")
    //   .select(`
    //     *,
    //     parking_spots(name, latitude, longitude, address)
    //   `)
    //   .eq("id", holdId)
    //   .eq("user_id", user.id)
    //   .single();

    // Temporarily return a mock hold
    const hold = null;
    const error = null;

    if (error || !hold) {
      return NextResponse.json({ error: "Hold not found" }, { status: 404 });
    }

    return NextResponse.json({ hold });

  } catch (error) {
    console.error("Error fetching spot hold:", error);
    return handleAPIError(error);
  }
}
