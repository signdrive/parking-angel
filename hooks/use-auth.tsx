"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User, SupabaseClient } from "@supabase/supabase-js"
import { getBrowserClient } from "@/lib/supabase/browser"
import { Database } from "@/lib/types/supabase"

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  error: string | null
  initialized: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  error: null,
  initialized: false
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  // Initialize Supabase client only in the browser
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const client = getBrowserClient()
      setSupabase(client)
      
      // Immediate session check
      client.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        setLoading(false)
        setInitialized(true)
      }).catch((e) => {
        console.error('Failed to get auth session:', e)
        setError("Failed to initialize auth")
        setLoading(false)
        setInitialized(true)
      })

      // Subscribe to auth changes
      const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })

      return () => subscription.unsubscribe()
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e)
      setError('Failed to initialize auth')
      setLoading(false)
      setInitialized(true)
      return
    }
  }, [])

  const signOut = async () => {
    if (!supabase) return
    setLoading(true)
    try {
      await supabase.auth.signOut()
    } catch (e) {
      console.error('Error signing out:', e)
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
        initialized
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
