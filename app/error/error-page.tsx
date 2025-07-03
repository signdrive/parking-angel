'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card'
import { useToast } from '../../hooks/use-toast'

interface ErrorPageProps {
  error: Error & { digest?: string }
  resetAction: () => void
}

export default function ErrorPage({ error, resetAction }: ErrorPageProps) {
  const { toast } = useToast()
  const router = useRouter()
  
  const handleResetAction = async () => {
    try {
      resetAction()
      toast({
        title: "Retrying...",
        description: "Attempting to recover from the error."
      })
    } catch (e) {
      try {
        router.refresh()
      } catch {
        window.location.reload()
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            {error?.message || "We encountered an unexpected error while processing your request."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Our team has been notified and is working to resolve the issue.
            {error?.digest && (
              <span className="block mt-1 font-mono text-xs text-muted-foreground">
                Error ID: {error.digest}
              </span>
            )}
          </p>
          <div className="space-y-2">
            <p className="text-sm">You can try:</p>
            <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
              <li>Clicking &quot;Try Again&quot; to attempt recovery</li>
              <li>Clearing your browser cache and reloading</li>
              <li>Checking your internet connection</li>
              <li>Logging out and signing back in</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between w-full">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="default"
              onClick={handleResetAction}
              className="flex-1 sm:flex-initial"
            >
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => router.refresh()}
              className="flex-1 sm:flex-initial"
            >
              Refresh
            </Button>
          </div>
          <Button 
            variant="ghost"
            asChild
            className="w-full sm:w-auto"
          >
            <Link href="/">Return Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
