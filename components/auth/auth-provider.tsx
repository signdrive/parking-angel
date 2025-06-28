'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User, Session, AuthError } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { signInWithGoogle as signInWithGoogleHandler } from '@/lib/auth'

type AuthState = {
  user: User | null
  session: Session | null
  isLoading: boolean
  error: AuthError | null
}

type AuthContextType = AuthState & {
  signOut: () => Promise<void>
  signInWithGoogle: (returnTo?: string) => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    error: null
  })
  const [supabase, setSupabase] = useState<any>(null)
  const router = useRouter()
  useEffect(() => {
    let mounted = true

    const initializeSupabase = async () => {
      try {
        // Dynamically import to avoid SSR issues
        const { getBrowserClient } = await import('@/lib/supabase/browser')
        if (!mounted) return
        
        const client = getBrowserClient()
        setSupabase(client)
        
        const { data: { session }, error } = await client.auth.getSession()
        if (!mounted) return

        if (error) throw error
        setState(current => ({
          ...current,
          session,
          user: session?.user ?? null,
          isLoading: false
        }))

        // Listen for auth changes
        const { data: { subscription } } = client.auth.onAuthStateChange(
          async (_event, session) => {
            if (!mounted) return
            setState(current => ({
              ...current,
              session,
              user: session?.user ?? null,
              isLoading: false
            }))
            router.refresh()
          }
        )

        return () => {
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (!mounted) return
        setState(current => ({
          ...current,
          error: error as AuthError,
          isLoading: false
        }))
      }
    }

    initializeSupabase();
    return () => {
      mounted = false;
    }
  }, [router])

  const signOut = useCallback(async () => {
    console.log('SignOut function called');
    if (!supabase) {
      console.log('No supabase client available');
      return;
    }
    try {
      console.log('Attempting to sign out...');
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      console.log('Sign out successful, updating state...');
      setState(current => ({
        ...current,
        user: null,
        session: null,
        error: null
      }))
      
      // Clear any localStorage keys that might be set by Supabase
      if (typeof window !== 'undefined') {
        const keysToRemove = Object.keys(localStorage).filter(key => 
          key.startsWith('supabase.auth.token') || 
          key.startsWith('sb-') ||
          key.includes('auth-token')
        );
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }
      
      console.log('Redirecting to login...');
      router.push('/auth/login')
      router.refresh()
    } catch (error) {
      console.error('Sign out error:', error)
      toast({
        variant: 'destructive',
        title: 'Sign Out Error',
        description: (error as Error).message
      })
    }
  }, [supabase, router, toast])

  const signInWithGoogle = useCallback(async (customReturnTo?: string) => {
    if (!supabase) return
    
    try {
      const searchParams = new URLSearchParams(window.location.search)
      const returnTo = customReturnTo || searchParams.get('return_to') || '/dashboard'
      
      console.log('Google OAuth - return_to:', returnTo);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?return_to=${encodeURIComponent(returnTo)}`,
          queryParams: {
            access_type: 'offline',
          },
        },
      })
      
      if (error) throw error
      
    } catch (error) {
      console.error('Sign in error:', error)
      toast({
        title: 'Error signing in',
        description: 'Please try again',
        variant: 'destructive',
      })
    }
  }, [supabase, toast])

  // Handle auth state changes
  useEffect(() => {
    if (!supabase) return

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session: Session | null) => {
      if (event === 'SIGNED_IN') {
        setState(current => ({
          ...current,
          user: session?.user ?? null,
          session,
          isLoading: false,
        }))
        
        // Check for return_to parameter and redirect
        const searchParams = new URLSearchParams(window.location.search)
        const returnTo = searchParams.get('return_to')
        if (returnTo) {
          router.push(returnTo)
        } else {
          router.push('/dashboard')
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const refreshSession = useCallback(async () => {
    if (!supabase) return
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      
      setState(current => ({
        ...current,
        session,
        user: session?.user ?? null,
        error: null
      }))
    } catch (error) {
      console.error('Session refresh error:', error)
      toast({
        variant: 'destructive',
        title: 'Session Error',
        description: (error as Error).message
      })
    }
  }, [supabase])

  const value = {
    ...state,
    signOut,
    signInWithGoogle,
    refreshSession
  }

  // Only render children when not in initial loading state
  if (state.isLoading) {
    return null // or a loading spinner
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook for protected routes
export function useRequireAuth() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, isLoading, router])

  return { user, isLoading }
}
