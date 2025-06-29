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
  isCachedAuthBeingUsed: boolean
}

type AuthContextType = AuthState & {
  signOut: () => Promise<void>
  signInWithGoogle: (returnTo?: string) => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Cache keys
const USER_CACHE_KEY = 'parking_angel_cached_user';
const SESSION_CACHE_KEY = 'parking_angel_cached_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    error: null,
    isCachedAuthBeingUsed: false
  })
  const [supabase, setSupabase] = useState<any>(null)
  const router = useRouter()
  
  // Try to load cached user data immediately to speed up auth-dependent operations
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const cachedUserData = localStorage.getItem(USER_CACHE_KEY);
        const cachedSessionData = localStorage.getItem(SESSION_CACHE_KEY);
        
        if (cachedUserData && cachedSessionData) {
          const cachedUser = JSON.parse(cachedUserData);
          const cachedSession = JSON.parse(cachedSessionData);
          const cacheTime = cachedUser._cacheTime || 0;
          
          // Only use cache if it's less than 1 hour old
          const isCacheFresh = Date.now() - cacheTime < 60 * 60 * 1000;
          
          if (isCacheFresh) {
            console.log('Using cached auth data while verifying session');
            setState(current => ({
              ...current,
              user: cachedUser,
              session: cachedSession,
              isLoading: false,
              isCachedAuthBeingUsed: true
            }));
          }
        }
      } catch (e) {
        console.error('Error loading cached auth data:', e);
        // Clear potentially corrupted cache
        localStorage.removeItem(USER_CACHE_KEY);
        localStorage.removeItem(SESSION_CACHE_KEY);
      }
    }
  }, [])

  useEffect(() => {
    let mounted = true
    const authStartTime = performance.now();

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
        
        const user = session?.user ?? null;
        
        // Cache authenticated user data for faster load times
        if (user && typeof window !== 'undefined') {
          // Add a timestamp to track cache freshness
          const userToCache = { ...user, _cacheTime: Date.now() };
          try {
            localStorage.setItem(USER_CACHE_KEY, JSON.stringify(userToCache));
            localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(session));
          } catch (e) {
            console.error('Error caching user data:', e);
          }
        }
        
        setState(current => ({
          ...current,
          session,
          user,
          isLoading: false,
          isCachedAuthBeingUsed: false
        }))
        
        console.log(`Auth initialization completed in ${performance.now() - authStartTime}ms`);

        // Listen for auth changes
        const { data: { subscription } } = client.auth.onAuthStateChange(
          async (_event, session) => {
            if (!mounted) return
            
            const user = session?.user ?? null;
            
            // Update cache when auth state changes
            if (user && typeof window !== 'undefined') {
              const userToCache = { ...user, _cacheTime: Date.now() };
              try {
                localStorage.setItem(USER_CACHE_KEY, JSON.stringify(userToCache));
                localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(session));
              } catch (e) {
                console.error('Error updating cached user data:', e);
              }
            }
            
            setState(current => ({
              ...current,
              session,
              user,
              isLoading: false,
              isCachedAuthBeingUsed: false
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
          isLoading: false,
          isCachedAuthBeingUsed: false
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
        error: null,
        isCachedAuthBeingUsed: false
      }))
      
      // Clear auth cache and any localStorage keys set by Supabase
      if (typeof window !== 'undefined') {
        localStorage.removeItem(USER_CACHE_KEY);
        localStorage.removeItem(SESSION_CACHE_KEY);
        
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
      
      // Store returnTo in localStorage to persist through OAuth redirects
      localStorage.setItem('auth_return_to', returnTo);
      
      console.log('Google OAuth - return_to:', returnTo);
      
      // Performance optimization: begin pre-auth setup while OAuth flow is happening
      if (returnTo.includes('/checkout-redirect')) {
        const plan = new URLSearchParams(returnTo.split('?')[1]).get('plan');
        if (plan) {
          console.log('Caching checkout intent for plan:', plan);
          localStorage.setItem('checkout_intent', JSON.stringify({ 
            plan,
            timestamp: Date.now()
          }));
          
          // Prefetch the checkout redirect page to improve performance
          const prefetchLink = document.createElement('link');
          prefetchLink.rel = 'prefetch';
          prefetchLink.href = `/checkout-redirect?plan=${plan}`;
          document.head.appendChild(prefetchLink);
        }
      }
      
      // Using Promise to make the flow faster
      const signInPromise = supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?return_to=${encodeURIComponent(returnTo)}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });
      
      // Don't wait for the promise to resolve - let the browser handle the redirect
      signInPromise.catch((error: any) => {
        console.error('Error initiating Google sign in:', error);
        toast({
          title: 'Error signing in',
          description: 'Please try again',
          variant: 'destructive',
        });
      });
      
      // We don't actually need to await this since the redirect will happen automatically
      // This makes the flow faster by returning immediately
      return;
    } catch (error) {
      console.error('Sign in with Google error:', error);
      toast({
        title: 'Error signing in',
        description: 'Please try again',
        variant: 'destructive',
      });
      throw error;
    }
  }, [supabase, toast])

  // Handle auth state changes
  useEffect(() => {
    if (!supabase) return

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session: Session | null) => {
      if (event === 'SIGNED_IN') {
        const user = session?.user ?? null;
        
        // Cache user data for faster loading
        if (user && typeof window !== 'undefined') {
          const userToCache = { ...user, _cacheTime: Date.now() };
          try {
            localStorage.setItem(USER_CACHE_KEY, JSON.stringify(userToCache));
            localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(session));
          } catch (e) {
            console.error('Error caching user data on sign in:', e);
          }
        }
        
        setState(current => ({
          ...current,
          user,
          session,
          isLoading: false,
          isCachedAuthBeingUsed: false
        }))
        
        // Check for persisted return_to parameter from localStorage
        let returnTo = null;
        try {
          const searchParams = new URLSearchParams(window.location.search);
          returnTo = searchParams.get('return_to') || localStorage.getItem('auth_return_to');
          
          // Clear the stored return_to
          localStorage.removeItem('auth_return_to');
        } catch (e) {
          console.error('Error retrieving stored return_to:', e);
        }
        
        if (returnTo) {
          console.log('Auth flow completed, redirecting to:', returnTo);
          router.push(returnTo);
        } else {
          router.push('/dashboard');
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
      
      const user = session?.user ?? null;
      
      // Update cache with refreshed session data
      if (user && typeof window !== 'undefined') {
        const userToCache = { ...user, _cacheTime: Date.now() };
        try {
          localStorage.setItem(USER_CACHE_KEY, JSON.stringify(userToCache));
          localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(session));
        } catch (e) {
          console.error('Error updating cached user data on refresh:', e);
        }
      }
      
      setState(current => ({
        ...current,
        session,
        user,
        error: null,
        isCachedAuthBeingUsed: false
      }))
    } catch (error) {
      console.error('Session refresh error:', error)
      toast({
        variant: 'destructive',
        title: 'Session Error',
        description: (error as Error).message
      })
    }
  }, [supabase, toast])

  const value = {
    ...state,
    signOut,
    signInWithGoogle,
    refreshSession
  }

  // Only render children when not in initial loading state
  if (state.isLoading && !state.isCachedAuthBeingUsed) {
    return null // or a loading spinner
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
