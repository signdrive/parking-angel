"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { User, SupabaseClient } from "@supabase/supabase-js"
import { getBrowserClient } from "@/lib/supabase/browser"
import { Database } from "@/lib/types/supabase"

// Define a more detailed user type that includes subscription data
type Subscription = Database['public']['Tables']['user_subscriptions']['Row'];
// We will alias plan_id to plan for easier use in the app
export type AuthUser = User & Omit<Subscription, 'id' | 'user_id'> & { plan: string };

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signOut: () => Promise<void>
  error: string | null
  initialized: boolean
  forceRefresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  error: null,
  initialized: false,
  forceRefresh: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  const fetchUserSubscription = useCallback(async (supabaseClient: SupabaseClient<Database>, user: User | null): Promise<AuthUser | null> => {
    if (!user) return null;
    
    try {
      // Fetch user profile data which includes subscription_tier
      const { data: profile, error } = await supabaseClient
        .from('profiles')
        .select('subscription_tier, subscription_status, stripe_customer_id, stripe_subscription_id')
        .eq('id', user.id)
        .single();

      if (error || !profile) {
        // Return basic user with free plan if no profile exists
        return { ...user, plan: 'free', status: 'inactive' } as AuthUser; 
      }
      
      // Map subscription_tier to plan for backward compatibility
      const planMapping: Record<string, string> = {
        'free': 'free',
        'premium': 'navigator', 
        'pro': 'pro_parker',
        'enterprise': 'fleet_manager'
      };
      
      const authUser: AuthUser = {
        ...user,
        plan: planMapping[profile.subscription_tier || 'free'] || 'free',
        status: profile.subscription_status || 'inactive',
        plan_id: planMapping[profile.subscription_tier || 'free'] || 'free',
        trial_end: null,
        cancel_at_period_end: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return authUser;

    } catch (e) {
      // Default to free plan on error
      return { ...user, plan: 'free', status: 'inactive' } as AuthUser;
    }
  }, []);

  const forceRefresh = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
    if (sessionError) {
      setError("Failed to refresh session.");
      setUser(null);
    } else if (session) {
      const refreshedUser = await fetchUserSubscription(supabase, session.user);
      setUser(refreshedUser);
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [supabase, fetchUserSubscription]);

  useEffect(() => {
    if (typeof window === 'undefined') return

    const client = getBrowserClient()
    setSupabase(client)

    const updateUserAndSubscription = async (session: any) => {
      setLoading(true);
      if (session?.user) {
        const fullUser = await fetchUserSubscription(client, session.user);
        setUser(fullUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    // Initial session fetch
    client.auth.getSession().then(({ data: { session } }) => {
      updateUserAndSubscription(session).finally(() => {
        setInitialized(true);
      });
    }).catch((e) => {

      setError("Failed to initialize auth")
      setLoading(false)
      setInitialized(true)
    })

    // Subscribe to auth changes
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      // On SIGNED_IN or TOKEN_REFRESHED, update the user profile
      if (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED' || _event === 'USER_UPDATED') {
        updateUserAndSubscription(session);
      } else if (_event === 'SIGNED_OUT') {
        setUser(null);
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchUserSubscription])

  const signOut = async () => {
    if (!supabase) return
    setLoading(true)
    try {
      await supabase.auth.signOut()
      setUser(null); // Clear user on sign out
    } catch (e) {

      setError('Failed to sign out')
    }
    setLoading(false)
  }

  // Show loading state only during initial load
  if (!initialized && loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Initializing authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signOut,
        error,
        initialized,
        forceRefresh
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
