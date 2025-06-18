import { supabase } from './supabase'

export async function checkSupabaseHealth(): Promise<boolean> {
  try {
    // Simple ping to check if Supabase is accessible
    const { data, error } = await supabase.from('_pgrst_reserved_namespace').select('1').limit(1).single()
    
    // Any response (even empty) means the connection is working
    return !error
  } catch (error) {
    console.error('Supabase health check error:', error)
    return false
  }
}