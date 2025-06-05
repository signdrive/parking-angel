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
    await supabase.from("profiles").insert({
      id: data.user.id,
      email: data.user.email,
      full_name: fullName,
    })
  }

  return { data, error }
}

export async function signInWithGoogle() {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: "Supabase not configured. Please add environment variables." } }
  }

  // Get the current origin (works for both localhost and Vercel)
  const origin = typeof window !== "undefined" ? window.location.origin : ""

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/`,
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
  } = await supabase.auth.getUser()
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

  const { data: existingProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

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

    return { data, error }
  } else {
    // Create new profile
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name,
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
      })
      .select()
      .single()

    return { data, error }
  }
}
