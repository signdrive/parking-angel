"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Chrome, Loader2, AlertTriangle, CheckCircle } from "lucide-react"
import { signInWithEmail, signInWithGoogle } from "@/lib/auth-production"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { data, error: authError } = await signInWithEmail(email, password)

      if (authError) {
        setError(authError.message)
      } else if (data?.user) {
        setSuccess("Login successful! Redirecting...")
        setTimeout(() => {
          router.push("/dashboard")
        }, 1000)
      } else {
        setError("Login failed. Please try again.")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { data, error: authError } = await signInWithGoogle()

      if (authError) {
        setError(authError.message)
        setGoogleLoading(false)
      } else {
        setSuccess("Redirecting to Google...")
        // Don't set loading to false as we're redirecting
      }
    } catch (err) {
      console.error("Google sign-in error:", err)
      setError("Google sign-in failed. Please try email login.")
      setGoogleLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-900">Welcome to Park Algo</CardTitle>
        <CardDescription className="text-gray-600">Sign in to access your smart parking dashboard</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Google Sign In */}
        <Button onClick={handleGoogleSignIn} disabled={googleLoading || loading} variant="outline" className="w-full">
          {googleLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Chrome className="w-4 h-4 mr-2" />}
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">Or continue with email</span>
          </div>
        </div>

        {/* Email Sign In */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading || googleLoading}
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading || googleLoading}
              placeholder="Enter your password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading || googleLoading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        {/* Help Text */}
        <div className="text-center text-sm text-gray-500 space-y-2">
          <p>
            Don't have an account?{" "}
            <a href="/auth/signup" className="text-blue-600 hover:underline">
              Sign up
            </a>
          </p>
          <p>
            <a href="/auth/forgot-password" className="text-blue-600 hover:underline">
              Forgot your password?
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
