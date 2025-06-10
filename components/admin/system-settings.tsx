"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Settings, Globe, Shield, DollarSign, AlertTriangle, Save, RotateCcw, Database } from "lucide-react"

interface SystemConfig {
  // General Settings
  site_name: string
  site_description: string
  maintenance_mode: boolean
  registration_enabled: boolean

  // Location Settings
  default_location: {
    latitude: number
    longitude: number
    zoom: number
  }
  location_tracking_enabled: boolean
  location_consent_required: boolean

  // Pricing Settings
  default_price_per_hour: number
  currency: string
  payment_enabled: boolean

  // Email Settings
  email_notifications_enabled: boolean
  admin_email: string
  smtp_configured: boolean

  // Security Settings
  two_factor_required: boolean
  session_timeout: number
  max_login_attempts: number

  // API Settings
  rate_limit_per_minute: number
  api_keys_enabled: boolean

  // Data Retention
  location_data_retention_days: number
  user_data_retention_days: number
  log_retention_days: number
}

export function SystemSettings() {
  const [config, setConfig] = useState<SystemConfig>({
    site_name: "ParkAlgo",
    site_description: "AI-Powered Parking Solutions",
    maintenance_mode: false,
    registration_enabled: true,
    default_location: {
      latitude: 51.5074,
      longitude: -0.1278,
      zoom: 12,
    },
    location_tracking_enabled: true,
    location_consent_required: true,
    default_price_per_hour: 5.0,
    currency: "USD",
    payment_enabled: false,
    email_notifications_enabled: true,
    admin_email: "admin@parkalgo.com",
    smtp_configured: false,
    two_factor_required: false,
    session_timeout: 24,
    max_login_attempts: 5,
    rate_limit_per_minute: 100,
    api_keys_enabled: true,
    location_data_retention_days: 30,
    user_data_retention_days: 365,
    log_retention_days: 90,
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    fetchSystemConfig()
  }, [])

  const fetchSystemConfig = async () => {
    try {
      const response = await fetch("/api/admin/system-config")
      if (response.ok) {
        const data = await response.json()
        setConfig({ ...config, ...data })
      }
    } catch (error) {
      console.error("Failed to fetch system config:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/system-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        setHasChanges(false)
        // Show success message
      }
    } catch (error) {
      console.error("Failed to save config:", error)
    } finally {
      setSaving(false)
    }
  }

  const resetToDefaults = () => {
    if (confirm("Are you sure you want to reset all settings to defaults?")) {
      fetchSystemConfig()
      setHasChanges(false)
    }
  }

  const updateConfig = (key: string, value: any) => {
    setConfig({ ...config, [key]: value })
    setHasChanges(true)
  }

  const updateNestedConfig = (parent: string, key: string, value: any) => {
    setConfig({
      ...config,
      [parent]: {
        ...(config as any)[parent],
        [key]: value,
      },
    })
    setHasChanges(true)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 animate-pulse" />
            Loading System Settings...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Save Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            System Settings
          </CardTitle>
          <CardDescription>Configure global system settings and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {hasChanges && (
                <Badge variant="secondary">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Unsaved Changes
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetToDefaults} disabled={saving}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>
              <Button onClick={saveConfig} disabled={saving || !hasChanges}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            General Settings
          </CardTitle>
          <CardDescription>Basic site configuration and operational settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="site_name">Site Name</Label>
              <Input
                id="site_name"
                value={config.site_name}
                onChange={(e) => updateConfig("site_name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin_email">Admin Email</Label>
              <Input
                id="admin_email"
                type="email"
                value={config.admin_email}
                onChange={(e) => updateConfig("admin_email", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="site_description">Site Description</Label>
            <Textarea
              id="site_description"
              value={config.site_description}
              onChange={(e) => updateConfig("site_description", e.target.value)}
              placeholder="Brief description of your parking service..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-gray-600">Temporarily disable the site for maintenance</p>
              </div>
              <Switch
                checked={config.maintenance_mode}
                onCheckedChange={(checked) => updateConfig("maintenance_mode", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>User Registration</Label>
                <p className="text-sm text-gray-600">Allow new users to register</p>
              </div>
              <Switch
                checked={config.registration_enabled}
                onCheckedChange={(checked) => updateConfig("registration_enabled", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Location Settings
          </CardTitle>
          <CardDescription>Configure location tracking and default map settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default_lat">Default Latitude</Label>
              <Input
                id="default_lat"
                type="number"
                step="0.000001"
                value={config.default_location.latitude}
                onChange={(e) => updateNestedConfig("default_location", "latitude", Number.parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default_lng">Default Longitude</Label>
              <Input
                id="default_lng"
                type="number"
                step="0.000001"
                value={config.default_location.longitude}
                onChange={(e) => updateNestedConfig("default_location", "longitude", Number.parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default_zoom">Default Zoom</Label>
              <Input
                id="default_zoom"
                type="number"
                min="1"
                max="20"
                value={config.default_location.zoom}
                onChange={(e) => updateNestedConfig("default_location", "zoom", Number.parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Location Tracking</Label>
                <p className="text-sm text-gray-600">Enable user location tracking</p>
              </div>
              <Switch
                checked={config.location_tracking_enabled}
                onCheckedChange={(checked) => updateConfig("location_tracking_enabled", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Require Consent</Label>
                <p className="text-sm text-gray-600">Require explicit consent for location tracking</p>
              </div>
              <Switch
                checked={config.location_consent_required}
                onCheckedChange={(checked) => updateConfig("location_consent_required", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Pricing Settings
          </CardTitle>
          <CardDescription>Configure default pricing and payment settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default_price">Default Price per Hour</Label>
              <Input
                id="default_price"
                type="number"
                step="0.01"
                value={config.default_price_per_hour}
                onChange={(e) => updateConfig("default_price_per_hour", Number.parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={config.currency} onValueChange={(value) => updateConfig("currency", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="CAD">CAD (C$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Payment Processing</Label>
              <p className="text-sm text-gray-600">Enable payment processing for paid parking spots</p>
            </div>
            <Switch
              checked={config.payment_enabled}
              onCheckedChange={(checked) => updateConfig("payment_enabled", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Settings
          </CardTitle>
          <CardDescription>Configure authentication and security policies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="session_timeout">Session Timeout (hours)</Label>
              <Input
                id="session_timeout"
                type="number"
                min="1"
                max="168"
                value={config.session_timeout}
                onChange={(e) => updateConfig("session_timeout", Number.parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_attempts">Max Login Attempts</Label>
              <Input
                id="max_attempts"
                type="number"
                min="3"
                max="10"
                value={config.max_login_attempts}
                onChange={(e) => updateConfig("max_login_attempts", Number.parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate_limit">Rate Limit (per minute)</Label>
              <Input
                id="rate_limit"
                type="number"
                min="10"
                max="1000"
                value={config.rate_limit_per_minute}
                onChange={(e) => updateConfig("rate_limit_per_minute", Number.parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-gray-600">Require 2FA for admin accounts</p>
              </div>
              <Switch
                checked={config.two_factor_required}
                onCheckedChange={(checked) => updateConfig("two_factor_required", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>API Keys</Label>
                <p className="text-sm text-gray-600">Enable API key authentication</p>
              </div>
              <Switch
                checked={config.api_keys_enabled}
                onCheckedChange={(checked) => updateConfig("api_keys_enabled", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Retention */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Retention
          </CardTitle>
          <CardDescription>Configure how long different types of data are stored</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location_retention">Location Data (days)</Label>
              <Input
                id="location_retention"
                type="number"
                min="1"
                max="365"
                value={config.location_data_retention_days}
                onChange={(e) => updateConfig("location_data_retention_days", Number.parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user_retention">User Data (days)</Label>
              <Input
                id="user_retention"
                type="number"
                min="30"
                max="2555"
                value={config.user_data_retention_days}
                onChange={(e) => updateConfig("user_data_retention_days", Number.parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="log_retention">System Logs (days)</Label>
              <Input
                id="log_retention"
                type="number"
                min="7"
                max="365"
                value={config.log_retention_days}
                onChange={(e) => updateConfig("log_retention_days", Number.parseInt(e.target.value))}
              />
            </div>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Data retention policies are automatically enforced. Reducing retention periods will permanently delete
              older data.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
