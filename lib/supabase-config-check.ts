export function checkSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log("Supabase Config Check:")
  console.log("URL exists:", !!supabaseUrl)
  console.log("Anon Key exists:", !!supabaseAnonKey)
  console.log("URL value:", supabaseUrl)
  console.log("Key preview:", supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : "MISSING")

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase configuration. Please check your environment variables.")
  }

  return { supabaseUrl, supabaseAnonKey }
}
