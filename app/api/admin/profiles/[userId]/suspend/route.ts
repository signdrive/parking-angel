import { getServerClient } from '@/lib/supabase/server-utils';
import { verifyUser } from '@/lib/server-auth';
import { NextResponse } from 'next/server';
import { APIError, handleAPIError } from '@/lib/api-error';
import type { Database } from '@/lib/types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    // Check if admin
    const { user } = await verifyUser('admin');
    const supabase = await getServerClient();

    // Check if trying to suspend an admin
    const { data: targetProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role, email')
      .eq('id', params.userId)
      .single();

    if (profileError) {
      throw new APIError(
        'Failed to fetch target user profile',
        404,
        'profile_not_found'
      );
    }

    if (!targetProfile) {
      throw new APIError('User not found', 404, 'user_not_found');
    }

    if (targetProfile.role === 'admin') {
      throw new APIError('Cannot suspend an admin', 403, 'cannot_suspend_admin');
    }

    // Get the action from the request body (suspend or unsuspend)
    const { action } = await request.json();

    if (action !== 'suspend' && action !== 'unsuspend') {
      throw new APIError('Invalid action', 400, 'invalid_action');
    }

    const isSuspend = action === 'suspend';

    // Update the user's role
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        role: isSuspend ? 'suspended' : 'user',
        suspended_until: isSuspend
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.userId)
      .select()
      .single();

    if (updateError) {
      throw new APIError(
        `Failed to ${action} user`,
        500,
        `${action}_failed`
      );
    }

    if (!updatedProfile) {
      throw new APIError(
        'Profile update succeeded but no data returned',
        500,
        'update_no_data'
      );
    }

    // Log the action
    const { error: logError } = await supabase
      .from('admin_logs')
      .insert({
        admin_id: user.id,
        action: isSuspend ? 'user_suspended' : 'user_unsuspended',
        target_id: params.userId,
        details: {
          email: targetProfile.email,
          previous_role: targetProfile.role,
          new_role: updatedProfile.role
        },
        created_at: new Date().toISOString()
      });

    if (logError) {
      console.error('Failed to log admin action:', logError);
    }

    return NextResponse.json({
      success: true,
      message: `User ${isSuspend ? 'suspended' : 'unsuspended'} successfully`
    });
  } catch (error) {
    return handleAPIError(error);
  }
}
