'use client';

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

export default function AuthCallbackError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    toast({
      variant: "destructive",
      title: "Authentication Error",
      description: error.message || "There was a problem with the authentication flow.",
    })
    router.push('/auth/login')
  }, [error, router, toast])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Authentication Error</h2>
        <p className="text-gray-600 mb-4">{error.message || "There was a problem with the authentication flow."}</p>
        <button
          onClick={reset}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
