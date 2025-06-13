"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, Check, ExternalLink, Database, Zap } from "lucide-react"

export function RealtimeSetupGuide() {
  const [copied, setCopied] = useState<string | null>(null)

  const sqlCommands = `-- Enable real-time subscriptions for Supabase
-- Run this in the Supabase SQL Editor

-- Enable real-time for parking_spots table
ALTER PUBLICATION supabase_realtime ADD TABLE public.parking_spots;

-- Enable real-time for spot_reports table  
ALTER PUBLICATION supabase_realtime ADD TABLE public.spot_reports;

-- Enable real-time for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Enable real-time for user_activities table
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_activities;

-- Enable real-time for ai_predictions table
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_predictions;

-- Test the cleanup function
SELECT cleanup_expired_spots() as deleted_spots_count;

-- Test the nearby spots function
SELECT * FROM find_nearby_spots(37.7749, -122.4194, 1000) LIMIT 5;

-- Verify real-time is enabled
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- Show success message
SELECT 'Real-time setup completed successfully!' as status;`

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-600" />
          Real-time Setup Guide
          <Badge className="bg-yellow-100 text-yellow-800">SQL Required</Badge>
        </CardTitle>
        <CardDescription>Enable real-time subscriptions for live parking updates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Database className="w-4 h-4" />
          <AlertDescription>
            This script needs to be run in the <strong>Supabase SQL Editor</strong>, not as a Node.js script.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Step 1: Open Supabase SQL Editor</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Go to your Supabase Dashboard</li>
              <li>Navigate to "SQL Editor" in the sidebar</li>
              <li>Click "New Query"</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Step 2: Copy and Run SQL Commands</h4>
            <div className="relative">
              <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto border max-h-64 overflow-y-auto">
                {sqlCommands}
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(sqlCommands, "sql")}
              >
                {copied === "sql" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Step 3: Verify Setup</h4>
            <p className="text-sm text-gray-600 mb-2">After running the SQL, you should see:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Real-time enabled for 5 tables</li>
              <li>Test functions working correctly</li>
              <li>Success message displayed</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                Open Supabase Dashboard <ExternalLink className="w-3 h-3" />
              </a>
            </Button>
          </div>
        </div>

        <Alert>
          <AlertDescription>
            <strong>Why SQL Editor?</strong> Real-time subscriptions require database-level permissions that can only be
            configured through SQL commands, not through the Node.js client.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
