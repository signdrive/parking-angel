import { type NextRequest, NextResponse } from "next/server";
import { verifyUser } from "@/lib/server-auth";
import { APIError, handleAPIError } from "@/lib/api-error";
import { getServerClient } from "@/lib/supabase/server-utils";
import type { Database } from "@/lib/types/database";

type NotificationToken = Database['public']['Tables']['notification_tokens']['Insert'];

export async function POST(request: NextRequest) {
  try {
    const { user } = await verifyUser();
    const { fcmToken, deviceId, deviceType, deviceName } = await request.json();

    if (!fcmToken) {
      throw new APIError("FCM token is required", 400, "notifications/missing_token");
    }

    if (!deviceId) {
      throw new APIError("Device ID is required", 400, "notifications/missing_device_id");
    }

    const supabase = await getServerClient();
    const now = new Date().toISOString();

    // Check for existing token
    const { data: existingToken, error: fetchError } = await supabase
      .from('notification_tokens')
      .select('id')
      .match({ user_id: user.id, device_id: deviceId })
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new APIError("Failed to check existing token", 500, "notifications/fetch_failed");
    }

    if (existingToken) {
      // Update existing token
      const { error: updateError } = await supabase
        .from('notification_tokens')
        .update({
          token: fcmToken,
          device_type: deviceType,
          device_name: deviceName || null,
          updated_at: now,
          active: true
        })
        .eq('id', existingToken.id);

      if (updateError) {
        throw new APIError("Failed to update token", 500, "notifications/update_failed");
      }
    } else {
      // Insert new token
      const { error: insertError } = await supabase
        .from('notification_tokens')
        .insert({
          user_id: user.id,
          token: fcmToken,
          device_id: deviceId,
          device_type: deviceType,
          device_name: deviceName || null,
          active: true,
          created_at: now,
          updated_at: now
        });

      if (insertError) {
        throw new APIError("Failed to save token", 500, "notifications/insert_failed");
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleAPIError(error);
  }
}
