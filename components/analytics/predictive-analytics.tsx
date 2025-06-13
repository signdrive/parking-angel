"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Clock, MapPin, Users, DollarSign } from "lucide-react"

export function PredictiveAnalytics() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Predictive Analytics Dashboard
            <Badge className="bg-blue-100 text-blue-800">PRO</Badge>
          </CardTitle>
          <CardDescription>Advanced insights powered by machine learning and big data analytics</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Demand Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Next Hour</span>
                <Badge className="bg-green-100 text-green-800">High Demand</Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: "85%" }}></div>
              </div>
              <p className="text-xs text-gray-600">85% probability of high parking demand</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-orange-600" />
              Peak Hours Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Morning Rush</span>
                <span className="text-sm font-medium">8:00-10:00 AM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Lunch Peak</span>
                <span className="text-sm font-medium">12:00-1:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Evening Rush</span>
                <span className="text-sm font-medium">5:00-7:00 PM</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="w-5 h-5 text-purple-600" />
              Hotspot Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-2 bg-red-50 rounded">
                <p className="text-sm font-medium text-red-900">High Congestion</p>
                <p className="text-xs text-red-700">Downtown Business District</p>
              </div>
              <div className="p-2 bg-yellow-50 rounded">
                <p className="text-sm font-medium text-yellow-900">Moderate Activity</p>
                <p className="text-xs text-yellow-700">Shopping Mall Area</p>
              </div>
              <div className="p-2 bg-green-50 rounded">
                <p className="text-sm font-medium text-green-900">Low Congestion</p>
                <p className="text-xs text-green-700">Residential Zones</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-blue-600" />
              User Behavior
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Avg. Search Time</span>
                <span className="text-sm font-medium">4.2 min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Success Rate</span>
                <span className="text-sm font-medium">87%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Repeat Users</span>
                <span className="text-sm font-medium">73%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
              Revenue Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Avg. Parking Cost</span>
                <span className="text-sm font-medium">$3.50/hr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Premium Spots</span>
                <span className="text-sm font-medium">$8.00/hr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Budget Options</span>
                <span className="text-sm font-medium">$1.50/hr</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Weekly Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
                <div key={day} className="flex items-center gap-2">
                  <span className="text-xs w-8">{day}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${[70, 75, 80, 85, 90, 60, 45][index]}%` }}
                    ></div>
                  </div>
                  <span className="text-xs w-8">{[70, 75, 80, 85, 90, 60, 45][index]}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Machine Learning Predictions</h4>
              <p className="text-sm text-blue-800">
                Our neural networks analyze 50+ data points including weather, events, traffic patterns, and historical
                data to predict parking availability with 94% accuracy.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">Real-time Optimization</h4>
              <p className="text-sm text-purple-800">
                Dynamic algorithms continuously optimize recommendations based on live data feeds from traffic sensors,
                mobile apps, and IoT parking meters.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Behavioral Analytics</h4>
              <p className="text-sm text-green-800">
                Advanced user behavior analysis helps predict individual preferences and provides personalized parking
                recommendations tailored to each user's patterns.
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2">Predictive Modeling</h4>
              <p className="text-sm text-orange-800">
                Time-series forecasting models predict parking demand up to 7 days in advance, helping users plan their
                trips and avoid peak congestion times.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
