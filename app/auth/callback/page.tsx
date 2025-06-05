"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { createOrUpdateProfile } from "@/lib/auth"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Auth callback error:", error)
          router.push("/auth/login?error=callback_error")
          return
        }

        if (data.session?.user) {
          // Create or update user profile
          await createOrUpdateProfile(data.session.user)

          // Redirect to dashboard
          router.push("/dashboard")
        } else {
          // No session, redirect to login
          router.push("/auth/login")
        }
      } catch (error) {
        console.error("Callback handling error:", error)
        router.push("/auth/login?error=callback_error")
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <MapPin className="w-12 h-12 text-blue-600 mx-auto animate-pulse" />
            <h2 className="text-xl font-semibold">Completing sign in...</h2>
            <p className="text-gray-600">Please wait while we set up your account.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
