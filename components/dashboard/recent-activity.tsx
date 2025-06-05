"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, User } from "lucide-react"

interface ActivityItem {
  id: string
  type: "spot_reported" | "spot_taken" | "spot_reviewed"
  user: string
  location: string
  timestamp: string
  details?: string
}

interface RecentActivityProps {
  activities: ActivityItem[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "spot_reported":
        return <MapPin className="h-4 w-4 text-green-600" />
      case "spot_taken":
        return <Clock className="h-4 w-4 text-orange-600" />
      case "spot_reviewed":
        return <User className="h-4 w-4 text-blue-600" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case "spot_reported":
        return `${activity.user} reported a new parking spot`
      case "spot_taken":
        return `${activity.user} marked a spot as taken`
      case "spot_reviewed":
        return `${activity.user} reviewed a parking spot`
      default:
        return `${activity.user} performed an action`
    }
  }

  const getActivityBadge = (type: string) => {
    switch (type) {
      case "spot_reported":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            New Spot
          </Badge>
        )
      case "spot_taken":
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            Taken
          </Badge>
        )
      case "spot_reviewed":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Review
          </Badge>
        )
      default:
        return <Badge variant="secondary">Activity</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest parking spot updates from the community</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No recent activity to display</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{getActivityText(activity)}</p>
                    {getActivityBadge(activity.type)}
                  </div>
                  <p className="text-sm text-gray-500">{activity.location}</p>
                  {activity.details && <p className="text-xs text-gray-400 mt-1">{activity.details}</p>}
                  <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
