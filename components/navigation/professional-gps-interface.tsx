"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Phone, Volume2, VolumeX, MoreHorizontal, ArrowLeft, Navigation2, AlertTriangle } from "lucide-react"

interface ProfessionalGPSInterfaceProps {
  onExit: () => void
}

export function ProfessionalGPSInterface({ onExit }: ProfessionalGPSInterfaceProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [currentSpeed, setCurrentSpeed] = useState(67)
  const [voiceEnabled, setVoiceEnabled] = useState(true)

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Simulate realistic speed changes
  useEffect(() => {
    const speedTimer = setInterval(() => {
      setCurrentSpeed((prev) => {
        const change = (Math.random() - 0.5) * 3
        return Math.max(60, Math.min(75, prev + change))
      })
    }, 2000)
    return () => clearInterval(speedTimer)
  }, [])

  const navigationData = {
    instruction: "Continue straight on Highway 101 North",
    distance: "3,520.5 km",
    timeRemaining: "293h 22m remaining",
    progress: 75, // 75% complete
    currentSpeed: Math.round(currentSpeed),
    speedLimit: 70,
    eta: "18:45",
    trafficDelay: "5 min delay",
  }

  return (
    <div className="h-screen bg-white flex flex-col font-sans">
      {/* Header Section - 80px height */}
      <div
        className="flex items-center justify-between px-6 shadow-sm border-b border-gray-200"
        style={{ height: "80px" }}
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onExit} className="rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" style={{ color: "#202124" }} />
          </Button>

          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: "#1976D2" }}></div>
            <div>
              <div className="font-semibold text-base" style={{ color: "#202124" }}>
                Downtown Parking Area
              </div>
              <div className="text-sm" style={{ color: "#5F6368" }}>
                Via Highway 101 North
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-medium text-base" style={{ color: "#202124" }}>
              {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className="text-sm" style={{ color: "#5F6368" }}>
              ETA {navigationData.eta}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className="rounded-full hover:bg-gray-100"
          >
            {voiceEnabled ? (
              <Volume2 className="w-4 h-4" style={{ color: "#1976D2" }} />
            ) : (
              <VolumeX className="w-4 h-4" style={{ color: "#5F6368" }} />
            )}
          </Button>

          <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
            <MoreHorizontal className="w-4 h-4" style={{ color: "#202124" }} />
          </Button>
        </div>
      </div>

      {/* Traffic Alert Banner */}
      <div className="px-6 py-3 flex items-center gap-3" style={{ backgroundColor: "#EA4335", color: "#FFFFFF" }}>
        <AlertTriangle className="w-5 h-5" />
        <span className="font-medium text-sm">Traffic ahead - {navigationData.trafficDelay}</span>
      </div>

      {/* Main Navigation Content */}
      <div className="flex-1 relative overflow-hidden">
        {/* Map Background Simulation */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, #87CEEB 0%, #98D8E8 30%, #90EE90 60%, #228B22 100%)",
          }}
        >
          {/* Road Visualization */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3">
            <div
              className="w-full h-full relative"
              style={{
                background: "linear-gradient(180deg, transparent 0%, #2F2F2F 40%, #1A1A1A 100%)",
                clipPath: "polygon(30% 0%, 70% 0%, 90% 100%, 10% 100%)",
              }}
            >
              {/* Lane Markings */}
              <div className="absolute inset-0 flex justify-center">
                <div
                  className="w-1 h-full opacity-80"
                  style={{
                    background:
                      "repeating-linear-gradient(to bottom, #FFD700 0px, #FFD700 20px, transparent 20px, transparent 40px)",
                  }}
                ></div>
              </div>

              {/* Route Arrows */}
              <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2">
                <div className="flex flex-col gap-8">
                  {[0, 1, 2].map((index) => (
                    <div
                      key={index}
                      className="w-8 h-12 flex items-center justify-center animate-pulse"
                      style={{
                        backgroundColor: "#1976D2",
                        clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                        animationDelay: `${index * 0.3}s`,
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Instruction Card */}
        <div className="absolute top-6 left-6 right-6">
          <div
            className="rounded-xl shadow-lg p-6 border"
            style={{ backgroundColor: "#FFFFFF", borderColor: "#E8EAED" }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center shadow-md"
                style={{ backgroundColor: "#1976D2" }}
              >
                <Navigation2 className="w-8 h-8 text-white" />
              </div>

              <div className="flex-1">
                {/* PRIMARY ACTION - 24px+ text */}
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "24px",
                    color: "#202124",
                    lineHeight: "1.2",
                  }}
                >
                  {navigationData.instruction}
                </div>

                {/* DISTANCE - 20px bold */}
                <div
                  className="mt-2"
                  style={{
                    fontWeight: 600,
                    fontSize: "20px",
                    color: "#1976D2",
                  }}
                >
                  {navigationData.distance}
                </div>

                {/* TIME - 16px */}
                <div
                  className="mt-1"
                  style={{
                    fontWeight: 400,
                    fontSize: "16px",
                    color: "#5F6368",
                  }}
                >
                  {navigationData.timeRemaining}
                </div>
              </div>
            </div>

            {/* PROGRESS BAR - 4px height, rounded corners */}
            <div className="mt-4">
              <div
                className="w-full rounded-full overflow-hidden"
                style={{
                  height: "4px",
                  backgroundColor: "#E8EAED",
                }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${navigationData.progress}%`,
                    backgroundColor: "#1976D2",
                  }}
                ></div>
              </div>
              <div className="text-xs mt-1" style={{ color: "#5F6368" }}>
                {navigationData.progress}% complete
              </div>
            </div>
          </div>
        </div>

        {/* Speed Display */}
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 flex items-center gap-6">
          {/* Speed Limit */}
          <div
            className="w-20 h-20 rounded-full border-4 flex items-center justify-center shadow-lg"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#EA4335",
            }}
          >
            <div className="text-center">
              <div className="font-bold text-xl" style={{ color: "#202124" }}>
                {navigationData.speedLimit}
              </div>
              <div className="text-xs" style={{ color: "#5F6368" }}>
                mph
              </div>
            </div>
          </div>

          {/* Current Speed */}
          <div className="px-6 py-3 rounded-xl shadow-lg" style={{ backgroundColor: "#202124" }}>
            <div className="text-center">
              <div className="font-bold text-3xl text-white">{navigationData.currentSpeed}</div>
              <div className="text-sm text-gray-300">mph</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar - 48px height, 12px margin */}
      <div
        className="flex items-center justify-between px-6 border-t shadow-lg"
        style={{
          height: "48px",
          margin: "12px",
          backgroundColor: "#FFFFFF",
          borderColor: "#E8EAED",
        }}
      >
        <div className="flex items-center gap-6">
          <div className="text-sm font-medium" style={{ color: "#202124" }}>
            Fastest route
          </div>
          <div className="text-sm" style={{ color: "#5F6368" }}>
            Avoiding tolls
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* CALL BUTTON - Green circular button with phone icon */}
          <Button
            className="rounded-full w-12 h-12 shadow-md hover:shadow-lg transition-shadow"
            style={{
              backgroundColor: "#34A853",
              color: "#FFFFFF",
            }}
          >
            <Phone className="w-5 h-5" />
          </Button>

          <Button
            variant="outline"
            className="px-4 py-2 rounded-lg border hover:bg-gray-50"
            style={{
              borderColor: "#E8EAED",
              color: "#1976D2",
            }}
          >
            Routes
          </Button>

          <Button
            variant="outline"
            className="px-4 py-2 rounded-lg border hover:bg-gray-50"
            style={{
              borderColor: "#E8EAED",
              color: "#202124",
            }}
          >
            Options
          </Button>
        </div>
      </div>
    </div>
  )
}
