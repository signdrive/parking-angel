"use client"

export class FirebaseErrorDetector {
  private static instance: FirebaseErrorDetector
  private domainErrorDetected = false
  private callbacks: Array<(error: boolean) => void> = []

  private constructor() {
    if (typeof window !== "undefined") {
      this.setupErrorDetection()
    }
  }

  static getInstance(): FirebaseErrorDetector {
    if (!FirebaseErrorDetector.instance) {
      FirebaseErrorDetector.instance = new FirebaseErrorDetector()
    }
    return FirebaseErrorDetector.instance
  }

  private setupErrorDetection() {
    // Listen for console errors
    const originalConsoleError = console.error
    console.error = (...args) => {
      const message = args.join(" ")
      if (message.includes("googleapis.com") && (message.includes("403") || message.includes("Forbidden"))) {
        this.domainErrorDetected = true
        this.notifyCallbacks(true)
      }
      originalConsoleError.apply(console, args)
    }

    // Listen for fetch errors
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args)
        if (!response.ok && response.status === 403 && args[0]?.toString().includes("googleapis.com")) {
          this.domainErrorDetected = true
          this.notifyCallbacks(true)
        }
        return response
      } catch (error) {
        return originalFetch(...args)
      }
    }
  }

  onDomainError(callback: (error: boolean) => void) {
    this.callbacks.push(callback)
    // If error already detected, call immediately
    if (this.domainErrorDetected) {
      callback(true)
    }
  }

  private notifyCallbacks(error: boolean) {
    this.callbacks.forEach((callback) => callback(error))
  }

  isDomainErrorDetected(): boolean {
    return this.domainErrorDetected
  }
}
