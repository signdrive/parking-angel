"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw, AlertCircle, CheckCircle, XCircle } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWADebug() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [swRegistered, setSwRegistered] = useState(false)
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({})

  useEffect(() => {
    // Check if already installed as PWA
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
    const isInWebAppiOS = (window.navigator as any).standalone === true
    setIsInstalled(isStandalone || isInWebAppiOS)

    // Check service worker support
    const swSupported = "serviceWorker" in navigator
    setDebugInfo((prev) => ({ ...prev, swSupported }))

    // Register service worker
    if (swSupported) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Service worker registered:", reg)
          setSwRegistered(true)
          setDebugInfo((prev) => ({
            ...prev,
            swRegistered: true,
            swScope: reg.scope,
          }))
        })
        .catch((err) => {
          console.error("Service worker registration failed:", err)
          setDebugInfo((prev) => ({
            ...prev,
            swRegistered: false,
            swError: err.message,
          }))
        })
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67+ from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
      setDebugInfo((prev) => ({
        ...prev,
        promptCaptured: true,
        promptTime: new Date().toISOString(),
      }))
      console.log("Install prompt captured and ready!")
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
      setDebugInfo((prev) => ({
        ...prev,
        appInstalled: true,
        installTime: new Date().toISOString(),
      }))
      console.log("PWA was installed")
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    // Check manifest
    fetch("/manifest.json")
      .then((response) => {
        const manifestOk = response.ok
        setDebugInfo((prev) => ({ ...prev, manifestOk }))
        return response.json()
      })
      .then((data) => {
        setDebugInfo((prev) => ({
          ...prev,
          manifestData: {
            name: data.name,
            shortName: data.short_name,
            hasIcons: !!data.icons?.length,
            display: data.display,
            startUrl: data.start_url,
          },
        }))
      })
      .catch((err) => {
        setDebugInfo((prev) => ({
          ...prev,
          manifestError: err.message,
        }))
      })

    // Get browser info
    setDebugInfo((prev) => ({
      ...prev,
      userAgent: navigator.userAgent,
      isChrome: navigator.userAgent.includes("Chrome"),
      isSafari: navigator.userAgent.includes("Safari") && !navigator.userAgent.includes("Chrome"),
      isFirefox: navigator.userAgent.includes("Firefox"),
      isEdge: navigator.userAgent.includes("Edg"),
    }))

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      console.log("No installation prompt available")

      // For Safari on iOS, show instructions
      if (
        navigator.userAgent.includes("Safari") &&
        !navigator.userAgent.includes("Chrome") &&
        /iPhone|iPad|iPod/.test(navigator.userAgent)
      ) {
        alert("To install this app on iOS: tap the share icon, then 'Add to Home Screen'")
        return
      }

      alert("Installation not available. Try using Chrome or Edge browser.")
      return
    }

    try {
      // Show the prompt
      await deferredPrompt.prompt()
      // Wait for the user to respond to the prompt
      const choiceResult = await deferredPrompt.userChoice

      setDebugInfo((prev) => ({
        ...prev,
        userChoice: choiceResult.outcome,
      }))

      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt")
      } else {
        console.log("User dismissed the install prompt")
      }

      // Clear the saved prompt as it can't be used again
      setDeferredPrompt(null)
      setIsInstallable(false)
    } catch (err) {
      console.error("Error during installation:", err)
      setDebugInfo((prev) => ({
        ...prev,
        installError: err.message,
      }))
    }
  }

  const forcePrompt = () => {
    // This is a hack to try to trigger the install prompt
    // It doesn't always work but worth trying
    const iframe = document.createElement("iframe")
    iframe.style.display = "none"
    document.body.appendChild(iframe)

    setTimeout(() => {
      document.body.removeChild(iframe)
      console.log("Attempted to force install prompt")
      setDebugInfo((prev) => ({
        ...prev,
        forcedPromptAttempt: true,
        forcedPromptTime: new Date().toISOString(),
      }))
    }, 100)
  }

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <Download className="w-5 h-5 mr-2 text-blue-600" />
        PWA Installation
      </h2>

      <div className="space-y-4">
        {isInstalled ? (
          <div className="flex items-center text-green-600 bg-green-50 p-3 rounded-md">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span>App is already installed!</span>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              <Button onClick={handleInstall} disabled={!isInstallable} className="bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4 mr-2" />
                Install Park Algo App
              </Button>

              {!isInstallable && (
                <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md flex items-start">
                  <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Installation not available yet</p>
                    <p className="mt-1">Try these steps:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Use Chrome or Edge browser</li>
                      <li>On iOS, tap share icon then "Add to Home Screen"</li>
                      <li>Refresh the page and try again</li>
                    </ul>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={forcePrompt}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Force Prompt
                </Button>
              </div>
            </div>

            <div className="text-xs text-gray-500 border-t pt-3 mt-3">
              <p className="font-medium mb-1">PWA Status:</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div className="flex items-center">
                  {swRegistered ? (
                    <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-500 mr-1" />
                  )}
                  <span>Service Worker</span>
                </div>
                <div className="flex items-center">
                  {debugInfo.manifestOk ? (
                    <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-500 mr-1" />
                  )}
                  <span>Manifest</span>
                </div>
                <div className="flex items-center">
                  {isInstallable ? (
                    <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-500 mr-1" />
                  )}
                  <span>Install Prompt</span>
                </div>
                <div className="flex items-center">
                  {debugInfo.isChrome || debugInfo.isEdge ? (
                    <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-500 mr-1" />
                  )}
                  <span>Supported Browser</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
