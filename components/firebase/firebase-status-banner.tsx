"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useFirebaseAuth } from "@/hooks/use-firebase-auth"
import { FirebaseErrorDetector } from "@/lib/firebase-error-detector"

type FirebaseStatus = "loading" | "working" | "domain-blocked" | "error" | "not-configured"

export function FirebaseStatusBanner() {
  const { firebaseUser, firebaseError } = useFirebaseAuth()
  const [status, setStatus] = useState<FirebaseStatus>("loading")
  const [errorDetails, setErrorDetails] = useState<string>("")

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || ""

    if (!apiKey) {
      setStatus("not-configured")
      return
    }

    // Set up domain error detection
    const detector = FirebaseErrorDetector.getInstance()

    detector.onDomainError((hasError) => {
      if (hasError) {
        setStatus("domain-blocked")
        setErrorDetails("Firebase API key has domain restrictions (403 errors detected)")
      }
    })

    // Check immediate status
    if (detector.isDomainErrorDetected()) {
      setStatus("domain-blocked")
      setErrorDetails("Firebase API key has domain restrictions (403 errors detected)")
    } else if (firebaseError) {
      setStatus("error")
      setErrorDetails(firebaseError.message || "Unknown Firebase error")
    } else if (firebaseUser) {
      setStatus("working")
    } else {
      // Wait a bit to see if domain errors appear
      setTimeout(() => {
        if (!firebaseUser && !detector.isDomainErrorDetected()) {
          setStatus("domain-blocked")
          setErrorDetails("Firebase authentication not working (likely domain restrictions)")
        }
      }, 2000)
    }
  }, [firebaseUser, firebaseError])

  // Don't show banner if loading
  if (status === "loading") {
    return null
  }

  // Don't show banner if not configured
  if (status === "not-configured") {
    return null
  }

  if (status === "working") {
    return (
      <Alert variant="default" className="bg-green-50 border-green-200 text-green-800 mb-4">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle>🔥 Firebase Authentication Active</AlertTitle>
        <AlertDescription>Firebase authentication is working perfectly alongside Supabase!</AlertDescription>
      </Alert>
    )
  }

  if (status === "domain-blocked") {
    return (
      <Alert variant="destructive" className="mb-4">
        <XCircle className="h-4 w-4" />
        <AlertTitle>🚫 Firebase Domain Restriction Detected</AlertTitle>
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">Firebase API key is restricted and blocking this domain.</p>
            <p className="text-sm">
              ✅ <strong>Good news:</strong> Supabase authentication is working perfectly!
            </p>
            <div className="text-xs mt-2 p-2 bg-red-50 rounded border">
              <p>
                <strong>Error:</strong> API_KEY_HTTP_REFERRER_BLOCKED (403)
              </p>
              <p>
                <strong>Solution:</strong> Create unrestricted Firebase API key or add domain to restrictions
              </p>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (status === "error") {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Firebase Authentication Error</AlertTitle>
        <AlertDescription>
          <p>Firebase authentication encountered an error. Supabase authentication is still working.</p>
          {errorDetails && <p className="text-xs mt-2 opacity-80">{errorDetails}</p>}
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
