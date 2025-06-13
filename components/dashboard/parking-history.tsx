"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Clock, Star, DollarSign, Calendar, Filter, Download, Search } from "lucide-react"

export function ParkingHistory() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")

  // Mock parking history data
  const parkingHistory = [
    {
      id: "1",
      address: "123 Main St, Downtown",
      date: "2024-01-15",
      duration: "2h 30m",
      cost: 12.5,
      rating: 5,
      type: "street",
      status: "completed",
    },
    {
      id: "2",
      address: "456 Oak Ave, Business District",
      date: "2024-01-14",
      duration: "4h 15m",
      cost: 25.0,
      rating: 4,
      type: "garage",
      status: "completed",
    },
    {
      id: "3",
      address: "789 Pine Blvd, Shopping Center",
      date: "2024-01-13",
      duration: "1h 45m",
      cost: 8.75,
      rating: 3,
      type: "lot",
      status: "completed",
    },
    {
      id: "4",
      address: "321 Elm St, University Area",
      date: "2024-01-12",
      duration: "6h 00m",
      cost: 15.0,
      rating: 5,
      type: "meter",
      status: "completed",
    },
  ]

  const totalStats = {
    totalSessions: parkingHistory.length,
    totalCost: parkingHistory.reduce((sum, session) => sum + session.cost, 0),
    totalTime: "14h 30m",
    avgRating: 4.25,
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold">{totalStats.totalSessions}</p>
              </div>
              <MapPin className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold">${totalStats.totalCost.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Time</p>
                <p className="text-2xl font-bold">{totalStats.totalTime}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold">{totalStats.avgRating}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Parking History</CardTitle>
              <CardDescription>Your complete parking session history</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">Search History</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="border rounded-lg">
            <div className="grid grid-cols-6 gap-4 p-4 border-b bg-gray-50 font-medium text-sm">
              <div>Location</div>
              <div>Date</div>
              <div>Duration</div>
              <div>Cost</div>
              <div>Type</div>
              <div>Rating</div>
            </div>
            {parkingHistory.map((session) => (
              <div key={session.id} className="grid grid-cols-6 gap-4 p-4 border-b items-center hover:bg-gray-50">
                <div>
                  <p className="font-medium">{session.address.split(",")[0]}</p>
                  <p className="text-sm text-gray-600">{session.address.split(",")[1]}</p>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {session.date}
                  </div>
                </div>
                <div className="text-sm">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {session.duration}
                  </div>
                </div>
                <div className="text-sm font-medium">${session.cost.toFixed(2)}</div>
                <div>
                  <Badge variant="outline" className="capitalize">
                    {session.type}
                  </Badge>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-sm">{session.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
