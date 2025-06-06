"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useFirebaseAuth } from "@/hooks/use-firebase-auth"

type FirebaseStatus = "loading" | "configured" | "domain-error" | "other-error" | "not-configured"

export function FirebaseStatusBanner() {
  const { firebaseUser, firebaseError } = useFirebaseAuth()
  const [status, setStatus] = useState<FirebaseStatus>("loading")
  const [errorDetails, setErrorDetails] = useState<string>("")

  useEffect(() => {
    // Check if Firebase is properly configured
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || ""

    if (!apiKey) {
      setStatus("not-configured")
      return
    }

    if (firebaseError) {
      // Check for domain restriction errors
      if (
        firebaseError.message?.includes("domain-restricted") ||
        firebaseError.message?.includes("unauthorized domain")
      ) {
        setStatus("domain-error")
        setErrorDetails(firebaseError.message)
      } else {
        setStatus("other-error")
        setErrorDetails(firebaseError.message || "Unknown Firebase error")
      }
    } else if (firebaseUser) {
      setStatus("configured")
    } else {
      setStatus("configured") // Assume configured if no errors
    }
  }, [firebaseUser, firebaseError])

  if (status === "loading") {
    return null
  }

  if (status === "configured") {
    return (
      <Alert variant="default" className="bg-green-50 border-green-200 text-green-800 mb-4">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle>Firebase Authentication Ready</AlertTitle>
        <AlertDescription>Firebase authentication is properly configured and ready to use.</AlertDescription>
      </Alert>
    )
  }

  if (status === "domain-error") {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Firebase Domain Restriction Error</AlertTitle>
        <AlertDescription>
          <p>Firebase authentication is restricted to specific domains. Please use Supabase authentication instead.</p>
          {errorDetails && <p className="text-xs mt-2 opacity-80">{errorDetails}</p>}
        </AlertDescription>
      </Alert>
    )
  }

  if (status === "other-error") {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Firebase Authentication Error</AlertTitle>
        <AlertDescription>
          <p>There was an error with Firebase authentication. Please use Supabase authentication instead.</p>
          {errorDetails && <p className="text-xs mt-2 opacity-80">{errorDetails}</p>}
        </AlertDescription>
      </Alert>
    )
  }

  if (status === "not-configured") {
    return (
      <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800 mb-4">
        <Info className="h-4 w-4 text-amber-600" />
        <AlertTitle>Firebase Not Configured</AlertTitle>
        <AlertDescription>
          Firebase API key is not set. Please add NEXT_PUBLIC_FIREBASE_API_KEY to your environment variables.
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
