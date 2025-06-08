"use client"

export interface AppVersion {
  id: number
  version: string
  features: string[]
  components: string[]
  config: Record<string, any>
}

export class VersionManager {
  private static instance: VersionManager
  private currentVersion = 175

  static getInstance(): VersionManager {
    if (!VersionManager.instance) {
      VersionManager.instance = new VersionManager()
    }
    return VersionManager.instance
  }

  getCurrentVersion(): number {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("parking-app-version")
      return saved ? Number.parseInt(saved) : 175
    }
    return this.currentVersion
  }

  setVersion(versionId: number): void {
    this.currentVersion = versionId
    if (typeof window !== "undefined") {
      localStorage.setItem("parking-app-version", versionId.toString())
      // Dispatch custom event to notify components
      window.dispatchEvent(
        new CustomEvent("versionChanged", {
          detail: { versionId },
        }),
      )
    }
  }

  isFeatureEnabled(feature: string): boolean {
    const version = this.getCurrentVersion()
    // Define feature availability by version
    const featureMap: Record<string, number> = {
      "ai-assistant": 140,
      "voice-commands": 155,
      "ar-integration": 155,
      "pwa-support": 150,
      "payment-integration": 160,
      "machine-learning": 165,
      "admin-dashboard": 170,
      "grok-chat": 175,
    }

    return version >= (featureMap[feature] || 0)
  }
}

export const versionManager = VersionManager.getInstance()
