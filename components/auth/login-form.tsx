"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { signInWithEmail } from "@/lib/auth"
import { useAuth } from "@/components/auth/auth-provider"
import { Chrome } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const auth = useAuth()
  const signInWithGoogle = auth.signInWithGoogle

  // Get return URL from query params
  const returnTo = searchParams.get('return_to') || '/dashboard'

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await signInWithEmail(email, password)

    if (error) {
      setError(error.message)
    } else {
      // Redirect to return URL or dashboard
      router.push(returnTo)
    }

    setLoading(false)
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError(null)
    try {
      await signInWithGoogle(returnTo)
    } catch (err) {
      setError('Failed to sign in with Google')

    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Image 
            src="/park-algo-logo.png" 
            alt="Park Algo Logo" 
            width={64}
            height={64}
            className="h-16 w-auto"
          />
        </div>
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>Sign in to your Park Algo account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Google Sign In - ALWAYS SHOW */}
        <Button onClick={handleGoogleSignIn} disabled={googleLoading || loading} variant="outline" className="w-full">
          {googleLoading ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2" />
          ) : (
            <Chrome className="w-4 h-4 mr-2" />
          )}
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
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || googleLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || googleLoading}
            />
          </div>
          <Button type="submit" disabled={loading || googleLoading} className="w-full">
            {loading ? (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-white rounded-full animate-spin mr-2" />
            ) : null}
            Sign In
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
