"use client"

import type React from "react"
import { Component, type ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react"

interface SupabaseBoundaryState {
  hasError: boolean
  error?: Error
  isRetrying: boolean
  retryCount: number
  isOnline: boolean
}

interface SupabaseBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export class SupabaseBoundary extends Component<SupabaseBoundaryProps, SupabaseBoundaryState> {
  private retryTimeout?: NodeJS.Timeout

  constructor(props: SupabaseBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      isRetrying: false,
      retryCount: 0,
      isOnline: true,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<SupabaseBoundaryState> {
    // Check if it's a Supabase-related error
    const isSupabaseError =
      error.message?.includes("PGRST") ||
      error.message?.includes("supabase") ||
      error.message?.includes("406") ||
      error.message?.includes("Not Acceptable")

    return {
      hasError: isSupabaseError,
      error: isSupabaseError ? error : undefined,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("SupabaseBoundary caught error:", error, errorInfo)

    // Call custom error handler
    this.props.onError?.(error, errorInfo)

    // Log to analytics
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "exception", {
        description: `Supabase error: ${error.message}`,
        fatal: false,
      })
    }

    // Auto-retry for certain errors
    if (this.shouldAutoRetry(error) && this.state.retryCount < 3) {
      this.autoRetry()
    }
  }

  componentDidMount() {
    // Listen for connection changes
    if (typeof window !== "undefined") {
      window.addEventListener("supabase-connection-change", this.handleConnectionChange)
      window.addEventListener("online", this.handleOnline)
      window.addEventListener("offline", this.handleOffline)
    }
  }

  componentWillUnmount() {
    if (typeof window !== "undefined") {
      window.removeEventListener("supabase-connection-change", this.handleConnectionChange)
      window.removeEventListener("online", this.handleOnline)
      window.removeEventListener("offline", this.handleOffline)
    }
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
    }
  }

  handleConnectionChange = (event: CustomEvent) => {
    this.setState({ isOnline: event.detail.isOnline })

    if (event.detail.isOnline && this.state.hasError) {
      this.handleRetry()
    }
  }

  handleOnline = () => {
    this.setState({ isOnline: true })
    if (this.state.hasError) {
      this.handleRetry()
    }
  }

  handleOffline = () => {
    this.setState({ isOnline: false })
  }

  shouldAutoRetry(error: Error): boolean {
    const autoRetryErrors = ["PGRST116", "PGRST301", "406", "network", "timeout"]
    return autoRetryErrors.some((code) => error.message?.includes(code))
  }

  autoRetry = () => {
    this.setState({ isRetrying: true })

    this.retryTimeout = setTimeout(() => {
      this.setState((prevState) => ({
        hasError: false,
        error: undefined,
        isRetrying: false,
        retryCount: prevState.retryCount + 1,
      }))
    }, 2000)
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      isRetrying: false,
      retryCount: 0,
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <AlertTriangle className="w-12 h-12 text-red-600" />
                {!this.state.isOnline && <WifiOff className="w-6 h-6 text-gray-400 ml-2" />}
                {this.state.isOnline && <Wifi className="w-6 h-6 text-green-500 ml-2" />}
              </div>
              <CardTitle>Connection Issue</CardTitle>
              <CardDescription>
                {!this.state.isOnline
                  ? "You're offline. Please check your internet connection."
                  : this.state.error?.message || "A database connection error occurred"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {this.state.isRetrying ? (
                <Button disabled className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Retrying...
                </Button>
              ) : (
                <>
                  <Button onClick={this.handleRetry} className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                  <Button onClick={this.handleReload} variant="outline" className="w-full">
                    Reload Page
                  </Button>
                </>
              )}
              {this.state.retryCount > 0 && (
                <p className="text-sm text-gray-500 text-center">Retry attempts: {this.state.retryCount}/3</p>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
