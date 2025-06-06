"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Star, Clock, Heart, Settings, CreditCard, Award, TrendingUp } from "lucide-react"

interface UserProfileEnhancedProps {
  user: any
}

export function UserProfileEnhanced({ user }: UserProfileEnhancedProps) {
  const [activeTab, setActiveTab] = useState("profile")

  // Mock user data
  const userStats = {
    spotsReported: 23,
    spotsUsed: 156,
    reputation: 4.8,
    level: "Gold",
    points: 2340,
    savedSpots: 12,
    totalSavings: 234.5,
  }

  const recentActivity = [
    { id: "1", type: "reported", location: "123 Main St", time: "2 hours ago", points: 10 },
    { id: "2", type: "used", location: "456 Oak Ave", time: "1 day ago", points: 5 },
    { id: "3", type: "reviewed", location: "789 Pine Blvd", time: "3 days ago", points: 3 },
  ]

  const savedSpots = [
    { id: "1", address: "Downtown Mall", distance: "0.2 mi", availability: "Usually Available" },
    { id: "2", address: "City Center", distance: "0.5 mi", availability: "Often Full" },
    { id: "3", address: "Train Station", distance: "1.2 mi", availability: "Always Available" },
  ]

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback>{user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{user?.user_metadata?.full_name || "User"}</h2>
              <p className="text-gray-600">{user?.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Award className="w-3 h-3 mr-1" />
                  {userStats.level} Member
                </Badge>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-sm font-medium">{userStats.reputation}</span>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm font-medium">{userStats.points} points</span>
                </div>
              </div>
            </div>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Spots Reported</p>
                <p className="text-2xl font-bold">{userStats.spotsReported}</p>
              </div>
              <MapPin className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Spots Used</p>
                <p className="text-2xl font-bold">{userStats.spotsUsed}</p>
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Saved Spots</p>
                <p className="text-2xl font-bold">{userStats.savedSpots}</p>
              </div>
              <Heart className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Savings</p>
                <p className="text-2xl font-bold">${userStats.totalSavings}</p>
              </div>
              <CreditCard className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="saved">Saved Spots</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" defaultValue={user?.user_metadata?.full_name} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" defaultValue={user?.email} disabled />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="+1 (555) 123-4567" />
                </div>
                <div>
                  <Label htmlFor="location">Default Location</Label>
                  <Input id="location" placeholder="City, State" />
                </div>
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your parking activity and earned points</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          activity.type === "reported"
                            ? "bg-green-500"
                            : activity.type === "used"
                              ? "bg-blue-500"
                              : "bg-yellow-500"
                        }`}
                      />
                      <div>
                        <p className="font-medium capitalize">{activity.type} parking spot</p>
                        <p className="text-sm text-gray-600">{activity.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{activity.time}</p>
                      <p className="text-sm font-medium text-green-600">+{activity.points} points</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Saved Parking Spots</CardTitle>
              <CardDescription>Your favorite parking locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {savedSpots.map((spot) => (
                  <div key={spot.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Heart className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="font-medium">{spot.address}</p>
                        <p className="text-sm text-gray-600">{spot.distance} away</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          spot.availability.includes("Always")
                            ? "default"
                            : spot.availability.includes("Usually")
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {spot.availability}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Spot Availability Alerts</p>
                  <p className="text-sm text-gray-600">Get notified when spots become available</p>
                </div>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Price Drop Notifications</p>
                  <p className="text-sm text-gray-600">Alert when parking prices decrease</p>
                </div>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekly Summary</p>
                  <p className="text-sm text-gray-600">Receive weekly parking activity summary</p>
                </div>
                <input type="checkbox" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Subscription</CardTitle>
              <CardDescription>Manage your subscription and payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-blue-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Current Plan: Free</p>
                    <p className="text-sm text-gray-600">Upgrade to Premium for advanced features</p>
                  </div>
                  <Button>Upgrade</Button>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Payment Methods</h3>
                <div className="border rounded-lg p-4">
                  <p className="text-gray-600">No payment methods added</p>
                  <Button variant="outline" className="mt-2">
                    Add Payment Method
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
