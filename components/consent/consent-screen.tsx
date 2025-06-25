"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface ConsentPreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  functional: boolean
}

export function ConsentScreen() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has already made a consent choice
    const hasConsent = localStorage.getItem('park-algo-consent')
    if (!hasConsent) {
      setIsVisible(true)
    }
  }, [])

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    }
    saveConsent(allAccepted)
    setIsVisible(false)
  }

  const handleDeny = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    }
    saveConsent(onlyNecessary)
    setIsVisible(false)
  }

  const saveConsent = (consent: ConsentPreferences) => {
    localStorage.setItem('park-algo-consent', JSON.stringify(consent))
    localStorage.setItem('park-algo-consent-date', new Date().toISOString())
    
    // Here you would typically initialize your tracking services based on consent
    if (consent.analytics) {
      console.log('Analytics tracking enabled')
    }
    if (consent.marketing) {
      console.log('Marketing tracking enabled')
    }
    if (consent.functional) {
      console.log('Functional cookies enabled')
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="mb-3">
          <p className="text-sm text-gray-700 leading-relaxed">
            This site uses tracking technologies. You may opt in or opt out of the use of these technologies.
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            onClick={handleDeny}
            variant="outline"
            size="sm"
            className="text-sm px-4 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Deny
          </Button>
          <Button
            onClick={handleAcceptAll}
            size="sm"
            className="text-sm px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white"
          >
            Accept all
          </Button>
          <Link href="/consent-settings">
            <Button
              variant="outline"
              size="sm"
              className="text-sm px-4 py-2 bg-black text-white hover:bg-gray-800 border-black"
            >
              Consent Settings
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
