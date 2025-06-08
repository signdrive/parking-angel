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
  description: string
  status: "stable" | "beta" | "experimental" | "deprecated" | "lts"
  releaseDate: string
  phase: string
  buildable: boolean
}

// Generate all versions from 120 to 330
const generateAllVersions = (): VersionConfig[] => {
  const versions: VersionConfig[] = []

  // Define version ranges and their characteristics
  const versionRanges = [
    // Foundation Phase (120-149)
    {
      start: 120,
      end: 129,
      base: "2.0",
      phase: "Foundation",
      status: "stable",
      features: ["Basic Auth", "Simple Map", "User Registration"],
      buildable: true,
    },
    {
      start: 130,
      end: 139,
      base: "2.1",
      phase: "Foundation",
      status: "stable",
      features: ["Interactive Map", "Real-time Updates", "User Profiles"],
      buildable: true,
    },
    {
      start: 140,
      end: 149,
      base: "2.2",
      phase: "Foundation",
      status: "stable",
      features: ["AI Predictions", "Smart Recommendations", "Route Optimization"],
      buildable: true,
    },

    // Growth Phase (150-199)
    {
      start: 150,
      end: 159,
      base: "2.3",
      phase: "Growth",
      status: "stable",
      features: ["PWA Support", "Offline Mode", "Voice Commands"],
      buildable: true,
    },
    {
      start: 160,
      end: 169,
      base: "2.4",
      phase: "Growth",
      status: "stable",
      features: ["Multi-city", "Payment Integration", "Machine Learning"],
      buildable: true,
    },
    {
      start: 170,
      end: 179,
      base: "2.5",
      phase: "Growth",
      status: "stable",
      features: ["Enterprise Platform", "Admin Dashboard", "Grok AI"],
      buildable: true,
    },
    {
      start: 180,
      end: 189,
      base: "2.6",
      phase: "Growth",
      status: "beta",
      features: ["Blockchain Integration", "NFT Parking", "Quantum Computing"],
      buildable: true,
    },
    {
      start: 190,
      end: 199,
      base: "2.7",
      phase: "Growth",
      status: "stable",
      features: ["5G Integration", "Edge Computing", "Autonomous Vehicles"],
      buildable: true,
    },

    // Expansion Phase (200-249)
    {
      start: 200,
      end: 209,
      base: "3.0",
      phase: "Expansion",
      status: "stable",
      features: ["Global Platform", "Multi-language", "Satellite Integration"],
      buildable: true,
    },
    {
      start: 210,
      end: 219,
      base: "3.1",
      phase: "Expansion",
      status: "stable",
      features: ["Weather Integration", "Climate Adaptation", "Social Features"],
      buildable: true,
    },
    {
      start: 220,
      end: 229,
      base: "3.2",
      phase: "Expansion",
      status: "stable",
      features: ["Gamification", "Rewards System", "VR Integration"],
      buildable: true,
    },
    {
      start: 230,
      end: 239,
      base: "3.3",
      phase: "Expansion",
      status: "beta",
      features: ["Neural Networks", "Brain-Computer Interface", "Holographic Display"],
      buildable: true,
    },
    {
      start: 240,
      end: 249,
      base: "3.4",
      phase: "Expansion",
      status: "experimental",
      features: ["Time Travel Booking", "4D Navigation", "Multiverse Support"],
      buildable: false,
    },

    // Innovation Phase (250-299)
    {
      start: 250,
      end: 259,
      base: "4.0",
      phase: "Innovation",
      status: "experimental",
      features: ["Teleportation Integration", "Instant Travel", "Mind Reading"],
      buildable: false,
    },
    {
      start: 260,
      end: 269,
      base: "4.1",
      phase: "Innovation",
      status: "experimental",
      features: ["Molecular Parking", "Nano Technology", "Anti-Gravity"],
      buildable: false,
    },
    {
      start: 270,
      end: 279,
      base: "4.2",
      phase: "Innovation",
      status: "experimental",
      features: ["Interdimensional Travel", "Portal Integration", "Time Dilation"],
      buildable: false,
    },
    {
      start: 280,
      end: 289,
      base: "4.3",
      phase: "Innovation",
      status: "experimental",
      features: ["Consciousness Upload", "Digital Parking", "Universal Compatibility"],
      buildable: false,
    },
    {
      start: 290,
      end: 299,
      base: "4.4",
      phase: "Innovation",
      status: "experimental",
      features: ["Galactic Network", "Intergalactic Parking", "Reality Manipulation"],
      buildable: false,
    },

    // Transcendence Phase (300-330)
    {
      start: 300,
      end: 309,
      base: "5.0",
      phase: "Transcendence",
      status: "experimental",
      features: ["Omnipresence", "Everywhere Parking", "Omniscience"],
      buildable: false,
    },
    {
      start: 310,
      end: 319,
      base: "5.1",
      phase: "Transcendence",
      status: "experimental",
      features: ["Omnipotence", "Reality Creation", "Transcendent AI"],
      buildable: false,
    },
    {
      start: 320,
      end: 330,
      base: "5.2",
      phase: "Transcendence",
      status: "experimental",
      features: ["Universal Harmony", "Perfect Balance", "Parking Singularity"],
      buildable: false,
    },
  ]

  versionRanges.forEach((range) => {
    for (let i = range.start; i <= range.end; i++) {
      const subVersion = i - range.start
      const version = `v${range.base}.${subVersion}`

      // Generate realistic dates
      const baseDate = new Date(2023, 10, 1)
      const daysOffset = (i - 120) * 2
      const releaseDate = new Date(baseDate.getTime() + daysOffset * 24 * 60 * 60 * 1000)

      versions.push({
        id: i,
        version,
        features: range.features,
        description:
          subVersion === 0
            ? `Major ${range.base} release with ${range.features.slice(0, 2).join(", ").toLowerCase()}`
            : `Update ${subVersion} for version ${range.base} with improvements and bug fixes`,
        status: range.status as any,
        releaseDate: releaseDate.toISOString().split("T")[0],
        phase: range.phase,
        buildable: range.buildable,
      })
    }
  })

  return versions
}

const allVersions = generateAllVersions()

export default function FunctionalVersionManager() {
  const [currentVersion, setCurrentVersion] = useState<number>(175)
  const [restoring, setRestoring] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPhase, setFilterPhase] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [showBuildableOnly, setShowBuildableOnly] = useState(false)

  useEffect(() => {
    const savedVersion = localStorage.getItem("parking-app-version")
    if (savedVersion) {
      setCurrentVersion(Number.parseInt(savedVersion))
    }
  }, [])

  const handleRestore = async (versionId: number) => {
    setRestoring(versionId)

    try {
      // Simulate version restoration
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Save to localStorage
      localStorage.setItem("parking-app-version", versionId.toString())
      setCurrentVersion(versionId)

      // Reload the page to apply version changes
      window.location.reload()
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
    const matchesBuildable = !showBuildableOnly || version.buildable

    return matchesSearch && matchesPhase && matchesStatus && matchesBuildable
  })

  const currentVersionConfig = allVersions.find((v) => v.id === currentVersion)
  const phases = ["Foundation", "Growth", "Expansion", "Innovation", "Transcendence"]
  const statuses = ["stable", "beta", "experimental", "deprecated", "lts"]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">Version Manager (120-330)</h1>
        <p className="text-gray-600">Test and restore any version from 120 to 330 - Find the best starting point</p>

        {currentVersionConfig && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800">
              Currently Running: {currentVersionConfig.version} (ID: {currentVersionConfig.id})
            </h3>
            <p className="text-green-700">{currentVersionConfig.description}</p>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="bg-green-100">
                {currentVersionConfig.status}
              </Badge>
              <Badge variant="outline" className="bg-blue-100">
                {currentVersionConfig.phase}
              </Badge>
              {currentVersionConfig.buildable && (
                <Badge variant="outline" className="bg-purple-100">
                  Buildable
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input placeholder="Search versions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <Select value={filterPhase} onValueChange={setFilterPhase}>
          <SelectTrigger>
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
          <SelectTrigger>
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
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="buildable"
            checked={showBuildableOnly}
            onChange={(e) => setShowBuildableOnly(e.target.checked)}
          />
          <label htmlFor="buildable" className="text-sm">
            Buildable only
          </label>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredVersions.length} of {allVersions.length} versions
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredVersions.map((version) => (
          <Card
            key={version.id}
            className={`transition-all ${
              currentVersion === version.id ? "border-green-500 bg-green-50 shadow-lg" : "hover:shadow-md"
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{version.version}</CardTitle>
                  <p className="text-sm text-gray-500">ID: {version.id}</p>
                </div>
                <div className="flex flex-col gap-1">
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
                  {version.buildable && (
                    <Badge variant="outline" className="text-xs bg-purple-50">
                      Buildable
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 mb-3">{version.description}</p>
              <div className="text-xs text-gray-500 mb-3">
                {version.phase} • {version.releaseDate}
              </div>
              <div className="mb-4">
                <p className="text-xs font-semibold mb-1">Features:</p>
                <div className="flex flex-wrap gap-1">
                  {version.features.slice(0, 2).map((feature, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {version.features.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{version.features.length - 2}
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
