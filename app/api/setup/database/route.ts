import { NextResponse } from "next/server"
import { supabaseEnhanced } from "@/lib/supabase-enhanced"

export async function POST() {
  try {
    console.log("🔧 Starting database setup...")

    // Test connection first
    const { data: testData, error: testError } = await supabaseEnhanced.from("profiles").select("count").limit(1)

    if (testError) {
      console.error("❌ Database connection test failed:", testError)
      return NextResponse.json(
        {
          error: "Database connection failed",
          details: testError.message,
        },
        { status: 500 },
      )
    }

    console.log("✅ Database connection successful")

    // Create tables using raw SQL
    const createTablesSQL = `
      -- Create profiles table
      CREATE TABLE IF NOT EXISTS profiles (
          id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          full_name TEXT,
          avatar_url TEXT,
          reputation_score INTEGER DEFAULT 100,
          total_reports INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create parking_spots table
      CREATE TABLE IF NOT EXISTS parking_spots (
          id TEXT PRIMARY KEY,
          latitude DOUBLE PRECISION NOT NULL,
          longitude DOUBLE PRECISION NOT NULL,
          spot_type TEXT NOT NULL DEFAULT 'street',
          address TEXT,
          is_available BOOLEAN DEFAULT true,
          provider TEXT DEFAULT 'user_reported',
          confidence_score DOUBLE PRECISION DEFAULT 0.5,
          last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create parking_sessions table
      CREATE TABLE IF NOT EXISTS parking_sessions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
          spot_id TEXT REFERENCES parking_spots(id),
          start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          end_time TIMESTAMP WITH TIME ZONE,
          status TEXT DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create spot_reports table
      CREATE TABLE IF NOT EXISTS spot_reports (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
          spot_id TEXT REFERENCES parking_spots(id),
          report_type TEXT NOT NULL,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Enable Row Level Security
      ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE parking_spots ENABLE ROW LEVEL SECURITY;
      ALTER TABLE parking_sessions ENABLE ROW LEVEL SECURITY;
      ALTER TABLE spot_reports ENABLE ROW LEVEL SECURITY;

      -- Create RLS policies for profiles
      CREATE POLICY IF NOT EXISTS "Users can view own profile" ON profiles
          FOR SELECT USING (auth.uid() = id);

      CREATE POLICY IF NOT EXISTS "Users can update own profile" ON profiles
          FOR UPDATE USING (auth.uid() = id);

      CREATE POLICY IF NOT EXISTS "Users can insert own profile" ON profiles
          FOR INSERT WITH CHECK (auth.uid() = id);

      -- Create RLS policies for parking_spots (public read access)
      CREATE POLICY IF NOT EXISTS "Anyone can view parking spots" ON parking_spots
          FOR SELECT USING (true);

      CREATE POLICY IF NOT EXISTS "Authenticated users can insert parking spots" ON parking_spots
          FOR INSERT WITH CHECK (auth.role() = 'authenticated');

      CREATE POLICY IF NOT EXISTS "Users can update parking spots" ON parking_spots
          FOR UPDATE USING (auth.role() = 'authenticated');

      -- Create RLS policies for parking_sessions
      CREATE POLICY IF NOT EXISTS "Users can view own sessions" ON parking_sessions
          FOR SELECT USING (auth.uid() = user_id);

      CREATE POLICY IF NOT EXISTS "Users can insert own sessions" ON parking_sessions
          FOR INSERT WITH CHECK (auth.uid() = user_id);

      CREATE POLICY IF NOT EXISTS "Users can update own sessions" ON parking_sessions
          FOR UPDATE USING (auth.uid() = user_id);

      -- Create RLS policies for spot_reports
      CREATE POLICY IF NOT EXISTS "Users can view own reports" ON spot_reports
          FOR SELECT USING (auth.uid() = user_id);

      CREATE POLICY IF NOT EXISTS "Users can insert own reports" ON spot_reports
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    `

    // Execute the SQL using rpc call
    const { data, error } = await supabaseEnhanced.rpc("exec_sql", {
      sql_query: createTablesSQL,
    })

    if (error) {
      console.error("❌ SQL execution failed:", error)
      return NextResponse.json(
        {
          error: "Failed to create tables",
          details: error.message,
          suggestion: "Please run the SQL commands manually in Supabase SQL editor",
        },
        { status: 500 },
      )
    }

    console.log("✅ Database setup completed successfully")

    return NextResponse.json({
      success: true,
      message: "Database tables created successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Database setup error:", error)
    return NextResponse.json(
      {
        error: "Database setup failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
