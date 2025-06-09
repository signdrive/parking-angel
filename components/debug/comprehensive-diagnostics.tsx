"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Database,
  Network,
  Shield,
  Clock,
  Settings,
  Info,
} from "lucide-react"

interface DiagnosticResults {
  summary: string
  issues: Array<{ severity: "critical" | "warning" | "info"; issue: string; solution: string }>
  recommendations: string[]
  technicalDetails: Record<string, any>
  status: string
  timestamp: string
}

export function ComprehensiveDiagnostics() {
  const [results, setResults] = useState<DiagnosticResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  const runDiagnostics = async () => {
    setLoading(true)
    setProgress(0)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch("/api/diagnostics/database")
      const data = await response.json()

      clearInterval(progressInterval)
      setProgress(100)

      setResults(data)
    } catch (error) {
      console.error("Diagnostics failed:", error)
      setResults({
        summary: "Diagnostics failed to complete",
        issues: [
          {
            severity: "critical",
            issue: "Unable to run diagnostics",
            solution: "Check network connectivity and try again",
          },
        ],
        recommendations: ["Verify internet connection", "Check browser console for errors"],
        technicalDetails: {},
        status: "error",
        timestamp: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      default:
        return <Badge variant="secondary">Info</Badge>
    }
  }

  const getStatusIcon = () => {
    if (loading) return <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
    if (!results) return <Database className="w-5 h-5 text-gray-400" />
    if (results.status === "critical") return <XCircle className="w-5 h-5 text-red-500" />
    return <CheckCircle className="w-5 h-5 text-green-500" />
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Database Diagnostics
          </CardTitle>
          <CardDescription>Comprehensive analysis of database connectivity and performance issues</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Running diagnostics...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          <Button onClick={runDiagnostics} disabled={loading} className="w-full">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Running Diagnostics..." : "Run Full Diagnostics"}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="recommendations">Solutions</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <Alert
              className={results.status === "critical" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Diagnostic Summary</AlertTitle>
              <AlertDescription>{results.summary}</AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Critical Issues</span>
                    <span className="text-2xl font-bold text-red-600">
                      {results.issues.filter((i) => i.severity === "critical").length}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Warnings</span>
                    <span className="text-2xl font-bold text-yellow-600">
                      {results.issues.filter((i) => i.severity === "warning").length}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Checks</span>
                    <span className="text-2xl font-bold text-blue-600">7</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="issues" className="space-y-4">
            {results.issues.length === 0 ? (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>No Issues Found</AlertTitle>
                <AlertDescription>All diagnostic checks passed successfully.</AlertDescription>
              </Alert>
            ) : (
              results.issues.map((issue, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(issue.severity)}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{issue.issue}</h4>
                          {getSeverityBadge(issue.severity)}
                        </div>
                        <p className="text-sm text-gray-600">{issue.solution}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="technical" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(results.technicalDetails).map(([key, value]) => (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle className="text-sm capitalize flex items-center gap-2">
                      {key === "environment" && <Settings className="w-4 h-4" />}
                      {key === "network" && <Network className="w-4 h-4" />}
                      {key === "authentication" && <Shield className="w-4 h-4" />}
                      {key === "performance" && <Clock className="w-4 h-4" />}
                      {key}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <div className="space-y-2">
              {results.recommendations.map((recommendation, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {results && (
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-gray-500">Last run: {new Date(results.timestamp).toLocaleString()}</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
