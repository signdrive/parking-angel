"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { versionManager } from "@/lib/version-manager"

interface VersionContextType {
  currentVersion: number
  isFeatureEnabled: (feature: string) => boolean
  setVersion: (version: number) => void
}

const VersionContext = createContext<VersionContextType | undefined>(undefined)

export function VersionProvider({ children }: { children: ReactNode }) {
  const [currentVersion, setCurrentVersion] = useState(175)

  useEffect(() => {
    setCurrentVersion(versionManager.getCurrentVersion())

    const handleVersionChange = (event: CustomEvent) => {
      setCurrentVersion(event.detail.versionId)
    }

    window.addEventListener("versionChanged", handleVersionChange as EventListener)
    return () => {
      window.removeEventListener("versionChanged", handleVersionChange as EventListener)
    }
  }, [])

  const value = {
    currentVersion,
    isFeatureEnabled: versionManager.isFeatureEnabled.bind(versionManager),
    setVersion: (version: number) => {
      versionManager.setVersion(version)
      setCurrentVersion(version)
    },
  }

  return <VersionContext.Provider value={value}>{children}</VersionContext.Provider>
}

export function useVersion() {
  const context = useContext(VersionContext)
  if (context === undefined) {
    throw new Error("useVersion must be used within a VersionProvider")
  }
  return context
}
