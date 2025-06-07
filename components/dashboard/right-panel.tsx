"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, TrendingUp, Zap, DollarSign, Users, Activity, Route, Star, Navigation } from "lucide-react"
import { cn } from "@/lib/utils"

interface RightPanelProps {
  spotsCount: number
  providersCount: number
  clickedLocation: { lat: number; lng: number } | null
  areaAnalysis: any
  loading: boolean
}

export function RightPanel({ spotsCount, providersCount, clickedLocation, areaAnalysis, loading }: RightPanelProps) {
  return (
    <div className="h-full bg-gray-50 border-l border-gray-200 overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Live Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Live Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{spotsCount}</div>
                <div className="text-xs text-gray-600">Spots Found</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{providersCount}</div>
                <div className="text-xs text-gray-600">Providers</div>
              </div>
            </div>

            {clickedLocation && (
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">Analyzed Location</span>
                </div>
                <div className="text-xs text-purple-700">
                  {clickedLocation.lat.toFixed(4)}, {clickedLocation.lng.toFixed(4)}
                </div>
              </div>
            )}

            {loading && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Updating data...</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        {areaAnalysis && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {areaAnalysis.bestRecommendation ? (
                <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{areaAnalysis.bestRecommendation.spot.name}</div>
                      <div className="text-xs text-gray-600">{areaAnalysis.bestRecommendation.spot.address}</div>
                    </div>
                    <Star className="w-4 h-4 text-yellow-500" />
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {areaAnalysis.bestRecommendation.prediction.predictedAvailability}% available
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {areaAnalysis.bestRecommendation.prediction.confidence}% confident
                    </Badge>
                  </div>

                  <div className="text-xs text-gray-700 mb-3">{areaAnalysis.bestRecommendation.reason}</div>

                  <Button size="sm" className="w-full">
                    <Route className="w-3 h-3 mr-1" />
                    Navigate Here
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Click on the map to get AI recommendations</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Area Insights */}
        {areaAnalysis?.areaInsights && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Area Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-600">Avg Price</div>
                  <div className="font-medium">${areaAnalysis.areaInsights.averagePrice.toFixed(2)}/hr</div>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-600">Demand</div>
                  <div
                    className={cn(
                      "font-medium capitalize",
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

              <div className="p-2 bg-gray-50 rounded">
                <div className="text-xs text-gray-600 mb-1">Availability Trend</div>
                <div className="flex items-center gap-1">
                  {areaAnalysis.areaInsights.availabilityTrend === "increasing" && (
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  )}
                  {areaAnalysis.areaInsights.availabilityTrend === "decreasing" && (
                    <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />
                  )}
                  <span className="font-medium capitalize text-sm">{areaAnalysis.areaInsights.availabilityTrend}</span>
                </div>
              </div>

              <div className="p-2 bg-blue-50 rounded">
                <div className="text-xs text-blue-600 mb-1">Best Time to Arrive</div>
                <div className="font-medium text-sm text-blue-900">{areaAnalysis.areaInsights.bestTimeToArrive}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Navigation className="w-5 h-5 text-blue-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <MapPin className="w-4 h-4 mr-2" />
              Find Nearest Spot
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <DollarSign className="w-4 h-4 mr-2" />
              Find Cheapest Spot
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Clock className="w-4 h-4 mr-2" />
              Reserve for Later
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Users className="w-4 h-4 mr-2" />
              Share Location
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Spot found on Main St</span>
                <span className="text-xs text-gray-500 ml-auto">2m ago</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>AI analysis completed</span>
                <span className="text-xs text-gray-500 ml-auto">5m ago</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Route calculated</span>
                <span className="text-xs text-gray-500 ml-auto">8m ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
