"use client"

import { useState, useEffect, createContext, useContext } from "react"

interface ConsentPreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  functional: boolean
}

interface ConsentContextType {
  preferences: ConsentPreferences | null
  hasConsent: boolean
  showConsentScreen: () => void
  updateConsent: (preferences: ConsentPreferences) => void
  getConsent: () => ConsentPreferences | null
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined)

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<ConsentPreferences | null>(null)
  const [hasConsent, setHasConsent] = useState(false)

  useEffect(() => {
    // Load consent preferences from localStorage on mount
    const savedConsent = localStorage.getItem('park-algo-consent')
    if (savedConsent) {
      try {
        const parsed = JSON.parse(savedConsent)
        setPreferences(parsed)
        setHasConsent(true)
        
        // Initialize tracking services based on saved preferences
        initializeTracking(parsed)
      } catch (error) {
        console.error('Error parsing saved consent:', error)
      }
    }
  }, [])

  const initializeTracking = (consent: ConsentPreferences) => {
    // Initialize Google Analytics
    if (consent.analytics && typeof window !== 'undefined') {
      // Google Analytics initialization would go here
      console.log('Google Analytics initialized')
    }

    // Initialize marketing tracking
    if (consent.marketing && typeof window !== 'undefined') {
      // Marketing pixels, Facebook Pixel, etc. would go here
      console.log('Marketing tracking initialized')
    }

    // Initialize functional features
    if (consent.functional && typeof window !== 'undefined') {
      // Functional cookies like preferences, chat widgets, etc.
      console.log('Functional features initialized')
    }
  }

  const updateConsent = (newPreferences: ConsentPreferences) => {
    setPreferences(newPreferences)
    setHasConsent(true)
    localStorage.setItem('park-algo-consent', JSON.stringify(newPreferences))
    localStorage.setItem('park-algo-consent-date', new Date().toISOString())
    
    initializeTracking(newPreferences)
  }

  const showConsentScreen = () => {
    setHasConsent(false)
    localStorage.removeItem('park-algo-consent')
    localStorage.removeItem('park-algo-consent-date')
  }

  const getConsent = (): ConsentPreferences | null => {
    const savedConsent = localStorage.getItem('park-algo-consent')
    if (savedConsent) {
      try {
        return JSON.parse(savedConsent)
      } catch {
        return null
      }
    }
    return null
  }

  return (
    <ConsentContext.Provider value={{
      preferences,
      hasConsent,
      showConsentScreen,
      updateConsent,
      getConsent
    }}>
      {children}
    </ConsentContext.Provider>
  )
}

export function useConsent() {
  const context = useContext(ConsentContext)
  if (context === undefined) {
    throw new Error('useConsent must be used within a ConsentProvider')
  }
  return context
}
