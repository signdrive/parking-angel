import { supabase, ProfileService, withRetry } from "./supabase-bulletproof"
import type { User } from "@supabase/supabase-js"

export class AuthService {
  static async signInWithEmail(email: string, password: string) {
    return withRetry(async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (data.user && !error) {
        // Ensure profile exists after login
        await ProfileService.atomicProfileCreation(data.user)
      }

      return { data, error }
    })
  }

  static async signUpWithEmail(email: string, password: string, fullName: string) {
    return withRetry(async () => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (data.user && !error) {
        await ProfileService.atomicProfileCreation(data.user)
      }

      return { data, error }
    })
  }

  static async signInWithGoogle() {
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : process.env.NEXT_PUBLIC_SITE_URL + "/auth/callback"

    return withRetry(async () => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })
      return { data, error }
    })
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        console.error("Error getting current user:", error)
        return null
      }

      // Ensure profile exists for authenticated user
      if (user) {
        await ProfileService.atomicProfileCreation(user)
      }

      return user
    } catch (error) {
      console.error("Auth error:", error)
      return null
    }
  }

  static async signOut() {
    return withRetry(async () => {
      const { error } = await supabase.auth.signOut()
      return { error }
    })
  }
}
