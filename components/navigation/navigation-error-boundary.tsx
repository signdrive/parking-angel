"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RotateCcw, ArrowLeft } from "lucide-react"

interface NavigationErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface NavigationErrorBoundaryProps {
  children: React.ReactNode
  onReset?: () => void
  onExit?: () => void
}

export class NavigationErrorBoundary extends React.Component<
  NavigationErrorBoundaryProps,
  NavigationErrorBoundaryState
> {
  constructor(props: NavigationErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): NavigationErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Navigation Error Boundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 text-white">
          <Card className="w-full max-w-md mx-4 bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-6 h-6" />
                Navigation Error
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">
                An error occurred while loading the navigation system. This might be due to:
              </p>
              <ul className="text-sm text-gray-400 space-y-1 ml-4">
                <li>• Network connectivity issues</li>
                <li>• Map service unavailable</li>
                <li>• Location services disabled</li>
                <li>• Invalid route data</li>
              </ul>

              {this.state.error && (
                <details className="text-xs text-gray-500">
                  <summary className="cursor-pointer">Technical Details</summary>
                  <pre className="mt-2 p-2 bg-gray-900 rounded overflow-auto">{this.state.error.message}</pre>
                </details>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    this.setState({ hasError: false, error: null })
                    this.props.onReset?.()
                  }}
                  className="flex-1"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={this.props.onExit} variant="outline" className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
