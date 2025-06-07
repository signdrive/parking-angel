"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useNavigationStore } from "@/lib/navigation-store"
import { cn } from "@/lib/utils"
import {
  Settings,
  Map,
  Satellite,
  Mountain,
  Navigation,
  Eye,
  Zap,
  Leaf,
  RouteIcon as Highway,
  Route,
  Sun,
  Moon,
  Palette,
  X,
} from "lucide-react"

interface NavigationSettingsProps {
  isOpen: boolean
  onClose: () => void
}

export function NavigationSettings({ isOpen, onClose }: NavigationSettingsProps) {
  const { settings, updateSettings } = useNavigationStore()

  if (!isOpen) return null

  const mapStyleOptions = [
    { id: "navigation", name: "Navigation", icon: Navigation, description: "Optimized for turn-by-turn" },
    { id: "satellite", name: "Satellite", icon: Satellite, description: "Aerial imagery view" },
    { id: "terrain", name: "Terrain", icon: Mountain, description: "Topographic details" },
    { id: "street", name: "Street", icon: Map, description: "Detailed street view" },
    { id: "hybrid", name: "Hybrid", icon: Eye, description: "Satellite with labels" },
  ]

  const viewModeOptions = [
    { id: "2d", name: "2D View", icon: Map, description: "Traditional flat map" },
    { id: "3d", name: "3D View", icon: Mountain, description: "Three-dimensional perspective" },
    { id: "bird-eye", name: "Bird's Eye", icon: Eye, description: "Angled overhead view" },
    { id: "follow", name: "Follow Mode", icon: Navigation, description: "Camera follows direction" },
  ]

  const routePreferenceOptions = [
    { id: "fastest", name: "Fastest", icon: Zap, description: "Quickest route" },
    { id: "shortest", name: "Shortest", icon: Route, description: "Least distance" },
    { id: "eco", name: "Eco-Friendly", icon: Leaf, description: "Fuel efficient" },
    { id: "avoid-highways", name: "Avoid Highways", icon: Highway, description: "Use local roads" },
  ]

  const themeOptions = [
    { id: "auto", name: "Auto", icon: Palette, description: "Follow system" },
    { id: "day", name: "Day", icon: Sun, description: "Light theme" },
    { id: "night", name: "Night", icon: Moon, description: "Dark theme" },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Navigation Settings
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Map Style */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Map Style</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mapStyleOptions.map((option) => (
                <Button
                  key={option.id}
                  variant={settings.mapStyle === option.id ? "default" : "outline"}
                  className="h-auto p-4 flex flex-col items-start gap-2"
                  onClick={() => updateSettings({ mapStyle: option.id as any })}
                >
                  <div className="flex items-center gap-2 w-full">
                    <option.icon className="w-4 h-4" />
                    <span className="font-medium">{option.name}</span>
                    {settings.mapStyle === option.id && <Badge variant="secondary">Active</Badge>}
                  </div>
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* View Mode */}
          <div>
            <h3 className="text-lg font-semibold mb-3">View Mode</h3>
            <div className="grid grid-cols-2 gap-3">
              {viewModeOptions.map((option) => (
                <Button
                  key={option.id}
                  variant={settings.viewMode === option.id ? "default" : "outline"}
                  className="h-auto p-4 flex flex-col items-start gap-2"
                  onClick={() => updateSettings({ viewMode: option.id as any })}
                >
                  <div className="flex items-center gap-2 w-full">
                    <option.icon className="w-4 h-4" />
                    <span className="font-medium">{option.name}</span>
                    {settings.viewMode === option.id && <Badge variant="secondary">Active</Badge>}
                  </div>
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Route Preferences */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Route Preference</h3>
            <div className="grid grid-cols-2 gap-3">
              {routePreferenceOptions.map((option) => (
                <Button
                  key={option.id}
                  variant={settings.routePreference === option.id ? "default" : "outline"}
                  className="h-auto p-4 flex flex-col items-start gap-2"
                  onClick={() => updateSettings({ routePreference: option.id as any })}
                >
                  <div className="flex items-center gap-2 w-full">
                    <option.icon className="w-4 h-4" />
                    <span className="font-medium">{option.name}</span>
                    {settings.routePreference === option.id && <Badge variant="secondary">Active</Badge>}
                  </div>
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Display Options */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Display Options</h3>
            <div className="space-y-3">
              {[
                { key: "showTraffic", label: "Traffic Information", description: "Real-time traffic conditions" },
                { key: "showIncidents", label: "Road Incidents", description: "Accidents and road closures" },
                { key: "showSpeedLimits", label: "Speed Limits", description: "Current speed limit signs" },
                { key: "showLaneGuidance", label: "Lane Guidance", description: "Which lane to use" },
                { key: "voiceGuidance", label: "Voice Instructions", description: "Spoken turn directions" },
              ].map((option) => (
                <div key={option.key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.description}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateSettings({ [option.key]: !settings[option.key as keyof typeof settings] })}
                    className={cn(
                      "w-12 h-6 rounded-full p-0",
                      settings[option.key as keyof typeof settings] ? "bg-blue-600" : "bg-gray-200",
                    )}
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full bg-white transition-transform",
                        settings[option.key as keyof typeof settings] ? "translate-x-3" : "translate-x-0",
                      )}
                    />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Theme</h3>
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map((option) => (
                <Button
                  key={option.id}
                  variant={settings.theme === option.id ? "default" : "outline"}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => updateSettings({ theme: option.id as any })}
                >
                  <option.icon className="w-4 h-4" />
                  <span className="font-medium">{option.name}</span>
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Units */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Units</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={settings.units === "imperial" ? "default" : "outline"}
                onClick={() => updateSettings({ units: "imperial" })}
              >
                Imperial (mph, ft)
              </Button>
              <Button
                variant={settings.units === "metric" ? "default" : "outline"}
                onClick={() => updateSettings({ units: "metric" })}
              >
                Metric (km/h, m)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
