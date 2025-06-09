/*
🔧 REQUIRED ENVIRONMENT VARIABLES FOR YOUR PROJECT:

1. Supabase Configuration (for app functionality):
   NEXT_PUBLIC_SUPABASE_URL=https://vzhvpecwnjssurxbyzph.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

2. Database URL (auto-set by Vercel when you connect Supabase):
   DATABASE_URL=postgresql://postgres:[password]@db.vzhvpecwnjssurxbyzph.supabase.co:5432/postgres

3. Other API Keys (server-side only):
   GOOGLE_MAPS_API_KEY=your_google_maps_key
   MAPBOX_ACCESS_TOKEN=your_mapbox_token
   GROQ_API_KEY=your_groq_key

🚫 WHAT YOU DON'T NEED TO SET MANUALLY:
- Direct PostgreSQL connection strings
- Database passwords in environment variables
- Manual connection pooling configuration

✅ HOW IT WORKS:
1. Supabase client handles all database connections
2. Vercel automatically sets DATABASE_URL when you connect Supabase
3. Row Level Security (RLS) handles authentication
4. No manual password management needed
*/
