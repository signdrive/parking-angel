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
import { signInWithGoogle as googleSignIn } from "../lib/auth"

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
  const [isSubscribed, setIsSubscribed] = useState(false)
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

  const signInWithGoogle = useCallback(async (redirectTo = '/dashboard') => {
    try {
      const result = await googleSignIn(redirectTo)
      if (result.error) {
        throw result.error
      }
    } catch (error) {
      setError(error as Error)
      throw error
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      setError(error as Error)
      throw error
    }
  }, [supabase.auth, router])

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

  // Provide the full context value
  const value: AuthContextType = {
    user,
    profile,
    subscription,
    isSubscribed,
    signInWithGoogle,
    signOut,
    loading,
    error
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
