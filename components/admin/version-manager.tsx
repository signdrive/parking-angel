"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  GitBranch,
  Download,
  Search,
  Calendar,
  User,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  Zap,
  Bug,
  Plus,
  Settings,
} from "lucide-react"

interface Version {
  id: number
  version: string
  date: string
  author: string
  type: "major" | "minor" | "patch" | "hotfix"
  status: "stable" | "beta" | "experimental" | "deprecated"
  changes: string[]
  features: string[]
  bugfixes: string[]
  breaking: boolean
  size: string
  performance: "improved" | "neutral" | "degraded"
  rating: number
  downloads: number
}

const versions: Version[] = [
  {
    id: 175,
    version: "v2.8.5",
    date: "2024-01-08",
    author: "AI Assistant",
    type: "minor",
    status: "stable",
    changes: ["Enhanced AI prediction accuracy", "Improved mobile responsiveness", "Added voice commands"],
    features: ["Advanced AI spot prediction", "Voice-activated search", "Smart notifications"],
    bugfixes: ["Fixed map rendering issues", "Resolved authentication bugs"],
    breaking: false,
    size: "2.4 MB",
    performance: "improved",
    rating: 4.9,
    downloads: 1250,
  },
  {
    id: 174,
    version: "v2.8.4",
    date: "2024-01-07",
    author: "System",
    type: "patch",
    status: "stable",
    changes: ["Security patches", "Performance optimizations", "Bug fixes"],
    features: ["Enhanced security", "Faster load times"],
    bugfixes: ["Fixed memory leaks", "Resolved API timeout issues"],
    breaking: false,
    size: "2.3 MB",
    performance: "improved",
    rating: 4.7,
    downloads: 980,
  },
  {
    id: 173,
    version: "v2.8.3",
    date: "2024-01-06",
    author: "Development Team",
    type: "minor",
    status: "stable",
    changes: ["New navigation system", "Enhanced map features", "Improved UI/UX"],
    features: ["Turn-by-turn navigation", "3D map view", "Dark mode improvements"],
    bugfixes: ["Fixed GPS accuracy", "Resolved notification issues"],
    breaking: false,
    size: "2.5 MB",
    performance: "improved",
    rating: 4.8,
    downloads: 1100,
  },
  {
    id: 172,
    version: "v2.8.2",
    date: "2024-01-05",
    author: "AI Assistant",
    type: "patch",
    status: "stable",
    changes: ["Database optimizations", "API improvements", "Minor UI fixes"],
    features: ["Faster database queries", "Improved API response times"],
    bugfixes: ["Fixed database connection issues", "Resolved caching problems"],
    breaking: false,
    size: "2.2 MB",
    performance: "improved",
    rating: 4.6,
    downloads: 850,
  },
  {
    id: 171,
    version: "v2.8.1",
    date: "2024-01-04",
    author: "System",
    type: "hotfix",
    status: "stable",
    changes: ["Critical security fix", "Emergency patch"],
    features: ["Enhanced security protocols"],
    bugfixes: ["Fixed critical security vulnerability", "Resolved authentication bypass"],
    breaking: false,
    size: "2.1 MB",
    performance: "neutral",
    rating: 4.5,
    downloads: 750,
  },
  {
    id: 170,
    version: "v2.8.0",
    date: "2024-01-03",
    author: "Development Team",
    type: "major",
    status: "stable",
    changes: ["Major UI overhaul", "New AI features", "Enhanced performance"],
    features: ["Redesigned interface", "AI-powered recommendations", "Real-time analytics"],
    bugfixes: ["Fixed major rendering issues", "Resolved performance bottlenecks"],
    breaking: true,
    size: "2.8 MB",
    performance: "improved",
    rating: 4.9,
    downloads: 1500,
  },
  {
    id: 169,
    version: "v2.7.9",
    date: "2024-01-02",
    author: "AI Assistant",
    type: "minor",
    status: "stable",
    changes: ["PWA improvements", "Offline functionality", "Enhanced caching"],
    features: ["Better offline support", "Improved PWA experience", "Smart caching"],
    bugfixes: ["Fixed offline sync issues", "Resolved PWA installation problems"],
    breaking: false,
    size: "2.6 MB",
    performance: "improved",
    rating: 4.7,
    downloads: 920,
  },
  {
    id: 168,
    version: "v2.7.8",
    date: "2024-01-01",
    author: "System",
    type: "patch",
    status: "stable",
    changes: ["New Year optimizations", "Performance tweaks", "Bug fixes"],
    features: ["Optimized algorithms", "Improved user experience"],
    bugfixes: ["Fixed year transition bugs", "Resolved calendar issues"],
    breaking: false,
    size: "2.4 MB",
    performance: "improved",
    rating: 4.6,
    downloads: 800,
  },
  {
    id: 167,
    version: "v2.7.7",
    date: "2023-12-31",
    author: "Development Team",
    type: "minor",
    status: "stable",
    changes: ["Enhanced notifications", "Improved analytics", "UI refinements"],
    features: ["Smart notifications", "Advanced analytics dashboard", "Refined UI elements"],
    bugfixes: ["Fixed notification delivery", "Resolved analytics tracking"],
    breaking: false,
    size: "2.5 MB",
    performance: "improved",
    rating: 4.8,
    downloads: 1050,
  },
  {
    id: 166,
    version: "v2.7.6",
    date: "2023-12-30",
    author: "AI Assistant",
    type: "patch",
    status: "stable",
    changes: ["Firebase integration fixes", "Authentication improvements"],
    features: ["Better Firebase integration", "Enhanced auth flow"],
    bugfixes: ["Fixed Firebase connection issues", "Resolved auth token problems"],
    breaking: false,
    size: "2.3 MB",
    performance: "neutral",
    rating: 4.5,
    downloads: 720,
  },
  {
    id: 165,
    version: "v2.7.5",
    date: "2023-12-29",
    author: "System",
    type: "minor",
    status: "stable",
    changes: ["Map enhancements", "Location accuracy improvements", "UI updates"],
    features: ["Enhanced map rendering", "Better location tracking", "Updated UI components"],
    bugfixes: ["Fixed map loading issues", "Resolved GPS accuracy problems"],
    breaking: false,
    size: "2.4 MB",
    performance: "improved",
    rating: 4.7,
    downloads: 890,
  },
  {
    id: 164,
    version: "v2.7.4",
    date: "2023-12-28",
    author: "Development Team",
    type: "patch",
    status: "stable",
    changes: ["Database schema updates", "API optimizations", "Security patches"],
    features: ["Improved database performance", "Optimized API endpoints"],
    bugfixes: ["Fixed database migration issues", "Resolved API rate limiting"],
    breaking: false,
    size: "2.2 MB",
    performance: "improved",
    rating: 4.6,
    downloads: 760,
  },
  {
    id: 163,
    version: "v2.7.3",
    date: "2023-12-27",
    author: "AI Assistant",
    type: "minor",
    status: "stable",
    changes: ["AI assistant improvements", "Chat functionality", "Voice recognition"],
    features: ["Enhanced AI chat", "Voice commands", "Smart suggestions"],
    bugfixes: ["Fixed AI response delays", "Resolved voice recognition issues"],
    breaking: false,
    size: "2.6 MB",
    performance: "improved",
    rating: 4.8,
    downloads: 1020,
  },
  {
    id: 162,
    version: "v2.7.2",
    date: "2023-12-26",
    author: "System",
    type: "patch",
    status: "stable",
    changes: ["Holiday optimizations", "Performance improvements", "Bug fixes"],
    features: ["Optimized for high traffic", "Improved stability"],
    bugfixes: ["Fixed holiday-specific bugs", "Resolved server overload issues"],
    breaking: false,
    size: "2.3 MB",
    performance: "improved",
    rating: 4.5,
    downloads: 680,
  },
  {
    id: 161,
    version: "v2.7.1",
    date: "2023-12-25",
    author: "Development Team",
    type: "hotfix",
    status: "stable",
    changes: ["Christmas Day hotfix", "Critical bug fixes"],
    features: ["Emergency stability improvements"],
    bugfixes: ["Fixed critical Christmas Day bugs", "Resolved server crashes"],
    breaking: false,
    size: "2.1 MB",
    performance: "neutral",
    rating: 4.4,
    downloads: 620,
  },
  {
    id: 160,
    version: "v2.7.0",
    date: "2023-12-24",
    author: "AI Assistant",
    type: "major",
    status: "stable",
    changes: ["Christmas release", "Major feature additions", "UI overhaul"],
    features: ["Holiday themes", "Enhanced user experience", "New dashboard"],
    bugfixes: ["Fixed major UI bugs", "Resolved performance issues"],
    breaking: true,
    size: "2.9 MB",
    performance: "improved",
    rating: 4.9,
    downloads: 1400,
  },
  {
    id: 159,
    version: "v2.6.9",
    date: "2023-12-23",
    author: "System",
    type: "minor",
    status: "stable",
    changes: ["Pre-holiday preparations", "Scalability improvements", "Bug fixes"],
    features: ["Enhanced scalability", "Better error handling"],
    bugfixes: ["Fixed scalability issues", "Resolved error handling problems"],
    breaking: false,
    size: "2.5 MB",
    performance: "improved",
    rating: 4.7,
    downloads: 940,
  },
  {
    id: 158,
    version: "v2.6.8",
    date: "2023-12-22",
    author: "Development Team",
    type: "patch",
    status: "stable",
    changes: ["Security enhancements", "Performance optimizations", "Minor fixes"],
    features: ["Enhanced security measures", "Optimized performance"],
    bugfixes: ["Fixed security vulnerabilities", "Resolved performance bottlenecks"],
    breaking: false,
    size: "2.4 MB",
    performance: "improved",
    rating: 4.6,
    downloads: 820,
  },
  {
    id: 157,
    version: "v2.6.7",
    date: "2023-12-21",
    author: "AI Assistant",
    type: "minor",
    status: "stable",
    changes: ["Winter solstice update", "Enhanced features", "UI improvements"],
    features: ["Seasonal optimizations", "Enhanced user interface"],
    bugfixes: ["Fixed seasonal bugs", "Resolved UI inconsistencies"],
    breaking: false,
    size: "2.6 MB",
    performance: "improved",
    rating: 4.8,
    downloads: 1080,
  },
  {
    id: 156,
    version: "v2.6.6",
    date: "2023-12-20",
    author: "System",
    type: "patch",
    status: "stable",
    changes: ["Stability improvements", "Bug fixes", "Performance tweaks"],
    features: ["Improved stability", "Better performance"],
    bugfixes: ["Fixed stability issues", "Resolved performance problems"],
    breaking: false,
    size: "2.3 MB",
    performance: "improved",
    rating: 4.5,
    downloads: 740,
  },
  {
    id: 155,
    version: "v2.6.5",
    date: "2023-12-19",
    author: "Development Team",
    type: "minor",
    status: "stable",
    changes: ["Enhanced analytics", "Improved reporting", "New features"],
    features: ["Advanced analytics", "Comprehensive reporting", "New dashboard widgets"],
    bugfixes: ["Fixed analytics bugs", "Resolved reporting issues"],
    breaking: false,
    size: "2.7 MB",
    performance: "improved",
    rating: 4.7,
    downloads: 960,
  },
  {
    id: 154,
    version: "v2.6.4",
    date: "2023-12-18",
    author: "AI Assistant",
    type: "patch",
    status: "stable",
    changes: ["AI improvements", "Machine learning updates", "Bug fixes"],
    features: ["Enhanced AI capabilities", "Better ML algorithms"],
    bugfixes: ["Fixed AI prediction errors", "Resolved ML training issues"],
    breaking: false,
    size: "2.5 MB",
    performance: "improved",
    rating: 4.6,
    downloads: 860,
  },
  {
    id: 153,
    version: "v2.6.3",
    date: "2023-12-17",
    author: "System",
    type: "minor",
    status: "stable",
    changes: ["Database optimizations", "API improvements", "Security updates"],
    features: ["Optimized database queries", "Enhanced API performance"],
    bugfixes: ["Fixed database performance issues", "Resolved API timeout problems"],
    breaking: false,
    size: "2.4 MB",
    performance: "improved",
    rating: 4.8,
    downloads: 1120,
  },
  {
    id: 152,
    version: "v2.6.2",
    date: "2023-12-16",
    author: "Development Team",
    type: "patch",
    status: "stable",
    changes: ["Mobile optimizations", "Responsive design fixes", "UI updates"],
    features: ["Better mobile experience", "Improved responsive design"],
    bugfixes: ["Fixed mobile rendering issues", "Resolved responsive design problems"],
    breaking: false,
    size: "2.3 MB",
    performance: "improved",
    rating: 4.5,
    downloads: 780,
  },
  {
    id: 151,
    version: "v2.6.1",
    date: "2023-12-15",
    author: "AI Assistant",
    type: "hotfix",
    status: "stable",
    changes: ["Critical bug fix", "Emergency patch"],
    features: ["Stability improvements"],
    bugfixes: ["Fixed critical system bug", "Resolved emergency issues"],
    breaking: false,
    size: "2.2 MB",
    performance: "neutral",
    rating: 4.4,
    downloads: 650,
  },
  {
    id: 150,
    version: "v2.6.0",
    date: "2023-12-14",
    author: "System",
    type: "major",
    status: "stable",
    changes: ["Major milestone release", "Comprehensive updates", "New architecture"],
    features: ["Redesigned architecture", "Enhanced performance", "New features"],
    bugfixes: ["Fixed architectural issues", "Resolved legacy problems"],
    breaking: true,
    size: "3.0 MB",
    performance: "improved",
    rating: 4.9,
    downloads: 1600,
  },
  {
    id: 149,
    version: "v2.5.9",
    date: "2023-12-13",
    author: "Development Team",
    type: "minor",
    status: "stable",
    changes: ["Pre-major release preparations", "Feature completions", "Bug fixes"],
    features: ["Completed feature set", "Enhanced stability"],
    bugfixes: ["Fixed pre-release bugs", "Resolved compatibility issues"],
    breaking: false,
    size: "2.8 MB",
    performance: "improved",
    rating: 4.7,
    downloads: 980,
  },
  {
    id: 148,
    version: "v2.5.8",
    date: "2023-12-12",
    author: "AI Assistant",
    type: "patch",
    status: "stable",
    changes: ["Performance optimizations", "Memory improvements", "Bug fixes"],
    features: ["Optimized performance", "Better memory management"],
    bugfixes: ["Fixed memory leaks", "Resolved performance bottlenecks"],
    breaking: false,
    size: "2.6 MB",
    performance: "improved",
    rating: 4.6,
    downloads: 840,
  },
  {
    id: 147,
    version: "v2.5.7",
    date: "2023-12-11",
    author: "System",
    type: "minor",
    status: "stable",
    changes: ["Enhanced user experience", "UI improvements", "New features"],
    features: ["Improved UX", "Enhanced UI components", "New user features"],
    bugfixes: ["Fixed UX issues", "Resolved UI bugs"],
    breaking: false,
    size: "2.7 MB",
    performance: "improved",
    rating: 4.8,
    downloads: 1140,
  },
  {
    id: 146,
    version: "v2.5.6",
    date: "2023-12-10",
    author: "Development Team",
    type: "patch",
    status: "stable",
    changes: ["Security patches", "Vulnerability fixes", "Stability improvements"],
    features: ["Enhanced security", "Improved stability"],
    bugfixes: ["Fixed security vulnerabilities", "Resolved stability issues"],
    breaking: false,
    size: "2.5 MB",
    performance: "neutral",
    rating: 4.5,
    downloads: 720,
  },
  {
    id: 145,
    version: "v2.5.5",
    date: "2023-12-09",
    author: "AI Assistant",
    type: "minor",
    status: "stable",
    changes: ["AI enhancements", "Smart features", "Performance improvements"],
    features: ["Enhanced AI capabilities", "Smart recommendations", "Better performance"],
    bugfixes: ["Fixed AI bugs", "Resolved smart feature issues"],
    breaking: false,
    size: "2.8 MB",
    performance: "improved",
    rating: 4.7,
    downloads: 1020,
  },
  {
    id: 144,
    version: "v2.5.4",
    date: "2023-12-08",
    author: "System",
    type: "patch",
    status: "stable",
    changes: ["Bug fixes", "Minor improvements", "Stability updates"],
    features: ["Improved stability", "Minor enhancements"],
    bugfixes: ["Fixed various bugs", "Resolved stability issues"],
    breaking: false,
    size: "2.4 MB",
    performance: "neutral",
    rating: 4.4,
    downloads: 680,
  },
  {
    id: 143,
    version: "v2.5.3",
    date: "2023-12-07",
    author: "Development Team",
    type: "minor",
    status: "stable",
    changes: ["Feature enhancements", "UI updates", "Performance optimizations"],
    features: ["Enhanced features", "Updated UI", "Optimized performance"],
    bugfixes: ["Fixed feature bugs", "Resolved UI issues"],
    breaking: false,
    size: "2.6 MB",
    performance: "improved",
    rating: 4.6,
    downloads: 900,
  },
  {
    id: 142,
    version: "v2.5.2",
    date: "2023-12-06",
    author: "AI Assistant",
    type: "patch",
    status: "stable",
    changes: ["API improvements", "Integration fixes", "Bug fixes"],
    features: ["Improved API performance", "Better integrations"],
    bugfixes: ["Fixed API issues", "Resolved integration problems"],
    breaking: false,
    size: "2.3 MB",
    performance: "improved",
    rating: 4.5,
    downloads: 760,
  },
  {
    id: 141,
    version: "v2.5.1",
    date: "2023-12-05",
    author: "System",
    type: "hotfix",
    status: "stable",
    changes: ["Critical fix", "Emergency update"],
    features: ["Emergency stability"],
    bugfixes: ["Fixed critical bug", "Resolved emergency issue"],
    breaking: false,
    size: "2.2 MB",
    performance: "neutral",
    rating: 4.3,
    downloads: 580,
  },
  {
    id: 140,
    version: "v2.5.0",
    date: "2023-12-04",
    author: "Development Team",
    type: "major",
    status: "stable",
    changes: ["Major feature release", "Significant updates", "Architecture improvements"],
    features: ["New major features", "Enhanced architecture", "Improved performance"],
    bugfixes: ["Fixed major issues", "Resolved architectural problems"],
    breaking: true,
    size: "3.1 MB",
    performance: "improved",
    rating: 4.8,
    downloads: 1500,
  },
  {
    id: 139,
    version: "v2.4.9",
    date: "2023-12-03",
    author: "AI Assistant",
    type: "minor",
    status: "stable",
    changes: ["Final 2.4.x release", "Comprehensive updates", "Bug fixes"],
    features: ["Complete feature set", "Enhanced stability"],
    bugfixes: ["Fixed remaining bugs", "Resolved outstanding issues"],
    breaking: false,
    size: "2.9 MB",
    performance: "improved",
    rating: 4.7,
    downloads: 1080,
  },
  {
    id: 138,
    version: "v2.4.8",
    date: "2023-12-02",
    author: "System",
    type: "patch",
    status: "stable",
    changes: ["Stability improvements", "Performance tweaks", "Bug fixes"],
    features: ["Enhanced stability", "Better performance"],
    bugfixes: ["Fixed stability issues", "Resolved performance problems"],
    breaking: false,
    size: "2.7 MB",
    performance: "improved",
    rating: 4.6,
    downloads: 920,
  },
  {
    id: 137,
    version: "v2.4.7",
    date: "2023-12-01",
    author: "Development Team",
    type: "minor",
    status: "stable",
    changes: ["December updates", "Feature enhancements", "UI improvements"],
    features: ["Enhanced features", "Improved UI", "Better UX"],
    bugfixes: ["Fixed feature bugs", "Resolved UI issues"],
    breaking: false,
    size: "2.8 MB",
    performance: "improved",
    rating: 4.8,
    downloads: 1200,
  },
  {
    id: 136,
    version: "v2.4.6",
    date: "2023-11-30",
    author: "AI Assistant",
    type: "patch",
    status: "stable",
    changes: ["Month-end fixes", "Performance optimizations", "Bug fixes"],
    features: ["Optimized performance", "Enhanced stability"],
    bugfixes: ["Fixed month-end bugs", "Resolved performance issues"],
    breaking: false,
    size: "2.6 MB",
    performance: "improved",
    rating: 4.5,
    downloads: 800,
  },
  {
    id: 135,
    version: "v2.4.5",
    date: "2023-11-29",
    author: "System",
    type: "minor",
    status: "stable",
    changes: ["Thanksgiving optimizations", "Feature updates", "Bug fixes"],
    features: ["Holiday optimizations", "Updated features"],
    bugfixes: ["Fixed holiday bugs", "Resolved feature issues"],
    breaking: false,
    size: "2.7 MB",
    performance: "improved",
    rating: 4.7,
    downloads: 1040,
  },
  {
    id: 134,
    version: "v2.4.4",
    date: "2023-11-28",
    author: "Development Team",
    type: "patch",
    status: "stable",
    changes: ["Pre-holiday fixes", "Stability improvements", "Minor updates"],
    features: ["Improved stability", "Minor enhancements"],
    bugfixes: ["Fixed pre-holiday bugs", "Resolved stability issues"],
    breaking: false,
    size: "2.5 MB",
    performance: "neutral",
    rating: 4.4,
    downloads: 720,
  },
  {
    id: 133,
    version: "v2.4.3",
    date: "2023-11-27",
    author: "AI Assistant",
    type: "minor",
    status: "stable",
    changes: ["AI improvements", "Smart features", "Performance enhancements"],
    features: ["Enhanced AI", "Smart recommendations", "Better performance"],
    bugfixes: ["Fixed AI bugs", "Resolved smart feature issues"],
    breaking: false,
    size: "2.8 MB",
    performance: "improved",
    rating: 4.6,
    downloads: 960,
  },
  {
    id: 132,
    version: "v2.4.2",
    date: "2023-11-26",
    author: "System",
    type: "patch",
    status: "stable",
    changes: ["Bug fixes", "Security updates", "Minor improvements"],
    features: ["Enhanced security", "Minor improvements"],
    bugfixes: ["Fixed security issues", "Resolved various bugs"],
    breaking: false,
    size: "2.4 MB",
    performance: "neutral",
    rating: 4.3,
    downloads: 640,
  },
  {
    id: 131,
    version: "v2.4.1",
    date: "2023-11-25",
    author: "Development Team",
    type: "hotfix",
    status: "stable",
    changes: ["Critical bug fix", "Emergency patch"],
    features: ["Emergency stability"],
    bugfixes: ["Fixed critical system bug", "Resolved emergency issues"],
    breaking: false,
    size: "2.3 MB",
    performance: "neutral",
    rating: 4.2,
    downloads: 560,
  },
  {
    id: 130,
    version: "v2.4.0",
    date: "2023-11-24",
    author: "AI Assistant",
    type: "major",
    status: "stable",
    changes: ["Major release", "Significant feature additions", "Architecture updates"],
    features: ["New major features", "Updated architecture", "Enhanced performance"],
    bugfixes: ["Fixed major architectural issues", "Resolved legacy problems"],
    breaking: true,
    size: "3.2 MB",
    performance: "improved",
    rating: 4.9,
    downloads: 1800,
  },
]

export default function VersionManager() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("version")
  const [currentVersion, setCurrentVersion] = useState<number | null>(null)
  const [restoring, setRestoring] = useState<number | null>(null)

  const filteredVersions = versions
    .filter((version) => {
      const matchesSearch =
        version.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
        version.changes.some((change) => change.toLowerCase().includes(searchTerm.toLowerCase())) ||
        version.features.some((feature) => feature.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesType = selectedType === "all" || version.type === selectedType
      const matchesStatus = selectedStatus === "all" || version.status === selectedStatus
      return matchesSearch && matchesType && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "version":
          return b.id - a.id
        case "date":
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case "rating":
          return b.rating - a.rating
        case "downloads":
          return b.downloads - a.downloads
        default:
          return b.id - a.id
      }
    })

  const handleRestore = async (versionId: number) => {
    setRestoring(versionId)
    // Simulate restore process
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setCurrentVersion(versionId)
    setRestoring(null)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "major":
        return <Zap className="w-4 h-4" />
      case "minor":
        return <Plus className="w-4 h-4" />
      case "patch":
        return <Settings className="w-4 h-4" />
      case "hotfix":
        return <Bug className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "stable":
        return "bg-green-100 text-green-800"
      case "beta":
        return "bg-blue-100 text-blue-800"
      case "experimental":
        return "bg-purple-100 text-purple-800"
      case "deprecated":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case "improved":
        return "text-green-600"
      case "neutral":
        return "text-gray-600"
      case "degraded":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <GitBranch className="w-8 h-8 mr-3 text-blue-600" />
                Version Manager
              </h1>
              <p className="text-gray-600 mt-2">
                Browse and restore from versions 130-175. Test different versions to find the best starting point.
              </p>
            </div>
            {currentVersion && (
              <Alert className="max-w-sm">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Currently running version {versions.find((v) => v.id === currentVersion)?.version}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Filters and Search */}
          <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search versions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="all">All Types</option>
                <option value="major">Major</option>
                <option value="minor">Minor</option>
                <option value="patch">Patch</option>
                <option value="hotfix">Hotfix</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="all">All Status</option>
                <option value="stable">Stable</option>
                <option value="beta">Beta</option>
                <option value="experimental">Experimental</option>
                <option value="deprecated">Deprecated</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="version">Sort by Version</option>
                <option value="date">Sort by Date</option>
                <option value="rating">Sort by Rating</option>
                <option value="downloads">Sort by Downloads</option>
              </select>

              <div className="text-sm text-gray-600 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                {filteredVersions.length} versions found
              </div>
            </div>
          </div>
        </div>

        {/* Version Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredVersions.map((version) => (
            <Card
              key={version.id}
              className={`relative ${currentVersion === version.id ? "ring-2 ring-blue-500" : ""}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(version.type)}
                    <CardTitle className="text-lg">{version.version}</CardTitle>
                    {version.breaking && (
                      <Badge variant="destructive" className="text-xs">
                        Breaking
                      </Badge>
                    )}
                  </div>
                  <Badge className={`text-xs ${getStatusColor(version.status)}`}>{version.status}</Badge>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {version.date}
                  </div>
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {version.author}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-400" />
                      {version.rating}
                    </div>
                    <div className="flex items-center">
                      <Download className="w-4 h-4 mr-1 text-gray-400" />
                      {version.downloads}
                    </div>
                  </div>
                  <div className={`text-sm ${getPerformanceColor(version.performance)}`}>
                    Performance: {version.performance}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Key Changes */}
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    Key Changes
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {version.changes.slice(0, 3).map((change, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Features */}
                {version.features.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center">
                      <Plus className="w-4 h-4 mr-1 text-green-600" />
                      New Features
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {version.features.slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bug Fixes */}
                {version.bugfixes.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center">
                      <Bug className="w-4 h-4 mr-1 text-red-600" />
                      Bug Fixes
                    </h4>
                    <div className="text-sm text-gray-600">
                      {version.bugfixes.length} bug{version.bugfixes.length !== 1 ? "s" : ""} fixed
                    </div>
                  </div>
                )}

                {/* Version Info */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                  <span>Size: {version.size}</span>
                  <span>ID: {version.id}</span>
                </div>

                {/* Restore Button */}
                <Button
                  onClick={() => handleRestore(version.id)}
                  disabled={restoring === version.id || currentVersion === version.id}
                  className="w-full"
                  variant={currentVersion === version.id ? "secondary" : "default"}
                >
                  {restoring === version.id ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Restoring...
                    </>
                  ) : currentVersion === version.id ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Current Version
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Restore This Version
                    </>
                  )}
                </Button>
              </CardContent>

              {/* Current Version Indicator */}
              {currentVersion === version.id && (
                <div className="absolute -top-2 -right-2">
                  <div className="bg-blue-500 text-white rounded-full p-2">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {filteredVersions.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No versions found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-4">Version Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">46</div>
              <div className="text-sm text-gray-600">Total Versions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {versions.filter((v) => v.status === "stable").length}
              </div>
              <div className="text-sm text-gray-600">Stable Releases</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {versions.filter((v) => v.type === "major").length}
              </div>
              <div className="text-sm text-gray-600">Major Releases</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {(versions.reduce((sum, v) => sum + v.rating, 0) / versions.length).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
