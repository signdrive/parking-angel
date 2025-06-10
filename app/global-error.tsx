"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="w-16 h-16 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Service Temporarily Unavailable</CardTitle>
              <CardDescription className="text-gray-600">
                Park Algo is experiencing technical difficulties. Our team has been notified.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  We apologize for the inconvenience. Please try again in a few minutes.
                </p>
              </div>

              <div className="flex flex-col space-y-2">
                <Button onClick={reset} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => (window.location.href = "https://www.parkalgo.com")}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Homepage
                </Button>
              </div>

              <div className="text-center text-sm text-gray-500">
                <p>Error ID: {error.digest}</p>
                <p className="mt-1">If the problem persists, please contact support.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
}
