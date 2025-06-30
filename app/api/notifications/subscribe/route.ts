import { type NextRequest, NextResponse } from "next/server";
import { verifyUser } from "@/lib/server-auth";
import { APIError, handleAPIError } from "@/lib/api-error";
import { getServerClient } from "@/lib/supabase/server-utils";
import type { Database } from "@/lib/types/supabase";

type NotificationToken = Database['public']['Tables']['notification_tokens']['Insert'];

export async function POST(request: NextRequest) {
  try {
    // Verify that user is authenticated
    const { user } = await verifyUser(); // Correctly destructure the user object

    const { fcmToken, deviceId, deviceType, deviceName } = await request.json();

    if (!fcmToken) {
      throw new APIError("FCM token is required", 400, "notifications/missing_token");
    }

    if (!deviceId) {
      throw new APIError("Device ID is required", 400, "notifications/missing_device_id");
    }

    const supabase = await getServerClient();

    // First, check if this token already exists for this user
    const { data: existingToken, error: fetchError } = await supabase
      .from('notification_tokens')
      .select('id')
      .match({ user_id: user.id, device_id: deviceId })
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"

      throw new APIError("Failed to check existing token", 500, "notifications/fetch_failed");
    }

    const now = new Date().toISOString();

    if (existingToken) {
      // Update the existing token
      const { error: updateError } = await supabase
        .from('notification_tokens')
        .update({
          fcm_token: fcmToken,
          device_type: deviceType || null,
          device_name: deviceName || null,
          updated_at: now,
          active: true
        } satisfies Partial<NotificationToken>)
        .match({ user_id: user.id, device_id: deviceId });

      if (updateError) {

        throw new APIError("Failed to update notification token", 500, "notifications/update_failed");
      }
    } else {
      // Insert a new token
      const { error: insertError } = await supabase
        .from('notification_tokens')
        .insert({
          user_id: user.id,
          token: fcmToken || deviceId, // Use fcmToken as the primary token
          device_id: deviceId,
          fcm_token: fcmToken,
          device_type: deviceType || null,
          device_name: deviceName || null,
          created_at: now,
          updated_at: now,
          active: true
        } satisfies NotificationToken);

      if (insertError) {

        throw new APIError("Failed to store notification token", 500, "notifications/insert_failed");
      }
    }

    // Update user's notification preferences if they haven't been set
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        notifications_enabled: true,
        updated_at: now
      })
      .eq('id', user.id)
      .is('notifications_enabled', null);

    if (profileError) {
      // This is not a critical error, so just log it

    }

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to notifications",
      deviceId
    });
  } catch (error) {
    return handleAPIError(error);
  }
}
