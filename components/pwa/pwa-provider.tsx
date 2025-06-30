"use client"

import type React from "react"

import { useEffect } from "react"

export function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Register service worker only in production or when explicitly needed
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {

          
          // Check for updates
          registration.addEventListener("updatefound", () => {

          })
        })
        .catch((error) => {

        })
    } else if ("serviceWorker" in navigator && process.env.NODE_ENV === "development") {
      // In development, register but with minimal interference
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {

        })
        .catch((error) => {

        })
    }

    // Handle PWA installation prompt
    let deferredPrompt: any

    const handleBeforeInstallPrompt = (e: Event) => {

      e.preventDefault()
      deferredPrompt = e

      // Dispatch custom event for components to listen to
      window.dispatchEvent(new CustomEvent("pwa-installable", { detail: deferredPrompt }))
    }

    const handleAppInstalled = () => {

      deferredPrompt = null
      window.dispatchEvent(new CustomEvent("pwa-installed"))
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  return <>{children}</>
}
