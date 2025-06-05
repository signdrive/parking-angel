"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"
import { AlertCircle, Bug, RefreshCw } from "lucide-react"

export function AuthDebug() {
  const { user, loading } = useAuth()
  const [sessionData, setSessionData] = useState<any>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)

  const checkAuth = async () => {
    setChecking(true)
    setError(null)

    try {
      // Check session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw new Error(`Session error: ${sessionError.message}`)
      setSessionData(sessionData)

      // If we have a session, check profile
      if (sessionData?.session?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", sessionData.session.user.id)
          .single()

        if (profileError) throw new Error(`Profile error: ${profileError.message}`)
        setProfileData(profileData)
      }
    } catch (err) {
      console.error("Auth check error:", err)
      setError(err instanceof Error ? err.message : "Unknown error checking auth")
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="w-5 h-5 text-orange-500" />
          Authentication Debug
        </CardTitle>
        <CardDescription>Troubleshooting authentication issues</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4">
          <div className="p-3 border rounded-lg">
            <h3 className="font-medium mb-2">Auth Hook Status</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium">Loading:</div>
              <div>{loading ? "True" : "False"}</div>
              <div className="font-medium">User:</div>
              <div>{user ? "Authenticated" : "Not authenticated"}</div>
              {user && (
                <>
                  <div className="font-medium">User ID:</div>
                  <div className="break-all">{user.id}</div>
                  <div className="font-medium">Email:</div>
                  <div>{user.email}</div>
                </>
              )}
            </div>
          </div>

          <div className="p-3 border rounded-lg">
            <h3 className="font-medium mb-2">Session Data</h3>
            {sessionData ? (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">Session:</div>
                <div>{sessionData.session ? "Active" : "None"}</div>
                {sessionData.session && (
                  <>
                    <div className="font-medium">Expires:</div>
                    <div>{new Date(sessionData.session.expires_at * 1000).toLocaleString()}</div>
                    <div className="font-medium">Provider:</div>
                    <div>{sessionData.session.user?.app_metadata?.provider || "email"}</div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No session data available</div>
            )}
          </div>

          <div className="p-3 border rounded-lg">
            <h3 className="font-medium mb-2">Profile Data</h3>
            {profileData ? (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">ID:</div>
                <div className="break-all">{profileData.id}</div>
                <div className="font-medium">Full Name:</div>
                <div>{profileData.full_name || "Not set"}</div>
                <div className="font-medium">Email:</div>
                <div>{profileData.email || "Not set"}</div>
                <div className="font-medium">Created:</div>
                <div>{new Date(profileData.created_at).toLocaleString()}</div>
                <div className="font-medium">Reputation:</div>
                <div>{profileData.reputation_score || 0}</div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No profile data available</div>
            )}
          </div>
        </div>

        <div className="flex justify-between">
          <Button onClick={checkAuth} disabled={checking}>
            {checking ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Refresh Auth Status
          </Button>

          <div className="flex items-center gap-2">
            <Badge variant={user ? "success" : "destructive"}>{user ? "Authenticated" : "Not Authenticated"}</Badge>
            <Badge variant={profileData ? "success" : "destructive"}>
              {profileData ? "Profile Found" : "No Profile"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
