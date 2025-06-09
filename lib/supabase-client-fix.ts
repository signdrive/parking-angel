import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a custom fetch function that fixes the headers
const customFetch = (url: RequestInfo | URL, options: RequestInit = {}) => {
  const headers = new Headers(options.headers)

  // Fix the Accept header for Supabase requests
  if (typeof url === "string" && url.includes("supabase.co")) {
    headers.set("Accept", "application/json")
    headers.delete("Accept-Profile")
    headers.delete("Content-Profile")
  }

  return fetch(url, {
    ...options,
    headers,
  })
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: customFetch,
  },
})
