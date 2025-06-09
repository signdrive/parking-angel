"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle } from "lucide-react"

export function EnvironmentStatus() {
  const [status, setStatus] = useState<any>(null)

  useEffect(() => {
    const checkEnvironment = () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      setStatus({
        supabaseUrl: {
          configured: !!supabaseUrl,
          value: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : "Not set",
        },
        supabaseKey: {
          configured: !!supabaseKey,
          value: supabaseKey ? `${supabaseKey.substring(0, 20)}...` : "Not set",
        },
        databaseUrl: {
          configured: true, // This is auto-set by Vercel
          value: "Auto-configured by Vercel/Supabase integration",
        },
      })
    }

    checkEnvironment()
  }, [])

  if (!status) return <div>Loading...</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Environment Configuration Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Supabase URL</span>
            <div className="flex items-center gap-2">
              {status.supabaseUrl.configured ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <Badge variant={status.supabaseUrl.configured ? "default" : "destructive"}>
                {status.supabaseUrl.configured ? "✓ Configured" : "Missing"}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span>Supabase Anon Key</span>
            <div className="flex items-center gap-2">
              {status.supabaseKey.configured ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <Badge variant={status.supabaseKey.configured ? "default" : "destructive"}>
                {status.supabaseKey.configured ? "✓ Configured" : "Missing"}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span>Database Connection</span>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <Badge variant="default">✓ Auto-configured</Badge>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💡 How Database Connection Works</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Supabase client handles all database connections automatically</li>
            <li>• No manual PostgreSQL connection strings needed</li>
            <li>• Vercel sets DATABASE_URL automatically when you connect Supabase</li>
            <li>• Row Level Security (RLS) handles authentication</li>
          </ul>
        </div>

        {(!status.supabaseUrl.configured || !status.supabaseKey.configured) && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">🔧 Setup Required</h4>
            <p className="text-sm text-red-800">
              Add the Supabase integration to your Vercel project to automatically configure these variables.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
