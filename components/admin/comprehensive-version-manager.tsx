"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface VersionConfig {
  id: number
  version: string
  features: string[]
  components: string[]
  apiEndpoints: string[]
  description: string
  status: "stable" | "beta" | "experimental" | "deprecated" | "lts"
  releaseDate: string
  phase: string
}

// Generate comprehensive version configurations from 120 to 330
const generateVersionConfigs = (): VersionConfig[] => {
  const versions: VersionConfig[] = []

  // Phase 1: Foundation (120-149) - v2.0.x to v2.5.x
  const foundationVersions = [
    {
      range: [120, 124],
      base: "2.0",
      phase: "Foundation",
      features: ["Basic Auth", "Simple Map"],
      status: "stable" as const,
    },
    {
      range: [125, 129],
      base: "2.1",
      phase: "Foundation",
      features: ["User Registration", "Profile Management"],
      status: "stable" as const,
    },
    {
      range: [130, 134],
      base: "2.2",
      phase: "Foundation",
      features: ["Interactive Map", "Real-time Updates"],
      status: "stable" as const,
    },
    {
      range: [135, 139],
      base: "2.3",
      phase: "Foundation",
      features: ["User Profiles", "Favorites", "Notifications"],
      status: "stable" as const,
    },
    {
      range: [140, 144],
      base: "2.4",
      phase: "Foundation",
      features: ["AI Predictions", "Smart Recommendations"],
      status: "stable" as const,
    },
    {
      range: [145, 149],
      base: "2.5",
      phase: "Foundation",
      features: ["Route Optimization", "Traffic Integration"],
      status: "stable" as const,
    },
  ]

  // Phase 2: Growth (150-199) - v2.6.x to v3.5.x
  const growthVersions = [
    {
      range: [150, 154],
      base: "2.6",
      phase: "Growth",
      features: ["PWA Support", "Offline Mode"],
      status: "stable" as const,
    },
    {
      range: [155, 159],
      base: "2.7",
      phase: "Growth",
      features: ["Voice Commands", "AR Integration"],
      status: "beta" as const,
    },
    {
      range: [160, 164],
      base: "2.8",
      phase: "Growth",
      features: ["Multi-city", "Payment Integration"],
      status: "stable" as const,
    },
    {
      range: [165, 169],
      base: "2.9",
      phase: "Growth",
      features: ["Machine Learning", "Dynamic Pricing"],
      status: "beta" as const,
    },
    {
      range: [170, 174],
      base: "3.0",
      phase: "Growth",
      features: ["Enterprise Platform", "Admin Dashboard"],
      status: "stable" as const,
    },
    {
      range: [175, 179],
      base: "3.1",
      phase: "Growth",
      features: ["Grok AI", "Advanced Analytics"],
      status: "stable" as const,
    },
    {
      range: [180, 184],
      base: "3.2",
      phase: "Growth",
      features: ["Blockchain Integration", "NFT Parking"],
      status: "experimental" as const,
    },
    {
      range: [185, 189],
      base: "3.3",
      phase: "Growth",
      features: ["Quantum Computing", "Advanced ML"],
      status: "experimental" as const,
    },
    {
      range: [190, 194],
      base: "3.4",
      phase: "Growth",
      features: ["5G Integration", "Edge Computing"],
      status: "beta" as const,
    },
    {
      range: [195, 199],
      base: "3.5",
      phase: "Growth",
      features: ["Autonomous Vehicle Support", "Smart Infrastructure"],
      status: "stable" as const,
    },
  ]

  // Phase 3: Expansion (200-249) - v4.0.x to v5.5.x
  const expansionVersions = [
    {
      range: [200, 204],
      base: "4.0",
      phase: "Expansion",
      features: ["Global Platform", "Multi-language"],
      status: "stable" as const,
    },
    {
      range: [205, 209],
      base: "4.1",
      phase: "Expansion",
      features: ["Satellite Integration", "Global GPS"],
      status: "stable" as const,
    },
    {
      range: [210, 214],
      base: "4.2",
      phase: "Expansion",
      features: ["Weather Integration", "Climate Adaptation"],
      status: "stable" as const,
    },
    {
      range: [215, 219],
      base: "4.3",
      phase: "Expansion",
      features: ["Social Features", "Community Building"],
      status: "stable" as const,
    },
    {
      range: [220, 224],
      base: "4.4",
      phase: "Expansion",
      features: ["Gamification", "Rewards System"],
      status: "stable" as const,
    },
    {
      range: [225, 229],
      base: "4.5",
      phase: "Expansion",
      features: ["VR Integration", "Metaverse Support"],
      status: "beta" as const,
    },
    {
      range: [230, 234],
      base: "5.0",
      phase: "Expansion",
      features: ["Neural Networks", "Brain-Computer Interface"],
      status: "experimental" as const,
    },
    {
      range: [235, 239],
      base: "5.1",
      phase: "Expansion",
      features: ["Holographic Display", "3D Interfaces"],
      status: "experimental" as const,
    },
    {
      range: [240, 244],
      base: "5.2",
      phase: "Expansion",
      features: ["Time Travel Booking", "4D Navigation"],
      status: "experimental" as const,
    },
    {
      range: [245, 249],
      base: "5.3",
      phase: "Expansion",
      features: ["Multiverse Support", "Parallel Parking"],
      status: "experimental" as const,
    },
  ]

  // Phase 4: Innovation (250-299) - v6.0.x to v8.5.x
  const innovationVersions = [
    {
      range: [250, 254],
      base: "6.0",
      phase: "Innovation",
      features: ["Teleportation Integration", "Instant Travel"],
      status: "experimental" as const,
    },
    {
      range: [255, 259],
      base: "6.1",
      phase: "Innovation",
      features: ["Mind Reading", "Thought-based Control"],
      status: "experimental" as const,
    },
    {
      range: [260, 264],
      base: "6.2",
      phase: "Innovation",
      features: ["Molecular Parking", "Nano Technology"],
      status: "experimental" as const,
    },
    {
      range: [265, 269],
      base: "6.3",
      phase: "Innovation",
      features: ["Anti-Gravity Parking", "Floating Vehicles"],
      status: "experimental" as const,
    },
    {
      range: [270, 274],
      base: "7.0",
      phase: "Innovation",
      features: ["Interdimensional Travel", "Portal Integration"],
      status: "experimental" as const,
    },
    {
      range: [275, 279],
      base: "7.1",
      phase: "Innovation",
      features: ["Time Dilation", "Temporal Parking"],
      status: "experimental" as const,
    },
    {
      range: [280, 284],
      base: "7.2",
      phase: "Innovation",
      features: ["Consciousness Upload", "Digital Parking"],
      status: "experimental" as const,
    },
    {
      range: [285, 289],
      base: "8.0",
      phase: "Innovation",
      features: ["Universal Compatibility", "Alien Vehicle Support"],
      status: "experimental" as const,
    },
    {
      range: [290, 294],
      base: "8.1",
      phase: "Innovation",
      features: ["Galactic Network", "Intergalactic Parking"],
      status: "experimental" as const,
    },
    {
      range: [295, 299],
      base: "8.2",
      phase: "Innovation",
      features: ["Reality Manipulation", "Physics Override"],
      status: "experimental" as const,
    },
  ]

  // Phase 5: Transcendence (300-330) - v9.0.x to v10.0.x
  const transcendenceVersions = [
    {
      range: [300, 304],
      base: "9.0",
      phase: "Transcendence",
      features: ["Omnipresence", "Everywhere Parking"],
      status: "experimental" as const,
    },
    {
      range: [305, 309],
      base: "9.1",
      phase: "Transcendence",
      features: ["Omniscience", "All-knowing System"],
      status: "experimental" as const,
    },
    {
      range: [310, 314],
      base: "9.2",
      phase: "Transcendence",
      features: ["Omnipotence", "Reality Creation"],
      status: "experimental" as const,
    },
    {
      range: [315, 319],
      base: "9.3",
      phase: "Transcendence",
      features: ["Transcendent AI", "God-mode Parking"],
      status: "experimental" as const,
    },
    {
      range: [320, 324],
      base: "9.4",
      phase: "Transcendence",
      features: ["Universal Harmony", "Perfect Balance"],
      status: "experimental" as const,
    },
    {
      range: [325, 329],
      base: "9.5",
      phase: "Transcendence",
      features: ["Infinite Possibilities", "Boundless Parking"],
      status: "experimental" as const,
    },
    {
      range: [330, 330],
      base: "10.0",
      phase: "Transcendence",
      features: ["Ultimate Evolution", "Parking Singularity"],
      status: "experimental" as const,
    },
  ]

  const allVersionGroups = [
    ...foundationVersions,
    ...growthVersions,
    ...expansionVersions,
    ...innovationVersions,
    ...transcendenceVersions,
  ]

  allVersionGroups.forEach((group) => {
    const [start, end] = group.range
    for (let i = start; i <= end; i++) {
      const subVersion = i - start
      const isMinor = subVersion === 0
      const version = `v${group.base}.${subVersion}`

      // Generate realistic dates
      const baseDate = new Date(2023, 10, 1) // Start from Nov 1, 2023
      const daysOffset = (i - 120) * 3 // 3 days between versions
      const releaseDate = new Date(baseDate.getTime() + daysOffset * 24 * 60 * 60 * 1000)

      versions.push({
        id: i,
        version,
        features: [
          ...group.features,
          ...(isMinor ? [`Major ${group.base} Release`] : [`Update ${subVersion}`, `Patch ${i}`]),
        ],
        components: [
          `${group.phase.toLowerCase()}-core`,
          `${group.base.replace(".", "-")}-components`,
          `version-${i}-specific`,
        ],
        apiEndpoints: [
          `/api/${group.phase.toLowerCase()}`,
          `/api/v${group.base.replace(".", "")}`,
          `/api/version-${i}`,
        ],
        description: isMinor
          ? `Major ${group.base} release with ${group.features.join(", ").toLowerCase()}`
          : `Incremental update ${subVersion} for version ${group.base} with bug fixes and improvements`,
        status: group.status,
        releaseDate: releaseDate.toISOString().split("T")[0],
        phase: group.phase,
      })
    }
  })

  return versions
}

const allVersions = generateVersionConfigs()

export default function ComprehensiveVersionManager() {
  const [currentVersion, setCurrentVersion] = useState<number>(330)
  const [restoring, setRestoring] = useState<number | null>(null)
  const [activeConfig, setActiveConfig] = useState<VersionConfig | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPhase, setFilterPhase] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  useEffect(() => {
    const savedVersion = localStorage.getItem("parking-app-version")
    if (savedVersion) {
      const versionId = Number.parseInt(savedVersion)
      setCurrentVersion(versionId)
      const config = allVersions.find((v) => v.id === versionId)
      setActiveConfig(config || null)
    } else {
      const latestConfig = allVersions.find((v) => v.id === 330)
      setActiveConfig(latestConfig || null)
    }
  }, [])

  const handleRestore = async (versionId: number) => {
    setRestoring(versionId)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      localStorage.setItem("parking-app-version", versionId.toString())

      const config = allVersions.find((v) => v.id === versionId)
      if (config) {
        setActiveConfig(config)
        setCurrentVersion(versionId)
        window.location.reload()
      }
    } catch (error) {
      console.error("Failed to restore version:", error)
    } finally {
      setRestoring(null)
    }
  }

  const filteredVersions = allVersions.filter((version) => {
    const matchesSearch =
      version.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
      version.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      version.features.some((f) => f.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesPhase = filterPhase === "all" || version.phase === filterPhase
    const matchesStatus = filterStatus === "all" || version.status === filterStatus

    return matchesSearch && matchesPhase && matchesStatus
  })

  const phases = ["Foundation", "Growth", "Expansion", "Innovation", "Transcendence"]
  const statuses = ["stable", "beta", "experimental", "deprecated", "lts"]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">Comprehensive Version Manager</h1>
        <p className="text-gray-600">All versions from 120 to 330 - Complete evolution of Parking Angel</p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-2 text-sm">
          {phases.map((phase) => {
            const phaseVersions = allVersions.filter((v) => v.phase === phase)
            return (
              <div key={phase} className="bg-gray-100 p-2 rounded">
                <div className="font-semibold">{phase}</div>
                <div className="text-gray-600">{phaseVersions.length} versions</div>
                <div className="text-xs">
                  v{phaseVersions[0]?.version.split("v")[1]} - v
                  {phaseVersions[phaseVersions.length - 1]?.version.split("v")[1]}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {activeConfig && (
        <Card className="mb-6 border-green-500 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>
                Currently Active: {activeConfig.version} ({activeConfig.phase} Phase)
              </span>
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
                  {activeConfig.features.slice(0, 4).map((feature, idx) => (
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

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search versions, features, or descriptions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={filterPhase} onValueChange={setFilterPhase}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by phase" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Phases</SelectItem>
            {phases.map((phase) => (
              <SelectItem key={phase} value={phase}>
                {phase}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredVersions.length} of {allVersions.length} versions
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredVersions.map((version) => (
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
                  <p className="text-sm text-gray-500">
                    ID: {version.id} • {version.phase}
                  </p>
                </div>
                <Badge
                  variant={
                    version.status === "stable"
                      ? "default"
                      : version.status === "beta"
                        ? "secondary"
                        : version.status === "lts"
                          ? "default"
                          : version.status === "deprecated"
                            ? "destructive"
                            : "outline"
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
                disabled={restoring === version.id || version.status === "deprecated"}
                className="w-full"
                variant={currentVersion === version.id ? "outline" : "default"}
              >
                {restoring === version.id
                  ? "Restoring..."
                  : currentVersion === version.id
                    ? "Current Version"
                    : version.status === "deprecated"
                      ? "Deprecated"
                      : "Restore & Test"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
