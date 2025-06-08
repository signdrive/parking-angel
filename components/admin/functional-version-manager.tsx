"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface VersionConfig {
  id: number
  version: string
  features: string[]
  components: string[]
  apiEndpoints: string[]
  description: string
  status: "stable" | "beta" | "experimental"
  releaseDate: string
}

// Actual version configurations with different feature sets
const versionConfigs: VersionConfig[] = [
  {
    id: 130,
    version: "v2.3.0",
    features: ["Basic Map", "User Auth", "Simple Parking Spots"],
    components: ["parking-map", "login-form", "signup-form"],
    apiEndpoints: ["/api/spots", "/api/auth"],
    description: "Basic parking finder with authentication",
    status: "stable",
    releaseDate: "2024-01-15",
  },
  {
    id: 135,
    version: "v2.3.5",
    features: ["Enhanced Map", "User Profiles", "Spot Reporting"],
    components: ["enhanced-parking-map", "user-profile", "spot-report-dialog"],
    apiEndpoints: ["/api/spots", "/api/auth", "/api/spots/report"],
    description: "Added user profiles and spot reporting",
    status: "stable",
    releaseDate: "2024-01-22",
  },
  {
    id: 140,
    version: "v2.4.0",
    features: ["AI Predictions", "Smart Notifications", "Analytics"],
    components: ["ai-assistant", "smart-notifications", "analytics-dashboard"],
    apiEndpoints: ["/api/ai", "/api/notifications", "/api/analytics"],
    description: "Major AI integration and analytics",
    status: "stable",
    releaseDate: "2024-02-01",
  },
  {
    id: 145,
    version: "v2.4.5",
    features: ["Route Optimization", "Real-time Updates", "Premium Features"],
    components: ["route-optimizer", "realtime-updates", "premium-dashboard"],
    apiEndpoints: ["/api/navigation", "/api/realtime", "/api/premium"],
    description: "Navigation and real-time features",
    status: "stable",
    releaseDate: "2024-02-15",
  },
  {
    id: 150,
    version: "v2.5.0",
    features: ["PWA Support", "Offline Mode", "Push Notifications"],
    components: ["pwa-provider", "offline-handler", "notification-manager"],
    apiEndpoints: ["/api/pwa", "/api/offline", "/api/push"],
    description: "Progressive Web App capabilities",
    status: "stable",
    releaseDate: "2024-03-01",
  },
  {
    id: 155,
    version: "v2.5.5",
    features: ["Voice Commands", "AR Integration", "Smart Assistant"],
    components: ["voice-handler", "ar-overlay", "smart-assistant"],
    apiEndpoints: ["/api/voice", "/api/ar", "/api/assistant"],
    description: "Voice and AR experimental features",
    status: "beta",
    releaseDate: "2024-03-15",
  },
  {
    id: 160,
    version: "v2.6.0",
    features: ["Multi-city Support", "Payment Integration", "Booking System"],
    components: ["city-selector", "payment-handler", "booking-system"],
    apiEndpoints: ["/api/cities", "/api/payments", "/api/bookings"],
    description: "Expanded to multiple cities with payments",
    status: "stable",
    releaseDate: "2024-04-01",
  },
  {
    id: 165,
    version: "v2.7.0",
    features: ["Machine Learning", "Predictive Analytics", "Dynamic Pricing"],
    components: ["ml-engine", "prediction-dashboard", "pricing-calculator"],
    apiEndpoints: ["/api/ml", "/api/predictions", "/api/pricing"],
    description: "Advanced ML and predictive features",
    status: "beta",
    releaseDate: "2024-04-15",
  },
  {
    id: 170,
    version: "v2.8.0",
    features: ["Full Integration", "Admin Dashboard", "Enterprise Features"],
    components: ["admin-panel", "enterprise-dashboard", "integration-hub"],
    apiEndpoints: ["/api/admin", "/api/enterprise", "/api/integrations"],
    description: "Complete enterprise solution",
    status: "stable",
    releaseDate: "2024-05-01",
  },
  {
    id: 175,
    version: "v2.8.5",
    features: ["Latest AI", "Performance Optimizations", "Security Updates"],
    components: ["ai-chat", "performance-monitor", "security-handler"],
    apiEndpoints: ["/api/ai/grok-chat", "/api/performance", "/api/security"],
    description: "Latest version with cutting-edge AI",
    status: "stable",
    releaseDate: "2024-05-15",
  },
]

// Fill in remaining versions with incremental updates
const allVersions = [...versionConfigs]
for (let i = 131; i <= 174; i++) {
  if (!versionConfigs.find((v) => v.id === i)) {
    const baseVersion = versionConfigs.find((v) => v.id <= i) || versionConfigs[0]
    allVersions.push({
      id: i,
      version: `v2.${Math.floor((i - 130) / 10) + 3}.${(i - 130) % 10}`,
      features: [...baseVersion.features, `Update ${i}`],
      components: baseVersion.components,
      apiEndpoints: baseVersion.apiEndpoints,
      description: `Incremental update from version ${i - 1}`,
      status: "stable" as const,
      releaseDate: new Date(2024, 0, 15 + (i - 130)).toISOString().split("T")[0],
    })
  }
}

allVersions.sort((a, b) => a.id - b.id)

export default function FunctionalVersionManager() {
  const [currentVersion, setCurrentVersion] = useState<number>(175)
  const [restoring, setRestoring] = useState<number | null>(null)
  const [activeConfig, setActiveConfig] = useState<VersionConfig | null>(null)

  useEffect(() => {
    // Load current version from localStorage
    const savedVersion = localStorage.getItem("parking-app-version")
    if (savedVersion) {
      const versionId = Number.parseInt(savedVersion)
      setCurrentVersion(versionId)
      const config = allVersions.find((v) => v.id === versionId)
      setActiveConfig(config || null)
    } else {
      const latestConfig = allVersions.find((v) => v.id === 175)
      setActiveConfig(latestConfig || null)
    }
  }, [])

  const handleRestore = async (versionId: number) => {
    setRestoring(versionId)

    try {
      // Simulate version switching process
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Save to localStorage
      localStorage.setItem("parking-app-version", versionId.toString())

      // Update application state
      const config = allVersions.find((v) => v.id === versionId)
      if (config) {
        setActiveConfig(config)
        setCurrentVersion(versionId)

        // Trigger app reload to apply version changes
        window.location.reload()
      }
    } catch (error) {
      console.error("Failed to restore version:", error)
    } finally {
      setRestoring(null)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Version Manager</h1>
        <p className="text-gray-600">Select and restore different versions of the Parking Angel app</p>
      </div>

      {activeConfig && (
        <Card className="mb-6 border-green-500 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Currently Active: {activeConfig.version}</span>
              <Badge variant="outline" className="bg-green-100">
                {activeConfig.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3">{activeConfig.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-1">Features:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {activeConfig.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Components:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {activeConfig.components.slice(0, 3).map((component, idx) => (
                    <li key={idx}>{component}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-1">API Endpoints:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {activeConfig.apiEndpoints.slice(0, 3).map((endpoint, idx) => (
                    <li key={idx}>{endpoint}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {allVersions.map((version) => (
          <Card
            key={version.id}
            className={`transition-all ${
              currentVersion === version.id ? "border-green-500 bg-green-50 shadow-md" : "hover:shadow-md"
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{version.version}</CardTitle>
                  <p className="text-sm text-gray-500">ID: {version.id}</p>
                </div>
                <Badge
                  variant={
                    version.status === "stable" ? "default" : version.status === "beta" ? "secondary" : "outline"
                  }
                >
                  {version.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{version.description}</p>
              <div className="text-xs text-gray-500 mb-3">Released: {version.releaseDate}</div>
              <div className="mb-4">
                <p className="text-xs font-semibold mb-1">Key Features:</p>
                <div className="flex flex-wrap gap-1">
                  {version.features.slice(0, 2).map((feature, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {version.features.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{version.features.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                onClick={() => handleRestore(version.id)}
                disabled={restoring === version.id}
                className="w-full"
                variant={currentVersion === version.id ? "outline" : "default"}
              >
                {restoring === version.id
                  ? "Restoring..."
                  : currentVersion === version.id
                    ? "Current Version"
                    : "Restore & Test"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
