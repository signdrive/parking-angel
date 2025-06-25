"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Chrome } from "lucide-react"
import { signInWithGoogle } from "@/lib/auth"

export default function TestGooglePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { data, error } = await signInWithGoogle(`${window.location.origin}/dashboard`)

      if (error) {
        setError(error.message)
      } else {
        setSuccess("Redirecting to Google...")
      }
    } catch (err) {
      setError("Failed to initiate Google sign in")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Google Login Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Button onClick={handleGoogleSignIn} disabled={loading} className="w-full" size="lg">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Chrome className="w-5 h-5 mr-2" />
            )}
            {loading ? "Connecting..." : "Continue with Google"}
          </Button>

          <div className="text-center text-sm text-gray-600">
            <p>Environment Variables:</p>
            <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing"}</p>
            <p>Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
