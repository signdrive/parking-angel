import { supabase, isSupabaseConfigured } from "./supabase"
import type { User } from "@supabase/supabase-js"

export async function signInWithEmail(email: string, password: string) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: "Supabase not configured. Please add environment variables." } }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signUpWithEmail(email: string, password: string, fullName: string) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: "Supabase not configured. Please add environment variables." } }
  }

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
    await createOrUpdateProfile(data.user)
  }

  return { data, error }
}

export async function signInWithGoogle() {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: "Supabase not configured. Please add environment variables." } }
  }

  // Use the custom domain for redirects
  const redirectTo =
    process.env.NODE_ENV === "production"
      ? "https://parkalgo.com/auth/callback"
      : `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  })
  return { data, error }
}

export async function signOut() {
  if (!isSupabaseConfigured()) {
    return { error: null }
  }

  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser(): Promise<User | null> {
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
}

export async function getUserProfile(userId: string) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: "Supabase not configured" } }
  }

  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()
  return { data, error }
}

// Create or update user profile after OAuth login
export async function createOrUpdateProfile(user: User) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: "Supabase not configured" } }
  }

  try {
    // First check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 is "no rows returned" error
      console.error("Error checking for existing profile:", checkError)
      throw checkError
    }

    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from("profiles")
        .update({
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name,
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name,
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          reputation_score: 100,
          total_reports: 0,
        })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    }
  } catch (error) {
    console.error("Error in createOrUpdateProfile:", error)
    return {
      data: null,
      error: error instanceof Error ? { message: error.message } : { message: "Unknown error" },
    }
  }
}
