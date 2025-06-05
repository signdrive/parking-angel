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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  const refreshUser = async () => {
    if (!isSupabaseConfigured()) {
      setUser(null)
      setLoading(false)
      setError("Supabase not configured")
      setInitialized(true)
      return
    }

    try {
      setError(null) // Clear any previous errors

      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error("Error getting session:", error)
        setError(error.message)
        setUser(null)
      } else {
        setUser(data.session?.user ?? null)
        setError(null)

        // If user exists, ensure profile exists (but don't block on this)
        if (data.session?.user) {
          createOrUpdateProfile(data.session.user).catch((profileError) => {
            console.error("Error updating profile:", profileError)
            // Don't block authentication for profile errors
          })
        }
      }
    } catch (err) {
      console.error("Unexpected auth error:", err)
      setError(err instanceof Error ? err.message : "Unknown authentication error")
      setUser(null)
    } finally {
      setLoading(false)
      setInitialized(true)
    }
  }

  useEffect(() => {
    // Initial session check
    refreshUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id)

      setUser(session?.user ?? null)
      setLoading(false) // Always stop loading on auth state change
      setInitialized(true)

      // Handle profile creation for sign-in events
      if (event === "SIGNED_IN" && session?.user) {
        createOrUpdateProfile(session.user).catch((err) => {
          console.error("Error updating profile on sign in:", err)
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.signOut()
        if (error) {
          console.error("Sign out error:", error)
          setError(error.message)
        } else {
          setUser(null)
          setError(null)
        }
      }
    } catch (err) {
      console.error("Unexpected sign out error:", err)
      setError(err instanceof Error ? err.message : "Unknown sign out error")
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading: loading && !initialized, signOut, refreshUser, error }}>
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
