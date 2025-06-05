"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "firebase/auth"

interface AuthContextType {
  user: User | null
  userProfile: any | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signOut: async () => {},
})

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("Firebase: Auth hook initializing...")

    // Set a timeout to ensure loading doesn't stay true forever
    const loadingTimeout = setTimeout(() => {
      console.log("Firebase: Loading timeout reached, forcing loading to false")
      setLoading(false)
    }, 3000) // Reduced to 3 seconds

    // Try to initialize Firebase auth
    const initializeFirebaseAuth = async () => {
      try {
        const { onAuthStateChangedFirebase, createOrUpdateUserProfile } = await import("@/lib/firebase-auth")

        const unsubscribe = onAuthStateChangedFirebase(async (user) => {
          console.log("Firebase: Auth state changed:", !!user)
          clearTimeout(loadingTimeout)

          setUser(user)

          if (user) {
            try {
              console.log("Firebase: User found, updating profile...")
              const profile = await createOrUpdateUserProfile(user)
              setUserProfile(profile)
            } catch (error) {
              console.error("Firebase: Error handling auth state change:", error)
            }
          } else {
            setUserProfile(null)
          }

          setLoading(false)
        })

        return unsubscribe
      } catch (error) {
        console.error("Firebase: Failed to initialize auth:", error)
        clearTimeout(loadingTimeout)
        setLoading(false)
        return () => {}
      }
    }

    let unsubscribe: (() => void) | undefined

    initializeFirebaseAuth().then((unsub) => {
      unsubscribe = unsub
    })

    return () => {
      clearTimeout(loadingTimeout)
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  const signOut = async () => {
    try {
      const { signOutFirebase } = await import("@/lib/firebase-auth")
      await signOutFirebase()
    } catch (error) {
      console.error("Firebase: Error signing out:", error)
    }
  }

  return <AuthContext.Provider value={{ user, userProfile, loading, signOut }}>{children}</AuthContext.Provider>
}

export const useFirebaseAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useFirebaseAuth must be used within a FirebaseAuthProvider")
  }
  return context
}
