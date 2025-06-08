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

// Complete version configurations from 120 to 175
const versionConfigs: VersionConfig[] = [
  // Version 120-129: Early Development Phase
  {
    id: 120,
    version: "v2.0.0",
    features: ["Basic Authentication", "Simple Map View"],
    components: ["login-form", "basic-map"],
    apiEndpoints: ["/api/auth"],
    description: "Initial release with basic auth and map",
    status: "stable",
    releaseDate: "2023-11-01",
  },
  {
    id: 121,
    version: "v2.0.1",
    features: ["Basic Authentication", "Simple Map View", "Bug Fixes"],
    components: ["login-form", "basic-map"],
    apiEndpoints: ["/api/auth"],
    description: "Hotfix for authentication issues",
    status: "stable",
    releaseDate: "2023-11-03",
  },
  {
    id: 122,
    version: "v2.0.2",
    features: ["Basic Authentication", "Simple Map View", "Performance Improvements"],
    components: ["login-form", "basic-map"],
    apiEndpoints: ["/api/auth"],
    description: "Performance optimizations",
    status: "stable",
    releaseDate: "2023-11-05",
  },
  {
    id: 123,
    version: "v2.0.3",
    features: ["Basic Authentication", "Simple Map View", "UI Polish"],
    components: ["login-form", "basic-map"],
    apiEndpoints: ["/api/auth"],
    description: "UI improvements and polish",
    status: "stable",
    releaseDate: "2023-11-08",
  },
  {
    id: 124,
    version: "v2.0.4",
    features: ["Basic Authentication", "Simple Map View", "Security Updates"],
    components: ["login-form", "basic-map"],
    apiEndpoints: ["/api/auth"],
    description: "Security patches and updates",
    status: "stable",
    releaseDate: "2023-11-10",
  },
  {
    id: 125,
    version: "v2.1.0",
    features: ["User Registration", "Profile Management", "Basic Parking Spots"],
    components: ["signup-form", "user-profile", "parking-spots"],
    apiEndpoints: ["/api/auth", "/api/users", "/api/spots"],
    description: "Added user registration and basic parking spots",
    status: "stable",
    releaseDate: "2023-11-15",
  },
  {
    id: 126,
    version: "v2.1.1",
    features: ["User Registration", "Profile Management", "Basic Parking Spots", "Bug Fixes"],
    components: ["signup-form", "user-profile", "parking-spots"],
    apiEndpoints: ["/api/auth", "/api/users", "/api/spots"],
    description: "Fixed registration validation issues",
    status: "stable",
    releaseDate: "2023-11-17",
  },
  {
    id: 127,
    version: "v2.1.2",
    features: ["User Registration", "Profile Management", "Enhanced Parking Spots"],
    components: ["signup-form", "user-profile", "enhanced-parking-spots"],
    apiEndpoints: ["/api/auth", "/api/users", "/api/spots"],
    description: "Enhanced parking spot display",
    status: "stable",
    releaseDate: "2023-11-20",
  },
  {
    id: 128,
    version: "v2.1.3",
    features: ["User Registration", "Profile Management", "Enhanced Parking Spots", "Search"],
    components: ["signup-form", "user-profile", "enhanced-parking-spots", "search-bar"],
    apiEndpoints: ["/api/auth", "/api/users", "/api/spots", "/api/search"],
    description: "Added basic search functionality",
    status: "stable",
    releaseDate: "2023-11-22",
  },
  {
    id: 129,
    version: "v2.1.4",
    features: ["User Registration", "Profile Management", "Enhanced Parking Spots", "Advanced Search"],
    components: ["signup-form", "user-profile", "enhanced-parking-spots", "advanced-search"],
    apiEndpoints: ["/api/auth", "/api/users", "/api/spots", "/api/search"],
    description: "Improved search with filters",
    status: "stable",
    releaseDate: "2023-11-25",
  },

  // Version 130-139: Core Features Phase
  {
    id: 130,
    version: "v2.2.0",
    features: ["Interactive Map", "Real-time Updates", "Spot Availability"],
    components: ["interactive-map", "realtime-handler", "availability-tracker"],
    apiEndpoints: ["/api/auth", "/api/users", "/api/spots", "/api/realtime"],
    description: "Major update with interactive map and real-time features",
    status: "stable",
    releaseDate: "2023-12-01",
  },
  {
    id: 131,
    version: "v2.2.1",
    features: ["Interactive Map", "Real-time Updates", "Spot Availability", "Mobile Optimization"],
    components: ["interactive-map", "realtime-handler", "availability-tracker", "mobile-ui"],
    apiEndpoints: ["/api/auth", "/api/users", "/api/spots", "/api/realtime"],
    description: "Mobile responsiveness improvements",
    status: "stable",
    releaseDate: "2023-12-03",
  },
  {
    id: 132,
    version: "v2.2.2",
    features: ["Interactive Map", "Real-time Updates", "Spot Availability", "Geolocation"],
    components: ["interactive-map", "realtime-handler", "availability-tracker", "geolocation"],
    apiEndpoints: ["/api/auth", "/api/users", "/api/spots", "/api/realtime", "/api/location"],
    description: "Added GPS location services",
    status: "stable",
    releaseDate: "2023-12-05",
  },
  {
    id: 133,
    version: "v2.2.3",
    features: ["Interactive Map", "Real-time Updates", "Spot Availability", "Navigation"],
    components: ["interactive-map", "realtime-handler", "availability-tracker", "navigation"],
    apiEndpoints: ["/api/auth", "/api/users", "/api/spots", "/api/realtime", "/api/navigation"],
    description: "Basic navigation to parking spots",
    status: "stable",
    releaseDate: "2023-12-08",
  },
  {
    id: 134,
    version: "v2.2.4",
    features: ["Interactive Map", "Real-time Updates", "Spot Availability", "Enhanced Navigation"],
    components: ["interactive-map", "realtime-handler", "availability-tracker", "enhanced-navigation"],
    apiEndpoints: ["/api/auth", "/api/users", "/api/spots", "/api/realtime", "/api/navigation"],
    description: "Improved navigation with turn-by-turn directions",
    status: "stable",
    releaseDate: "2023-12-10",
  },
  {
    id: 135,
    version: "v2.3.0",
    features: ["User Profiles", "Favorites", "Spot History", "Notifications"],
    components: ["user-profile-enhanced", "favorites-manager", "history-tracker", "notifications"],
    apiEndpoints: ["/api/auth", "/api/users", "/api/spots", "/api/favorites", "/api/notifications"],
    description: "Enhanced user experience with profiles and favorites",
    status: "stable",
    releaseDate: "2023-12-15",
  },
  {
    id: 136,
    version: "v2.3.1",
    features: ["User Profiles", "Favorites", "Spot History", "Push Notifications"],
    components: ["user-profile-enhanced", "favorites-manager", "history-tracker", "push-notifications"],
    apiEndpoints: ["/api/auth", "/api/users", "/api/spots", "/api/favorites", "/api/notifications"],
    description: "Added push notification support",
    status: "stable",
    releaseDate: "2023-12-17",
  },
  {
    id: 137,
    version: "v2.3.2",
    features: ["User Profiles", "Favorites", "Spot History", "Smart Notifications"],
    components: ["user-profile-enhanced", "favorites-manager", "history-tracker", "smart-notifications"],
    apiEndpoints: ["/api/auth", "/api/users", "/api/spots", "/api/favorites", "/api/notifications"],
    description: "Intelligent notification system",
    status: "stable",
    releaseDate: "2023-12-20",
  },
  {
    id: 138,
    version: "v2.3.3",
    features: ["User Profiles", "Favorites", "Spot History", "Analytics"],
    components: ["user-profile-enhanced", "favorites-manager", "history-tracker", "analytics-basic"],
    apiEndpoints: ["/api/auth", "/api/users", "/api/spots", "/api/favorites", "/api/analytics"],
    description: "Basic usage analytics",
    status: "stable",
    releaseDate: "2023-12-22",
  },
  {
    id: 139,
    version: "v2.3.4",
    features: ["User Profiles", "Favorites", "Spot History", "Enhanced Analytics"],
    components: ["user-profile-enhanced", "favorites-manager", "history-tracker", "analytics-enhanced"],
    apiEndpoints: ["/api/auth", "/api/users", "/api/spots", "/api/favorites", "/api/analytics"],
    description: "Detailed analytics and insights",
    status: "stable",
    releaseDate: "2023-12-25",
  },

  // Version 140-149: AI Integration Phase
  {
    id: 140,
    version: "v2.4.0",
    features: ["AI Predictions", "Smart Recommendations", "Machine Learning"],
    components: ["ai-predictor", "recommendation-engine", "ml-processor"],
    apiEndpoints: ["/api/ai", "/api/predictions", "/api/recommendations"],
    description: "Major AI integration with predictive capabilities",
    status: "stable",
    releaseDate: "2024-01-01",
  },
  {
    id: 141,
    version: "v2.4.1",
    features: ["AI Predictions", "Smart Recommendations", "Improved ML Models"],
    components: ["ai-predictor", "recommendation-engine", "ml-processor-v2"],
    apiEndpoints: ["/api/ai", "/api/predictions", "/api/recommendations"],
    description: "Enhanced machine learning models",
    status: "stable",
    releaseDate: "2024-01-03",
  },
  {
    id: 142,
    version: "v2.4.2",
    features: ["AI Predictions", "Smart Recommendations", "Personalized Experience"],
    components: ["ai-predictor", "recommendation-engine", "personalization"],
    apiEndpoints: ["/api/ai", "/api/predictions", "/api/recommendations", "/api/personalization"],
    description: "Personalized user experience with AI",
    status: "stable",
    releaseDate: "2024-01-05",
  },
  {
    id: 143,
    version: "v2.4.3",
    features: ["AI Predictions", "Smart Recommendations", "Predictive Analytics"],
    components: ["ai-predictor", "recommendation-engine", "predictive-analytics"],
    apiEndpoints: ["/api/ai", "/api/predictions", "/api/recommendations", "/api/analytics"],
    description: "Advanced predictive analytics",
    status: "stable",
    releaseDate: "2024-01-08",
  },
  {
    id: 144,
    version: "v2.4.4",
    features: ["AI Predictions", "Smart Recommendations", "AI Assistant"],
    components: ["ai-predictor", "recommendation-engine", "ai-assistant"],
    apiEndpoints: ["/api/ai", "/api/predictions", "/api/recommendations", "/api/assistant"],
    description: "Interactive AI assistant for parking help",
    status: "stable",
    releaseDate: "2024-01-10",
  },
  {
    id: 145,
    version: "v2.5.0",
    features: ["Route Optimization", "Traffic Integration", "Dynamic Routing"],
    components: ["route-optimizer", "traffic-handler", "dynamic-router"],
    apiEndpoints: ["/api/navigation", "/api/traffic", "/api/routing"],
    description: "Advanced routing with traffic optimization",
    status: "stable",
    releaseDate: "2024-01-15",
  },
  {
    id: 146,
    version: "v2.5.1",
    features: ["Route Optimization", "Traffic Integration", "Multi-modal Transport"],
    components: ["route-optimizer", "traffic-handler", "transport-modes"],
    apiEndpoints: ["/api/navigation", "/api/traffic", "/api/routing", "/api/transport"],
    description: "Support for multiple transport modes",
    status: "stable",
    releaseDate: "2024-01-17",
  },
  {
    id: 147,
    version: "v2.5.2",
    features: ["Route Optimization", "Traffic Integration", "Real-time Traffic"],
    components: ["route-optimizer", "traffic-handler", "realtime-traffic"],
    apiEndpoints: ["/api/navigation", "/api/traffic", "/api/routing"],
    description: "Real-time traffic data integration",
    status: "stable",
    releaseDate: "2024-01-20",
  },
  {
    id: 148,
    version: "v2.5.3",
    features: ["Route Optimization", "Traffic Integration", "Smart ETA"],
    components: ["route-optimizer", "traffic-handler", "smart-eta"],
    apiEndpoints: ["/api/navigation", "/api/traffic", "/api/routing", "/api/eta"],
    description: "Intelligent ETA calculations",
    status: "stable",
    releaseDate: "2024-01-22",
  },
  {
    id: 149,
    version: "v2.5.4",
    features: ["Route Optimization", "Traffic Integration", "Alternative Routes"],
    components: ["route-optimizer", "traffic-handler", "alternative-routes"],
    apiEndpoints: ["/api/navigation", "/api/traffic", "/api/routing"],
    description: "Multiple route suggestions",
    status: "stable",
    releaseDate: "2024-01-25",
  },

  // Version 150-159: PWA and Mobile Phase
  {
    id: 150,
    version: "v2.6.0",
    features: ["PWA Support", "Offline Mode", "Service Workers"],
    components: ["pwa-provider", "offline-handler", "service-worker"],
    apiEndpoints: ["/api/pwa", "/api/offline", "/api/sync"],
    description: "Progressive Web App with offline capabilities",
    status: "stable",
    releaseDate: "2024-02-01",
  },
  {
    id: 151,
    version: "v2.6.1",
    features: ["PWA Support", "Offline Mode", "Background Sync"],
    components: ["pwa-provider", "offline-handler", "background-sync"],
    apiEndpoints: ["/api/pwa", "/api/offline", "/api/sync"],
    description: "Background synchronization for offline data",
    status: "stable",
    releaseDate: "2024-02-03",
  },
  {
    id: 152,
    version: "v2.6.2",
    features: ["PWA Support", "Offline Mode", "Push Notifications"],
    components: ["pwa-provider", "offline-handler", "push-notifications"],
    apiEndpoints: ["/api/pwa", "/api/offline", "/api/notifications"],
    description: "Enhanced push notification system",
    status: "stable",
    releaseDate: "2024-02-05",
  },
  {
    id: 153,
    version: "v2.6.3",
    features: ["PWA Support", "Offline Mode", "App Install Prompt"],
    components: ["pwa-provider", "offline-handler", "install-prompt"],
    apiEndpoints: ["/api/pwa", "/api/offline"],
    description: "Smart app installation prompts",
    status: "stable",
    releaseDate: "2024-02-08",
  },
  {
    id: 154,
    version: "v2.6.4",
    features: ["PWA Support", "Offline Mode", "Native Features"],
    components: ["pwa-provider", "offline-handler", "native-features"],
    apiEndpoints: ["/api/pwa", "/api/offline", "/api/native"],
    description: "Native device feature integration",
    status: "stable",
    releaseDate: "2024-02-10",
  },
  {
    id: 155,
    version: "v2.7.0",
    features: ["Voice Commands", "Speech Recognition", "Audio Feedback"],
    components: ["voice-handler", "speech-recognition", "audio-feedback"],
    apiEndpoints: ["/api/voice", "/api/speech", "/api/audio"],
    description: "Voice control and speech recognition",
    status: "beta",
    releaseDate: "2024-02-15",
  },
  {
    id: 156,
    version: "v2.7.1",
    features: ["Voice Commands", "Speech Recognition", "Natural Language"],
    components: ["voice-handler", "speech-recognition", "nlp-processor"],
    apiEndpoints: ["/api/voice", "/api/speech", "/api/nlp"],
    description: "Natural language processing for voice commands",
    status: "beta",
    releaseDate: "2024-02-17",
  },
  {
    id: 157,
    version: "v2.7.2",
    features: ["Voice Commands", "Speech Recognition", "AR Integration"],
    components: ["voice-handler", "speech-recognition", "ar-overlay"],
    apiEndpoints: ["/api/voice", "/api/speech", "/api/ar"],
    description: "Augmented reality parking assistance",
    status: "experimental",
    releaseDate: "2024-02-20",
  },
  {
    id: 158,
    version: "v2.7.3",
    features: ["Voice Commands", "Speech Recognition", "Enhanced AR"],
    components: ["voice-handler", "speech-recognition", "ar-enhanced"],
    apiEndpoints: ["/api/voice", "/api/speech", "/api/ar"],
    description: "Improved AR with better tracking",
    status: "beta",
    releaseDate: "2024-02-22",
  },
  {
    id: 159,
    version: "v2.7.4",
    features: ["Voice Commands", "Speech Recognition", "Smart Assistant"],
    components: ["voice-handler", "speech-recognition", "smart-assistant"],
    apiEndpoints: ["/api/voice", "/api/speech", "/api/assistant"],
    description: "Intelligent voice assistant",
    status: "beta",
    releaseDate: "2024-02-25",
  },

  // Version 160-169: Enterprise Features Phase
  {
    id: 160,
    version: "v2.8.0",
    features: ["Multi-city Support", "Payment Integration", "Booking System"],
    components: ["city-manager", "payment-processor", "booking-system"],
    apiEndpoints: ["/api/cities", "/api/payments", "/api/bookings"],
    description: "Enterprise features with multi-city and payments",
    status: "stable",
    releaseDate: "2024-03-01",
  },
  {
    id: 161,
    version: "v2.8.1",
    features: ["Multi-city Support", "Payment Integration", "Subscription Management"],
    components: ["city-manager", "payment-processor", "subscription-manager"],
    apiEndpoints: ["/api/cities", "/api/payments", "/api/subscriptions"],
    description: "Subscription-based premium features",
    status: "stable",
    releaseDate: "2024-03-03",
  },
  {
    id: 162,
    version: "v2.8.2",
    features: ["Multi-city Support", "Payment Integration", "Corporate Accounts"],
    components: ["city-manager", "payment-processor", "corporate-dashboard"],
    apiEndpoints: ["/api/cities", "/api/payments", "/api/corporate"],
    description: "Corporate account management",
    status: "stable",
    releaseDate: "2024-03-05",
  },
  {
    id: 163,
    version: "v2.8.3",
    features: ["Multi-city Support", "Payment Integration", "Fleet Management"],
    components: ["city-manager", "payment-processor", "fleet-manager"],
    apiEndpoints: ["/api/cities", "/api/payments", "/api/fleet"],
    description: "Fleet and business vehicle management",
    status: "stable",
    releaseDate: "2024-03-08",
  },
  {
    id: 164,
    version: "v2.8.4",
    features: ["Multi-city Support", "Payment Integration", "Advanced Analytics"],
    components: ["city-manager", "payment-processor", "advanced-analytics"],
    apiEndpoints: ["/api/cities", "/api/payments", "/api/analytics"],
    description: "Business intelligence and advanced analytics",
    status: "stable",
    releaseDate: "2024-03-10",
  },
  {
    id: 165,
    version: "v2.9.0",
    features: ["Machine Learning", "Predictive Analytics", "Dynamic Pricing"],
    components: ["ml-engine", "prediction-dashboard", "pricing-engine"],
    apiEndpoints: ["/api/ml", "/api/predictions", "/api/pricing"],
    description: "Advanced ML with dynamic pricing algorithms",
    status: "beta",
    releaseDate: "2024-03-15",
  },
  {
    id: 166,
    version: "v2.9.1",
    features: ["Machine Learning", "Predictive Analytics", "Demand Forecasting"],
    components: ["ml-engine", "prediction-dashboard", "demand-forecaster"],
    apiEndpoints: ["/api/ml", "/api/predictions", "/api/forecasting"],
    description: "Parking demand forecasting system",
    status: "beta",
    releaseDate: "2024-03-17",
  },
  {
    id: 167,
    version: "v2.9.2",
    features: ["Machine Learning", "Predictive Analytics", "Optimization Engine"],
    components: ["ml-engine", "prediction-dashboard", "optimization-engine"],
    apiEndpoints: ["/api/ml", "/api/predictions", "/api/optimization"],
    description: "City-wide parking optimization",
    status: "beta",
    releaseDate: "2024-03-20",
  },
  {
    id: 168,
    version: "v2.9.3",
    features: ["Machine Learning", "Predictive Analytics", "Smart City Integration"],
    components: ["ml-engine", "prediction-dashboard", "smart-city-connector"],
    apiEndpoints: ["/api/ml", "/api/predictions", "/api/smart-city"],
    description: "Integration with smart city infrastructure",
    status: "experimental",
    releaseDate: "2024-03-22",
  },
  {
    id: 169,
    version: "v2.9.4",
    features: ["Machine Learning", "Predictive Analytics", "IoT Integration"],
    components: ["ml-engine", "prediction-dashboard", "iot-connector"],
    apiEndpoints: ["/api/ml", "/api/predictions", "/api/iot"],
    description: "IoT sensor integration for real-time data",
    status: "beta",
    releaseDate: "2024-03-25",
  },

  // Version 170-175: Latest and Greatest
  {
    id: 170,
    version: "v3.0.0",
    features: ["Complete Platform", "Admin Dashboard", "Enterprise Suite"],
    components: ["admin-panel", "enterprise-dashboard", "platform-manager"],
    apiEndpoints: ["/api/admin", "/api/enterprise", "/api/platform"],
    description: "Complete enterprise platform solution",
    status: "stable",
    releaseDate: "2024-04-01",
  },
  {
    id: 171,
    version: "v3.0.1",
    features: ["Complete Platform", "Admin Dashboard", "Security Enhancements"],
    components: ["admin-panel", "enterprise-dashboard", "security-manager"],
    apiEndpoints: ["/api/admin", "/api/enterprise", "/api/security"],
    description: "Enhanced security and compliance features",
    status: "stable",
    releaseDate: "2024-04-03",
  },
  {
    id: 172,
    version: "v3.0.2",
    features: ["Complete Platform", "Admin Dashboard", "Performance Optimization"],
    components: ["admin-panel", "enterprise-dashboard", "performance-monitor"],
    apiEndpoints: ["/api/admin", "/api/enterprise", "/api/performance"],
    description: "Major performance improvements",
    status: "stable",
    releaseDate: "2024-04-05",
  },
  {
    id: 173,
    version: "v3.0.3",
    features: ["Complete Platform", "Admin Dashboard", "API Gateway"],
    components: ["admin-panel", "enterprise-dashboard", "api-gateway"],
    apiEndpoints: ["/api/admin", "/api/enterprise", "/api/gateway"],
    description: "Unified API gateway for all services",
    status: "stable",
    releaseDate: "2024-04-08",
  },
  {
    id: 174,
    version: "v3.0.4",
    features: ["Complete Platform", "Admin Dashboard", "Microservices"],
    components: ["admin-panel", "enterprise-dashboard", "microservices"],
    apiEndpoints: ["/api/admin", "/api/enterprise", "/api/microservices"],
    description: "Microservices architecture implementation",
    status: "stable",
    releaseDate: "2024-04-10",
  },
  {
    id: 175,
    version: "v3.1.0",
    features: ["Latest AI", "Grok Integration", "Next-Gen Features"],
    components: ["grok-ai", "next-gen-ui", "future-features"],
    apiEndpoints: ["/api/ai/grok-chat", "/api/next-gen", "/api/future"],
    description: "Cutting-edge AI with Grok integration and future tech",
    status: "stable",
    releaseDate: "2024-04-15",
  },
]

// No need for additional version generation since we have all versions defined
const allVersions = versionConfigs.sort((a, b) => a.id - b.id)

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
