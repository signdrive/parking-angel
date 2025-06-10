"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { EnhancedParkingMap } from "@/components/enhanced-parking-map"
import { useAutoLocation } from "@/hooks/use-auto-location"

export default function Dashboard() {
  const { session, signOut } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"map" | "stats">("map")

  const {
    location,
    loading: locationLoading,
    centerOnLocation,
  } = useAutoLocation({
    autoCenter: true,
    enableWatching: true,
  })

  if (!session) {
    router.push("/login")
    return null
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-gray-100 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Parking Dashboard</h1>
          <nav>
            <button
              onClick={() => signOut()}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Sign Out
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-grow flex">
        <aside className="w-64 bg-gray-200 p-4">
          <nav>
            <button
              onClick={() => setActiveTab("map")}
              className={`block py-2 px-4 rounded hover:bg-gray-300 w-full text-left ${
                activeTab === "map" ? "bg-gray-300" : ""
              }`}
            >
              Map
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`block py-2 px-4 rounded hover:bg-gray-300 w-full text-left ${
                activeTab === "stats" ? "bg-gray-300" : ""
              }`}
            >
              Stats
            </button>
          </nav>
        </aside>

        <section className="flex-grow p-4">
          {activeTab === "map" && (
            <div className="h-full">
              <EnhancedParkingMap
                onStatsUpdate={(spotsCount, providersCount) => {
                  // Update stats
                }}
                onLoadingChange={(loading) => {
                  // Handle loading
                }}
              />
            </div>
          )}

          {activeTab === "stats" && (
            <div>
              <h2>Stats</h2>
              <p>Coming soon...</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
