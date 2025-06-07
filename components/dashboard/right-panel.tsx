"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  MapPin,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Zap,
  ChevronDown,
  ChevronUp,
  Navigation,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface RightPanelProps {
  spotsCount: number
  providersCount: number
  clickedLocation?: { lat: number; lng: number } | null
  areaAnalysis?: any
  loading?: boolean
}

export function RightPanel({ spotsCount, providersCount, clickedLocation, areaAnalysis, loading }: RightPanelProps) {
  const [insightsCollapsed, setInsightsCollapsed] = useState(false)

  return (
    <div className="w-full h-full bg-gray-50 border-l border-gray-200 flex flex-col">
      {/* Live Stats */}
      <Card className="m-4 mb-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Live Parking Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{loading ? "..." : spotsCount}</div>
              <div className="text-sm text-blue-700">Spots Found</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{loading ? "..." : providersCount}</div>
              <div className="text-sm text-green-700">Providers</div>
            </div>
          </div>

          {clickedLocation && (
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <div className="text-sm font-medium text-purple-900 mb-1">Analyzed Area</div>
              <div className="text-xs text-purple-700 font-mono">
                {clickedLocation.lat.toFixed(4)}, {clickedLocation.lng.toFixed(4)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      {areaAnalysis?.bestRecommendation && (
        <Card className="mx-4 mb-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              AI Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
              <div className="font-semibold text-gray-900 mb-1">{areaAnalysis.bestRecommendation.spot.name}</div>
              <div className="text-sm text-gray-600 mb-3">{areaAnalysis.bestRecommendation.spot.address}</div>

              <div className="flex gap-2 mb-3">
                <Badge variant="outline" className="text-xs bg-white">
                  {areaAnalysis.bestRecommendation.prediction.predictedAvailability}% available
                </Badge>
                <Badge variant="outline" className="text-xs bg-white">
                  {areaAnalysis.bestRecommendation.prediction.confidence}% confident
                </Badge>
              </div>

              <div className="text-xs text-gray-700 mb-3">{areaAnalysis.bestRecommendation.reason}</div>

              <div className="flex gap-2">
                <Button size="sm" className="flex-1">
                  <Navigation className="w-3 h-3 mr-1" />
                  Navigate
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  Book
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Area Insights */}
      {areaAnalysis && (
        <Card className="mx-4 mb-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Area Insights
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setInsightsCollapsed(!insightsCollapsed)}
                className="h-8 w-8"
              >
                {insightsCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>

          {!insightsCollapsed && (
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-1 mb-1">
                    <DollarSign className="w-3 h-3 text-gray-600" />
                    <span className="text-xs text-gray-600">Avg Price</span>
                  </div>
                  <div className="font-semibold text-gray-900">
                    ${areaAnalysis.areaInsights.averagePrice.toFixed(2)}/hr
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-1 mb-1">
                    <Clock className="w-3 h-3 text-gray-600" />
                    <span className="text-xs text-gray-600">Demand</span>
                  </div>
                  <div
                    className={cn(
                      "font-semibold capitalize",
                      areaAnalysis.areaInsights.demandLevel === "high"
                        ? "text-red-600"
                        : areaAnalysis.areaInsights.demandLevel === "medium"
                          ? "text-yellow-600"
                          : "text-green-600",
                    )}
                  >
                    {areaAnalysis.areaInsights.demandLevel}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-1 mb-1">
                  {areaAnalysis.areaInsights.availabilityTrend === "increasing" ? (
                    <TrendingUp className="w-3 h-3 text-green-600" />
                  ) : areaAnalysis.areaInsights.availabilityTrend === "decreasing" ? (
                    <TrendingDown className="w-3 h-3 text-red-600" />
                  ) : (
                    <div className="w-3 h-3 bg-gray-400 rounded-full" />
                  )}
                  <span className="text-xs text-gray-600">Availability Trend</span>
                </div>
                <div className="font-semibold text-gray-900 capitalize">
                  {areaAnalysis.areaInsights.availabilityTrend}
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="text-xs text-blue-700 mb-1">Best Time to Arrive</div>
                <div className="font-semibold text-blue-900">{areaAnalysis.areaInsights.bestTimeToArrive}</div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="mx-4 mb-4 mt-auto">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <MapPin className="w-4 h-4 mr-2" />
            Find Nearest Spot
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Clock className="w-4 h-4 mr-2" />
            Set Parking Timer
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Navigation className="w-4 h-4 mr-2" />
            Get Directions
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
