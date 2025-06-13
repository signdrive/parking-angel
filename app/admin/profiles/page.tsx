import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function AdminProfilesPage() {
  const { data: profiles, error } = await supabase.from('profiles').select('id, email, plan, total_paid, created_at');

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Profiles Table Test</h1>
      {error && <div className="text-red-500">Failed to load profiles: {error.message}</div>}
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Plan</th>
            <th className="border px-4 py-2">Total Paid ($)</th>
            <th className="border px-4 py-2">Join Date</th>
          </tr>
        </thead>
        <tbody>
          {profiles && profiles.length > 0 ? (
            profiles.map((user: any) => (
              <tr key={user.id}>
                <td className="border px-4 py-2">{user.email}</td>
                <td className="border px-4 py-2">{user.plan || 'Free'}</td>
                <td className="border px-4 py-2">{user.total_paid || 0}</td>
                <td className="border px-4 py-2">{user.created_at ? user.created_at.split('T')[0] : ''}</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={4} className="text-center py-4">No profiles found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
