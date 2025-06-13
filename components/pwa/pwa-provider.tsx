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
          console.log("Service Worker registered successfully:", registration)
          
          // Check for updates
          registration.addEventListener("updatefound", () => {
            console.log("Service Worker update found")
          })
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error)
        })
    } else if ("serviceWorker" in navigator && process.env.NODE_ENV === "development") {
      // In development, register but with minimal interference
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          console.log("Service Worker registered (dev mode):", registration)
        })
        .catch((error) => {
          console.warn("Service Worker registration failed (dev mode):", error)
        })
    }

    // Handle PWA installation prompt
    let deferredPrompt: any

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("PWA install prompt available")
      e.preventDefault()
      deferredPrompt = e

      // Dispatch custom event for components to listen to
      window.dispatchEvent(new CustomEvent("pwa-installable", { detail: deferredPrompt }))
    }

    const handleAppInstalled = () => {
      console.log("PWA was installed")
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
