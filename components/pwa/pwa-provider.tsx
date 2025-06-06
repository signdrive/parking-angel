"use client"

import type React from "react"

import { useEffect } from "react"
import { InstallPrompt } from "./install-prompt"

export function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered successfully:", registration.scope)

          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  // New content is available
                  console.log("New content available, please refresh")

                  // Notify user about update
                  if (window.confirm("New version available! Refresh to update?")) {
                    window.location.reload()
                  }
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error)
        })
    }

    // Request notification permission on load
    if ("Notification" in window && Notification.permission === "default") {
      setTimeout(() => {
        Notification.requestPermission().then((permission) => {
          console.log("Notification permission:", permission)
        })
      }, 5000) // Wait 5 seconds before asking
    }
  }, [])

  return (
    <>
      {children}
      <InstallPrompt />
    </>
  )
}
