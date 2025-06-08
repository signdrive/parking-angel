"use client"

import { Brain, MapPin, User, History, Bot, BarChart3, Bell, Crown, Settings, Clock, Navigation } from "lucide-react"
import { SmartParkingFinder } from "@/components/parking/smart-parking-finder"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { useEffect, useState } from "react"

const tabs = [
  { id: "map", label: "Live Map", icon: MapPin },
  { id: "ai-predictions", label: "AI Predictions", icon: Brain }, // Add this line
  { id: "profile", label: "Profile", icon: User },
  { id: "history", label: "History", icon: History },
  { id: "bot", label: "Bot", icon: Bot },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "rewards", label: "Rewards", icon: Crown },
  { id: "settings", label: "Settings", icon: Settings },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("map")
  const [progress, setProgress] = useState(0)
  const [sliderValue, setSliderValue] = useState([50])
  const [selectValue, setSelectValue] = useState("option1")
  const [textareaValue, setTextareaValue] = useState("")
  const [inputValue, setInputValue] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [openPopover, setOpenPopover] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + 10
        if (newProgress > 100) {
          clearInterval(interval)
          return 100
        }
        return newProgress
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 border-r border-gray-200">
        <div className="p-4">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
        </div>
        <nav>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex items-center w-full py-2 px-4 text-gray-700 hover:bg-gray-200 ${
                activeTab === tab.id ? "bg-gray-200 font-medium" : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="mr-2 h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <div className="space-y-6">
          {activeTab === "map" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Live Map</CardTitle>
                  <CardDescription>Real-time view of parking availability.</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Placeholder for Map Component */}
                  <div className="h-64 bg-gray-200 rounded-md flex items-center justify-center">Map Component Here</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Navigation</CardTitle>
                  <CardDescription>Get directions to available parking spots.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Navigation className="h-5 w-5 text-gray-500" />
                    <Input type="text" placeholder="Enter destination" className="flex-1" />
                    <Button>Go</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Nearby Parking</CardTitle>
                  <CardDescription>List of parking spots near your location.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Spot</TableHead>
                        <TableHead>Distance</TableHead>
                        <TableHead>Availability</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Spot A</TableCell>
                        <TableCell>0.5 miles</TableCell>
                        <TableCell>Available</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Spot B</TableCell>
                        <TableCell>1.2 miles</TableCell>
                        <TableCell>Occupied</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "ai-predictions" && (
            <div className="space-y-6">
              <SmartParkingFinder />
            </div>
          )}

          {activeTab === "profile" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Profile</CardTitle>
                  <CardDescription>Manage your profile information.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">John Doe</p>
                        <p className="text-sm text-gray-500">john.doe@example.com</p>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input type="text" id="name" defaultValue="John Doe" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input type="email" id="email" defaultValue="john.doe@example.com" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Update Profile</Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Parking History</CardTitle>
                  <CardDescription>View your past parking sessions.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>2023-01-01</TableCell>
                        <TableCell>Downtown Parking</TableCell>
                        <TableCell>2 hours</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>2023-01-05</TableCell>
                        <TableCell>Airport Parking</TableCell>
                        <TableCell>5 hours</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "bot" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Parking Bot</CardTitle>
                  <CardDescription>Interact with our parking assistant.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Bot className="h-5 w-5 text-gray-500" />
                    <Input type="text" placeholder="Ask me anything..." className="flex-1" />
                    <Button>Send</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Parking Analytics</CardTitle>
                  <CardDescription>Visualize parking trends and statistics.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-200 rounded-md flex items-center justify-center">
                    Analytics Chart Here
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Stay updated on parking alerts and updates.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p>Parking spot available near you!</p>
                      <Clock className="h-4 w-4 text-gray-500" />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <p>Your parking session is about to expire.</p>
                      <Clock className="h-4 w-4 text-gray-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "rewards" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Rewards</CardTitle>
                  <CardDescription>Earn points and unlock exclusive benefits.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Crown className="h-8 w-8 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium leading-none">You have 150 points</p>
                      <p className="text-sm text-gray-500">Redeem for discounts and perks.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                  <CardDescription>Customize your parking preferences.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notifications">Enable Notifications</Label>
                      <Switch id="notifications" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="darkMode">Dark Mode</Label>
                      <Switch id="darkMode" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
