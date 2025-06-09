// ❌ DON'T USE: Direct PostgreSQL connection strings like:
// postgresql://postgres:[YOUR-PASSWORD]@db.vzhvpecwnjssurxbyzph.supabase.co:5432/postgres

// ✅ DO USE: Supabase client with these environment variables:

/*
Environment Variables You Need:
NEXT_PUBLIC_SUPABASE_URL=https://vzhvpecwnjssurxbyzph.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
DATABASE_URL=postgresql://postgres:[password]@db.vzhvpecwnjssurxbyzph.supabase.co:5432/postgres (auto-set by Vercel)
*/

// The Supabase client automatically handles connections:
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// This is all you need! No manual connection strings required.
