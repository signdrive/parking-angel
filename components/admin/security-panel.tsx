"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Shield,
  AlertTriangle,
  Lock,
  Eye,
  Ban,
  Key,
  Activity,
  Globe,
  Clock,
  User,
  Download,
  RefreshCw,
} from "lucide-react"

interface SecurityEvent {
  id: string
  type: "login_attempt" | "failed_login" | "admin_access" | "suspicious_activity" | "data_breach"
  user_id?: string
  user_email?: string
  ip_address: string
  user_agent: string
  timestamp: string
  details: string
  severity: "low" | "medium" | "high" | "critical"
  resolved: boolean
}

interface SecurityStats {
  total_events: number
  failed_logins_24h: number
  suspicious_activities: number
  blocked_ips: number
  active_sessions: number
  admin_sessions: number
}

export function SecurityPanel() {
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [stats, setStats] = useState<SecurityStats>({
    total_events: 0,
    failed_logins_24h: 0,
    suspicious_activities: 0,
    blocked_ips: 0,
    active_sessions: 0,
    admin_sessions: 0,
  })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [newBlockedIP, setNewBlockedIP] = useState("")

  useEffect(() => {
    fetchSecurityData()
    fetchSecurityStats()

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchSecurityData()
      fetchSecurityStats()
    }, 30000)

    return () => clearInterval(interval)
  }, [filter])

  const fetchSecurityData = async () => {
    try {
      const response = await fetch(`/api/admin/security-events?filter=${filter}`)
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error("Failed to fetch security data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSecurityStats = async () => {
    try {
      const response = await fetch("/api/admin/security-stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch security stats:", error)
    }
  }

  const blockIP = async (ipAddress: string) => {
    try {
      const response = await fetch("/api/admin/block-ip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip_address: ipAddress }),
      })

      if (response.ok) {
        fetchSecurityStats()
        setNewBlockedIP("")
      }
    } catch (error) {
      console.error("Failed to block IP:", error)
    }
  }

  const resolveEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/admin/security-events/${eventId}/resolve`, {
        method: "POST",
      })

      if (response.ok) {
        fetchSecurityData()
      }
    } catch (error) {
      console.error("Failed to resolve event:", error)
    }
  }

  const exportSecurityLog = async () => {
    try {
      const response = await fetch("/api/admin/export-security-log")
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `security-log-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Failed to export security log:", error)
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>
      case "high":
        return <Badge variant="destructive">High</Badge>
      case "medium":
        return <Badge variant="secondary">Medium</Badge>
      case "low":
        return <Badge variant="outline">Low</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "login_attempt":
        return <User className="w-4 h-4" />
      case "failed_login":
        return <Lock className="w-4 h-4" />
      case "admin_access":
        return <Shield className="w-4 h-4" />
      case "suspicious_activity":
        return <AlertTriangle className="w-4 h-4" />
      case "data_breach":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 animate-pulse" />
            Loading Security Data...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_events.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failed_logins_24h}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.suspicious_activities}</div>
            <p className="text-xs text-muted-foreground">Unresolved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.blocked_ips}</div>
            <p className="text-xs text-muted-foreground">Currently blocked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active_sessions}</div>
            <p className="text-xs text-muted-foreground">Current users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Sessions</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admin_sessions}</div>
            <p className="text-xs text-muted-foreground">Admin users</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      {stats.suspicious_activities > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Security Alert:</strong> {stats.suspicious_activities} suspicious activities detected that require
            your attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Security Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Controls
          </CardTitle>
          <CardDescription>Manage security settings and block suspicious IPs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="block-ip">Block IP Address</Label>
                <div className="flex gap-2">
                  <Input
                    id="block-ip"
                    placeholder="Enter IP address to block..."
                    value={newBlockedIP}
                    onChange={(e) => setNewBlockedIP(e.target.value)}
                  />
                  <Button onClick={() => blockIP(newBlockedIP)} disabled={!newBlockedIP}>
                    <Ban className="w-4 h-4 mr-2" />
                    Block IP
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={exportSecurityLog} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Security Log
              </Button>
              <Button onClick={fetchSecurityData} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Security Events
          </CardTitle>
          <CardDescription>Recent security events and incidents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filter Buttons */}
            <div className="flex gap-2">
              {["all", "critical", "high", "medium", "low"].map((filterType) => (
                <Button
                  key={filterType}
                  variant={filter === filterType ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(filterType)}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </Button>
              ))}
            </div>

            {/* Events Table */}
            {events.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No security events found</p>
                <p className="text-sm text-gray-500">Your system appears to be secure</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getEventIcon(event.type)}
                            <div className="space-y-1">
                              <p className="font-medium">{event.type.replace("_", " ").toUpperCase()}</p>
                              <p className="text-sm text-gray-600">{event.details}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm">{event.user_email || "Unknown"}</p>
                            {event.user_id && <p className="text-xs text-gray-500">{event.user_id.slice(0, 8)}...</p>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-mono text-sm">{event.ip_address}</p>
                        </TableCell>
                        <TableCell>{getSeverityBadge(event.severity)}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm">{new Date(event.timestamp).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleTimeString()}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={event.resolved ? "default" : "secondary"}>
                            {event.resolved ? "Resolved" : "Open"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {!event.resolved && (
                              <Button size="sm" onClick={() => resolveEvent(event.id)} title="Mark as resolved">
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => blockIP(event.ip_address)}
                              title="Block this IP"
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Security Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            System Security Status
          </CardTitle>
          <CardDescription>Current security configuration and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <h4 className="font-medium">Security Features</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SSL/TLS Encryption</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Rate Limiting</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">IP Blocking</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Session Security</span>
                    <Badge variant="default">Secure</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Security Recommendations</h4>
                <div className="space-y-2">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Consider enabling two-factor authentication for all admin accounts.
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      Review and update security policies regularly (last updated: 30 days ago).
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
