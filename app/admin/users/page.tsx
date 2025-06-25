import { getServerClient } from '@/lib/supabase/server-utils';
import { verifyUser } from '@/lib/server-auth';
import AdminLayout from '@/components/admin/AdminLayout';
import UserList from '@/components/admin/UserList';
import { redirect } from 'next/navigation';
import type { Database } from '@/lib/types/supabase';
import type { UserRole, SubscriptionStatus, SubscriptionTier } from '@/components/admin/UserList';

export const dynamic = 'force-dynamic';

type User = {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  profiles: {
    subscription_status: SubscriptionStatus | null;
    subscription_tier: SubscriptionTier | null;
  } | null;
};

export default async function AdminUsersPage() {
  try {
    // This will throw if user is not an admin
    await verifyUser('admin');

    const supabase = await getServerClient();

    // First get the admin metadata to verify roles
    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      throw new Error(`Failed to fetch users: ${authError.message}`);
    }

    // Then get profile data for each user
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*');

    if (profileError) {
      throw new Error(`Failed to fetch profiles: ${profileError.message}`);
    }

    // Combine and validate the data
    // Filter out users without emails and combine with profile data
    const validUsers = authUsers.filter((user): user is typeof user & { email: string } => 
      Boolean(user.email)
    );

    const combinedUsers: User[] = validUsers
      .filter((user): user is typeof user & { email: string } => 
        typeof user.email === 'string'
      )      .map(user => {
        const userProfile = profiles?.find(p => p.id === user.id);
        return {
          id: user.id,
          email: user.email,
          role: (user.role || 'user') as UserRole,
          created_at: user.created_at,
          profiles: userProfile ? {
            subscription_status: userProfile.subscription_status as SubscriptionStatus || null,
            subscription_tier: userProfile.subscription_tier as SubscriptionTier || null
          } : null
        };
      });

    return (
      <AdminLayout>
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">User Management</h1>
          <UserList users={combinedUsers} />
        </div>
      </AdminLayout>
    );
  } catch (error) {
    console.error('Admin page error:', error);
    return redirect('/auth/login');
  }
}