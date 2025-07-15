"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useSubscription } from "@/hooks/use-subscription";

export default function ForceRefreshPage() {
  const { user } = useAuth();
  const { refreshSubscription, planId, status } = useSubscription();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);

  const forceRefresh = async () => {
    if (!user) {
      alert('Please log in first');
      return;
    }

    setLoading(true);
    try {
      // Trigger subscription refresh
      refreshSubscription();
      
      // Also fetch profile data directly
      const { getBrowserClient } = await import('@/lib/supabase/browser');
      const supabase = getBrowserClient();
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfileData(profile);
      
      console.log('🔄 Current user profile:', profile);
      
    } catch (error) {
      console.error('Error:', error);
      alert('Error fetching profile: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      console.log('👤 Current logged-in user:', user.id, user.email);
    }
  }, [user]);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Force Refresh Profile</h1>
      
      {user ? (
        <div className="space-y-4">
          <p><strong>Logged in as:</strong> {user.email}</p>
          <p><strong>User ID:</strong> {user.id}</p>
          <p><strong>Current Plan (useSubscription):</strong> {planId || 'loading...'}</p>
          <p><strong>Current Status (useSubscription):</strong> {status || 'loading...'}</p>
          
          <button 
            onClick={forceRefresh} 
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh Subscription Data'}
          </button>
          
          <button 
            onClick={() => window.location.reload()} 
            className="bg-green-500 text-white px-4 py-2 rounded ml-2"
          >
            Full Page Reload
          </button>
          
          {profileData && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h3 className="font-bold">Current Profile Data:</h3>
              <pre className="text-sm mt-2">
                {JSON.stringify(profileData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      ) : (
        <p>Please log in to use this tool.</p>
      )}
    </div>
  );
}
