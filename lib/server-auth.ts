import 'server-only'
import { cache } from 'react'
import { getServerClient } from '@/lib/supabase/server-utils'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/supabase'

// Define and export the Profile type for use in other modules
export type Profile = Database['public']['Tables']['profiles']['Row']

// Gets the current user from the session.
export const getUser = cache(async () => {
  const supabase = await getServerClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
})

// Gets the user's profile, if it exists.
export const getUserProfile = cache(async () => {
  const user = await getUser()
  if (!user) {
    return null
  }

  const supabase = await getServerClient()

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      // It's common for a profile to not exist yet, so only log real errors
      if (error.code !== 'PGRST116') { 
        console.error('Error getting user profile:', error)
      }
      return null
    }

    return profile
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
})

// Verifies the user has a specific role.
export async function verifyUser(requiredRole?: 'admin' | 'moderator'): Promise<{ user: User; profile: Profile | null }> {
  const user = await getUser()
  if (!user) {
    throw new Error('Authentication Required: No user session found.')
  }

  const profile = await getUserProfile()

  if (requiredRole) {
    if (!profile || profile.role !== requiredRole) {
      throw new Error(`Authorization Failed: User does not have the required \'${requiredRole}\' role.`)
    }
  }

  return { user, profile }
}

// Checks if a user has an active subscription.
export const isUserSubscribed = cache(async (): Promise<boolean> => {
  const profile = await getUserProfile();
  if (!profile) {
    return false;
  }

  // Check for a specific subscription status, e.g., 'active' or 'trialing'
  const activeStatuses = ['active', 'trialing'];
  return !!profile.subscription_status && activeStatuses.includes(profile.subscription_status);
});
