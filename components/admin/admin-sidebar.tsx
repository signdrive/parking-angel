"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  Users,
  MapPin,
  Globe,
  Shield,
  Settings,
  FileText,
  Activity,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useState } from "react"

interface AdminSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const sidebarItems = [
  {
    id: "overview",
    label: "Overview",
    icon: BarChart3,
    description: "Dashboard overview",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: Activity,
    description: "Real-time analytics",
  },
  {
    id: "users",
    label: "Users",
    icon: Users,
    description: "User management",
  },
  {
    id: "spots",
    label: "Parking Spots",
    icon: MapPin,
    description: "Spot management",
  },
  {
    id: "locations",
    label: "Locations",
    icon: Globe,
    description: "Location tracking",
  },
  {
    id: "security",
    label: "Security",
    icon: Shield,
    description: "Security center",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    description: "System settings",
  },
  {
    id: "reports",
    label: "Reports",
    icon: FileText,
    description: "Generate reports",
  },
]

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const { signOut } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className={cn(
        "bg-gray-900 text-white transition-all duration-300 ease-in-out relative",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-red-400" />
              <span className="font-bold text-lg">Admin Panel</span>
            </div>
          )}
          {isCollapsed && (
            <div className="flex justify-center w-full">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
          )}
        </div>
      </div>

      {/* Collapse/Expand Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-4 -right-4 z-10 bg-gray-800 border border-gray-600 hover:bg-gray-700 h-8 w-8 rounded-full text-white"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </Button>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full justify-start text-left transition-colors",
                isActive
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "text-gray-300 hover:text-white hover:bg-gray-800",
                isCollapsed ? "px-2" : "px-3",
              )}
            >
              <Icon className={cn("w-5 h-5", isCollapsed ? "mx-auto" : "mr-3")} />
              {!isCollapsed && (
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs opacity-70">{item.description}</div>
                </div>
              )}
            </Button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <Button
          variant="ghost"
          onClick={signOut}
          className={cn(
            "w-full text-gray-300 hover:text-white hover:bg-gray-800",
            isCollapsed ? "px-2" : "justify-start",
          )}
        >
          <LogOut className={cn("w-4 h-4", isCollapsed ? "mx-auto" : "mr-2")} />
          {!isCollapsed && "Sign Out"}
        </Button>
      </div>
    </div>
  )
}
