"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { User } from "@supabase/supabase-js"
import { getBrowserClient } from "../lib/supabase/browser"
import { 
  Profile, 
  StripeSubscriptionWithMetadata,
  TypedSupabaseClient,
  AuthContextType 
} from "../lib/types/supabase-helpers"
import { useRouter } from "next/navigation"
import { useToast } from "./use-toast"

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  subscription: null,
  isSubscribed: false,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  loading: true,
  error: null
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState<TypedSupabaseClient>(getBrowserClient)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [subscription, setSubscription] = useState<StripeSubscriptionWithMetadata | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const fetchUserData = useCallback(async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      const profile = profileData as Profile;
      setProfile(profile);

      if (profile.stripe_subscription_id) {
        const response = await fetch('/api/subscription/details', {
          headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error('Failed to fetch subscription details');

        const subscriptionData = await response.json();
        setSubscription(subscriptionData);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch user data'));
    }
  }, [supabase]);

  const signInWithGoogle = useCallback(async (returnTo?: string) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback${returnTo ? `?return_to=${encodeURIComponent(returnTo)}` : ''}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to sign in with Google'));
      throw err;
    }
  }, [supabase]);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
      setSubscription(null);
      router.push('/auth/login');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to sign out'));
      toast({
        title: "Error signing out",
        description: "Please try again",
        variant: "destructive"
      });
    }
  }, [supabase, router, toast]);

  useEffect(() => {
    const {
      data: { subscription: authSubscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserData(session.user.id);
      } else {
        setProfile(null);
        setSubscription(null);
      }
      setLoading(false);
    });

    return () => {
      authSubscription.unsubscribe();
    };
  }, [supabase, fetchUserData]);

  const isSubscribed = subscription?.status === 'active' || subscription?.status === 'trialing';

  // Only show loading spinner during initial load
  if (loading && !user && !profile) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      subscription,
      isSubscribed,
      signInWithGoogle,
      signOut,
      loading,
      error
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
