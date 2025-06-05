"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"
import { createOrUpdateProfile } from "@/lib/auth"
import { AlertCircle, Bug, RefreshCw, Wrench, CheckCircle, Database } from "lucide-react"

export function AuthDebug() {
  const { user, loading, refreshUser } = useAuth()
  const [sessionData, setSessionData] = useState<any>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [profileError, setProfileError] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [fixing, setFixing] = useState(false)
  const [fixSuccess, setFixSuccess] = useState(false)
  const [rawProfileQuery, setRawProfileQuery] = useState<any>(null)

  const checkAuth = async () => {
    setChecking(true)
    setError(null)
    setProfileError(null)

    try {
      // Check session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw new Error(`Session error: ${sessionError.message}`)
      setSessionData(sessionData)

      // If we have a session, check profile with detailed error info
      if (sessionData?.session?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", sessionData.session.user.id)
          .single()

        setProfileError(profileError)
        setProfileData(profileError ? null : profileData)

        // Also try a raw query to see what's actually in the database
        const { data: rawData, error: rawError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", sessionData.session.user.id)

        setRawProfileQuery({ data: rawData, error: rawError })
      }
    } catch (err) {
      console.error("Auth check error:", err)
      setError(err instanceof Error ? err.message : "Unknown error checking auth")
    } finally {
      setChecking(false)
    }
  }

  const fixProfile = async () => {
    if (!user) return

    setFixing(true)
    setError(null)
    setFixSuccess(false)

    try {
      // Try to create or update the profile
      const result = await createOrUpdateProfile(user)

      if (result.error) {
        throw new Error(result.error.message)
      }

      setFixSuccess(true)

      // Refresh auth and check again
      await refreshUser()
      await checkAuth()
    } catch (err) {
      console.error("Profile fix error:", err)
      setError(err instanceof Error ? err.message : "Unknown error fixing profile")
    } finally {
      setFixing(false)
    }
  }

  const testDirectQuery = async () => {
    if (!user) return

    try {
      // Test direct database access
      const { data, error } = await supabase.rpc("get_user_profile", { user_id: user.id })
      console.log("Direct query result:", { data, error })
    } catch (err) {
      console.error("Direct query error:", err)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <Card className="w-full max-w-4xl mx-auto">
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

        {fixSuccess && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>Profile has been successfully created/updated! Try refreshing the page.</AlertDescription>
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

          {profileError && (
            <div className="p-3 border rounded-lg border-red-200 bg-red-50">
              <h3 className="font-medium mb-2 text-red-800">Profile Query Error</h3>
              <div className="text-sm space-y-1">
                <div>
                  <strong>Code:</strong> {profileError.code}
                </div>
                <div>
                  <strong>Message:</strong> {profileError.message}
                </div>
                <div>
                  <strong>Details:</strong> {profileError.details}
                </div>
                <div>
                  <strong>Hint:</strong> {profileError.hint}
                </div>
              </div>
            </div>
          )}

          {rawProfileQuery && (
            <div className="p-3 border rounded-lg">
              <h3 className="font-medium mb-2">Raw Database Query</h3>
              <div className="text-sm space-y-2">
                <div>
                  <strong>Query Type:</strong> SELECT * FROM profiles WHERE id = user_id
                </div>
                <div>
                  <strong>Results Count:</strong> {rawProfileQuery.data?.length || 0}
                </div>
                {rawProfileQuery.error && (
                  <div className="text-red-600">
                    <strong>Error:</strong> {rawProfileQuery.error.message}
                  </div>
                )}
                {rawProfileQuery.data && rawProfileQuery.data.length > 0 && (
                  <div>
                    <strong>First Result:</strong>
                    <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
                      {JSON.stringify(rawProfileQuery.data[0], null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 justify-between">
          <div className="flex gap-2">
            <Button onClick={checkAuth} disabled={checking} size="sm">
              {checking ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Refresh Auth Status
            </Button>

            {user && (
              <Button onClick={fixProfile} disabled={fixing} size="sm" variant="outline">
                {fixing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Wrench className="w-4 h-4 mr-2" />}
                Fix Profile
              </Button>
            )}

            {user && (
              <Button onClick={testDirectQuery} size="sm" variant="outline">
                <Database className="w-4 h-4 mr-2" />
                Test Direct Query
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={user ? "default" : "destructive"}>{user ? "Authenticated" : "Not Authenticated"}</Badge>
            <Badge variant={profileData ? "default" : "destructive"}>
              {profileData ? "Profile Found" : "No Profile"}
            </Badge>
            {profileError && <Badge variant="destructive">Error: {profileError.code}</Badge>}
          </div>
        </div>

        {user && profileError && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Profile Query Issue:</strong> The profile exists in the database but the query is failing. Error
              code: {profileError.code}. This might be a Row Level Security (RLS) policy issue or a data corruption
              problem.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
