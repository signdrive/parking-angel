import { supabase, isSupabaseConfigured } from "./supabase"
import type { User } from "@supabase/supabase-js"

// Production-safe authentication functions
export async function signInWithEmail(email: string, password: string) {
  try {
    if (!isSupabaseConfigured()) {
      throw new Error("Authentication service is temporarily unavailable. Please try again later.")
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Handle specific Supabase errors
      if (error.message.includes("Invalid login credentials")) {
        throw new Error("Invalid email or password. Please check your credentials.")
      }
      if (error.message.includes("Email not confirmed")) {
        throw new Error("Please check your email and click the confirmation link.")
      }
      throw new Error(error.message)
    }

    if (data.user) {
      await createOrUpdateProfile(data.user)
    }

    return { data, error: null }
  } catch (error: any) {
    console.error("Production auth error:", error)
    return {
      data: null,
      error: {
        message: error.message || "Authentication failed. Please try again.",
      },
    }
  }
}

export async function signInWithGoogle() {
  try {
    if (!isSupabaseConfigured()) {
      throw new Error("Google sign-in is temporarily unavailable. Please try email login.")
    }

    // Use production URL
    const redirectTo = "https://www.parkalgo.com/auth/callback"

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

    if (error) {
      throw new Error(error.message)
    }

    return { data, error: null }
  } catch (error: any) {
    console.error("Google auth error:", error)
    return {
      data: null,
      error: {
        message: error.message || "Google sign-in failed. Please try email login.",
      },
    }
  }
}

export async function signUpWithEmail(email: string, password: string, fullName: string) {
  try {
    if (!isSupabaseConfigured()) {
      throw new Error("Registration is temporarily unavailable. Please try again later.")
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: "https://www.parkalgo.com/auth/callback",
      },
    })

    if (error) {
      if (error.message.includes("already registered")) {
        throw new Error("An account with this email already exists. Please sign in instead.")
      }
      throw new Error(error.message)
    }

    if (data.user && !error) {
      await createOrUpdateProfile(data.user)
    }

    return { data, error: null }
  } catch (error: any) {
    console.error("Signup error:", error)
    return {
      data: null,
      error: {
        message: error.message || "Registration failed. Please try again.",
      },
    }
  }
}

export async function signOut() {
  try {
    if (!isSupabaseConfigured()) {
      // Even if Supabase is not configured, clear local session
      if (typeof window !== "undefined") {
        window.location.href = "/"
      }
      return { error: null }
    }

    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (error: any) {
    console.error("Sign out error:", error)
    return { error: null } // Don't block sign out
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    if (!isSupabaseConfigured()) {
      return null
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("Error getting current user:", error)
      return null
    }

    return user
  } catch (error) {
    console.error("Auth error:", error)
    return null
  }
}

async function createOrUpdateProfile(user: User) {
  try {
    if (!isSupabaseConfigured()) {
      return { data: null, error: { message: "Profile service unavailable" } }
    }

    // Check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking profile:", checkError)
      return { data: null, error: checkError }
    }

    const profileData = {
      email: user.email,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || "",
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || "",
      updated_at: new Date().toISOString(),
    }

    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase.from("profiles").update(profileData).eq("id", user.id).select().single()

      return { data, error }
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          ...profileData,
          reputation_score: 100,
          total_reports: 0,
        })
        .select()
        .single()

      return { data, error }
    }
  } catch (error) {
    console.error("Profile creation error:", error)
    return { data: null, error: { message: "Profile creation failed" } }
  }
}
