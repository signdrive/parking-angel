'use client';

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

function getErrorMessage(error: string | null, description?: string | null): string {
  const errorCode = error || 'unknown'
  switch (errorCode) {
    case 'invalid_request':
      return description || 'Invalid authentication request. Please try again.'
    case 'session_error':
      return description || 'There was a problem with your login session.'
    case 'no_code':
      return 'No authentication code received. Please try again.'
    case 'unexpected':
      return 'An unexpected error occurred. Please try again.'
    default:
      return description || 'There was a problem signing you in. Please try again.'
  }
}

export default function AuthErrorPage() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const auth = useAuth()

  // Get error details from URL
  const error = searchParams?.get('error')
  const description = searchParams?.get('description')

  // Show toast on initial render
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: getErrorMessage(error, description),
      })
    }
  }, [error, description, toast])

  // Function to retry login
  const handleRetry = async () => {
    try {
      const signInWithGoogle = auth.signInWithGoogle
      if (signInWithGoogle) {
        await signInWithGoogle('/dashboard')
      } else {
        throw new Error('Sign in method not available')
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Retry Failed",
        description: "Please try again later or contact support if the problem persists.",
      })
    }
  }

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Authentication Error
          </h1>
          <p className="text-sm text-muted-foreground">
            {getErrorMessage(error, description)}
          </p>
        </div>
        <div className="grid gap-4">
          <Button onClick={handleRetry}>
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/')}
          >
            Back to Home
          </Button>
        </div>
        <p className="px-8 text-center text-sm text-muted-foreground">
          Need help?{" "}
          <a
            href="mailto:support@parkalgo.com"
            className="underline underline-offset-4 hover:text-primary"
          >
            Contact Support
          </a>
        </p>
      </div>
    </div>
  )
}