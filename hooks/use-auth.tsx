"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { createOrUpdateProfile } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  error: string | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
  error: null,
})

// Helper function to add timeout to promises
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs),
    ),
  ])
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshUser = async () => {
    console.log("Supabase: Starting refreshUser")

    if (!isSupabaseConfigured()) {
      console.log("Supabase: Not configured, setting loading to false")
      setUser(null)
      setLoading(false)
      setError("Supabase not configured")
      return
    }

    try {
      setError(null)
      console.log("Supabase: Getting session with timeout...")

      // Add a 3-second timeout to the session call
      const { data, error } = await withTimeout(supabase.auth.getSession(), 3000)

      console.log("Supabase: Session result:", { user: !!data.session?.user, error: !!error })

      if (error) {
        console.error("Supabase: Session error:", error)
        setError(error.message)
        setUser(null)
      } else {
        setUser(data.session?.user ?? null)
        setError(null)

        // If user exists, ensure profile exists (but don't block on this)
        if (data.session?.user) {
          console.log("Supabase: User found, updating profile...")
          createOrUpdateProfile(data.session.user).catch((profileError) => {
            console.error("Supabase: Profile error:", profileError)
          })
        }
      }
    } catch (err) {
      console.error("Supabase: Auth error (possibly timeout):", err)

      // If it's a timeout, don't treat it as a fatal error
      if (err instanceof Error && err.message.includes("timed out")) {
        console.log("Supabase: Session call timed out, assuming no user")
        setUser(null)
        setError("Session check timed out")
      } else {
        setError(err instanceof Error ? err.message : "Unknown authentication error")
        setUser(null)
      }
    } finally {
      console.log("Supabase: Setting loading to false")
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log("Supabase: Auth hook initializing...")

    // Set a backup timeout to ensure loading doesn't stay true forever
    const loadingTimeout = setTimeout(() => {
      console.log("Supabase: Backup loading timeout reached, forcing loading to false")
      setLoading(false)
    }, 6000) // Slightly longer than the session timeout

    // Initial session check
    refreshUser().finally(() => {
      clearTimeout(loadingTimeout)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Supabase: Auth state changed:", event, !!session?.user)
      clearTimeout(loadingTimeout)

      setUser(session?.user ?? null)
      setLoading(false)

      // Handle profile creation for sign-in events
      if (event === "SIGNED_IN" && session?.user) {
        createOrUpdateProfile(session.user).catch((err) => {
          console.error("Supabase: Profile update error on sign in:", err)
        })
      }
    })

    return () => {
      clearTimeout(loadingTimeout)
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.signOut()
        if (error) {
          console.error("Supabase: Sign out error:", error)
          setError(error.message)
        } else {
          setUser(null)
          setError(null)
        }
      }
    } catch (err) {
      console.error("Supabase: Unexpected sign out error:", err)
      setError(err instanceof Error ? err.message : "Unknown sign out error")
    }
  }

  return <AuthContext.Provider value={{ user, loading, signOut, refreshUser, error }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
