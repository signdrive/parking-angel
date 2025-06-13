"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Brain, TrendingUp, TrendingDown, Clock, Zap, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { AISpotPredictor, type SpotPrediction } from "@/lib/ai-spot-predictor"

interface PredictionDashboardProps {
  spotId: string
  spotName: string
  onBookingAction: (action: "book_now" | "wait" | "find_alternative") => void
}

export function PredictionDashboard({ spotId, spotName, onBookingAction }: PredictionDashboardProps) {
  const [predictions, setPredictions] = useState<SpotPrediction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState<"15min" | "30min" | "1hour" | "2hour">("30min")

  const predictor = AISpotPredictor.getInstance()

  useEffect(() => {
    loadPredictions()
  }, [spotId, selectedTimeframe])

  const loadPredictions = async () => {
    setLoading(true)
    try {
      const timeframes: ("15min" | "30min" | "1hour" | "2hour")[] = ["15min", "30min", "1hour", "2hour"]
      const now = new Date()

      const predictionPromises = timeframes.map((timeframe) => {
        const targetTime = new Date(now.getTime() + getTimeframeMinutes(timeframe) * 60 * 1000)
        return predictor.predictSpotAvailability(spotId, targetTime, timeframe)
      })

      const results = await Promise.all(predictionPromises)
      setPredictions(results)
    } catch (error) {
      console.error("Error loading predictions:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTimeframeMinutes = (timeframe: string): number => {
    switch (timeframe) {
      case "15min":
        return 15
      case "30min":
        return 30
      case "1hour":
        return 60
      case "2hour":
        return 120
      default:
        return 30
    }
  }

  const selectedPrediction = predictions.find((p) => p.predictionTimeframe === selectedTimeframe)

  const getAvailabilityColor = (availability: number): string => {
    if (availability >= 70) return "text-green-600"
    if (availability >= 40) return "text-yellow-600"
    return "text-red-600"
  }

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 80) return "bg-green-500"
    if (confidence >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "book_now":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "wait":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "find_alternative":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getActionText = (action: string): string => {
    switch (action) {
      case "book_now":
        return "Book Now - High Availability"
      case "wait":
        return "Wait - Moderate Availability"
      case "find_alternative":
        return "Find Alternative - Low Availability"
      default:
        return "Unknown"
    }
  }

  const getPriceImpactIcon = (impact: string) => {
    switch (impact) {
      case "increasing":
        return <TrendingUp className="w-4 h-4 text-red-500" />
      case "decreasing":
        return <TrendingDown className="w-4 h-4 text-green-500" />
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />
    }
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 animate-pulse" />
            AI Analyzing Parking Patterns...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Prediction Card */}
      <Card className="w-full border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            AI Spot Prediction: {spotName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timeframe Selector */}
          <div className="flex gap-2 flex-wrap">
            {(["15min", "30min", "1hour", "2hour"] as const).map((timeframe) => (
              <Button
                key={timeframe}
                variant={selectedTimeframe === timeframe ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTimeframe(timeframe)}
                className="text-xs"
              >
                {timeframe}
              </Button>
            ))}
          </div>

          {selectedPrediction && (
            <>
              {/* Main Prediction Display */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div
                    className={`text-3xl font-bold ${getAvailabilityColor(selectedPrediction.predictedAvailability)}`}
                  >
                    {selectedPrediction.predictedAvailability}%
                  </div>
                  <div className="text-sm text-gray-600">Predicted Availability</div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Progress value={selectedPrediction.confidence} className="w-16 h-2" />
                    <span className="text-sm font-medium">{selectedPrediction.confidence}%</span>
                  </div>
                  <div className="text-sm text-gray-600">Confidence Level</div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    {getPriceImpactIcon(selectedPrediction.priceImpact)}
                    <span className="text-sm font-medium capitalize">{selectedPrediction.priceImpact}</span>
                  </div>
                  <div className="text-sm text-gray-600">Price Trend</div>
                </div>
              </div>

              {/* Current Status */}
              <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                <div
                  className={`w-3 h-3 rounded-full ${
                    selectedPrediction.currentAvailability === "available"
                      ? "bg-green-500"
                      : selectedPrediction.currentAvailability === "occupied"
                        ? "bg-red-500"
                        : "bg-gray-400"
                  }`}
                />
                <span className="text-sm">
                  Current Status:{" "}
                  <span className="font-medium capitalize">{selectedPrediction.currentAvailability}</span>
                </span>
              </div>

              {/* Recommended Action */}
              <div className="p-4 bg-white rounded-lg border-l-4 border-blue-500">
                <div className="flex items-center gap-2 mb-2">
                  {getActionIcon(selectedPrediction.recommendedAction)}
                  <span className="font-medium">{getActionText(selectedPrediction.recommendedAction)}</span>
                </div>
                <Button
                  onClick={() => onBookingAction(selectedPrediction.recommendedAction)}
                  className="w-full"
                  variant={selectedPrediction.recommendedAction === "book_now" ? "default" : "outline"}
                >
                  {selectedPrediction.recommendedAction === "book_now" && <Zap className="w-4 h-4 mr-2" />}
                  {selectedPrediction.recommendedAction === "book_now"
                    ? "Book This Spot Now"
                    : selectedPrediction.recommendedAction === "wait"
                      ? "Set Availability Alert"
                      : "Find Alternative Spots"}
                </Button>
              </div>

              {/* Prediction Factors */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Factors Affecting Availability:</h4>
                <div className="space-y-2">
                  {selectedPrediction.factors.map((factor, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Badge variant={factor.impact > 0 ? "default" : "destructive"} className="text-xs">
                        {factor.impact > 0 ? "+" : ""}
                        {factor.impact}%
                      </Badge>
                      <span className="text-gray-600">{factor.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Timeline Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Availability Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {predictions.map((prediction) => (
              <div
                key={prediction.predictionTimeframe}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedTimeframe === prediction.predictionTimeframe
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedTimeframe(prediction.predictionTimeframe)}
              >
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">In {prediction.predictionTimeframe}</div>
                  <div className={`text-xl font-bold ${getAvailabilityColor(prediction.predictedAvailability)}`}>
                    {prediction.predictedAvailability}%
                  </div>
                  <div className="flex items-center justify-center mt-1">
                    <div
                      className={`w-full h-1 rounded ${getConfidenceColor(prediction.confidence)}`}
                      style={{ width: `${prediction.confidence}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
