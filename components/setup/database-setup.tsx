"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, RefreshCw, AlertTriangle, Copy, Database } from "lucide-react"

export function DatabaseSetup() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const setupDatabase = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/setup/database", {
        method: "POST",
      })
      const data = await response.json()

      setResult({
        success: response.ok,
        status: response.status,
        data: data,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const manualSQL = `-- Create profiles table
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
    FOR INSERT WITH CHECK (auth.uid() = user_id);`

  const seedDataSQL = `-- Insert sample parking spots
INSERT INTO parking_spots (id, latitude, longitude, spot_type, address, is_available, provider, confidence_score) VALUES
('google_ChIJK_xdmtxQw0cR1DFNPXOHZLc', 51.5074, -0.1278, 'street', 'London, UK', true, 'google_places', 0.8),
('osm_way_123456789', 51.5085, -0.1257, 'parking_lot', 'Westminster, London', true, 'openstreetmap', 0.7),
('user_reported_001', 51.5095, -0.1267, 'street', 'Oxford Street, London', false, 'user_reported', 0.6),
('google_ChIJO6NbC4-AhYARuCvDeTdvPa8', 37.7749, -122.4194, 'street', 'San Francisco, CA', true, 'google_places', 0.9),
('osm_way_987654321', 37.7849, -122.4094, 'parking_garage', 'Downtown SF', true, 'openstreetmap', 0.8)
ON CONFLICT (id) DO NOTHING;`

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Database Setup
          </CardTitle>
          <CardDescription>Set up the required database tables for Parking Angel</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Database Setup Required</AlertTitle>
            <AlertDescription>
              Your database needs to be set up with the required tables before the application can function properly.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="automatic" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="automatic">Automatic Setup</TabsTrigger>
              <TabsTrigger value="manual">Manual Setup</TabsTrigger>
            </TabsList>

            <TabsContent value="automatic" className="space-y-4">
              <Button onClick={setupDatabase} disabled={loading} className="w-full">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Setting up database..." : "Setup Database Automatically"}
              </Button>

              {result && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <h3 className="text-lg font-medium">Setup Result</h3>
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.status || (result.success ? "Success" : "Error")}
                    </Badge>
                  </div>

                  {result.error && (
                    <Alert variant="destructive" className="mb-4">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>{result.error}</AlertDescription>
                    </Alert>
                  )}

                  {result.data && (
                    <div className="space-y-2">
                      <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-96">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mt-2">Completed at: {result.timestamp}</div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="manual" className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Manual Setup Instructions</AlertTitle>
                <AlertDescription>
                  If automatic setup fails, copy and paste the SQL commands below into your Supabase SQL editor.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium">1. Create Tables and Policies</h3>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(manualSQL)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy SQL
                    </Button>
                  </div>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-96 border">{manualSQL}</pre>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium">2. Insert Sample Data (Optional)</h3>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(seedDataSQL)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy SQL
                    </Button>
                  </div>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-32 border">{seedDataSQL}</pre>
                </div>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>How to run these commands:</AlertTitle>
                <AlertDescription>
                  <ol className="list-decimal list-inside space-y-1 mt-2">
                    <li>Go to your Supabase dashboard</li>
                    <li>Navigate to the SQL Editor</li>
                    <li>Copy and paste the SQL commands above</li>
                    <li>Click "Run" to execute the commands</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">After setting up the database:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Test the connection using the diagnostics tool</li>
              <li>Verify that all tables were created successfully</li>
              <li>Check that Row Level Security policies are working</li>
              <li>Test inserting and querying parking spots</li>
            </ul>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Make sure to enable Row Level Security (RLS) on all tables to ensure proper data access control. The SQL
              commands above include the necessary RLS policies.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
