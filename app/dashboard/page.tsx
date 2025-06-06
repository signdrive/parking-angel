"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EnhancedParkingMap } from "@/components/map/enhanced-parking-map"

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("map")

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="map">Map</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="map">
          <EnhancedParkingMap />
        </TabsContent>
        <TabsContent value="analytics">
          <p>Analytics content goes here.</p>
        </TabsContent>
        <TabsContent value="settings">
          <p>Settings content goes here.</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default DashboardPage
