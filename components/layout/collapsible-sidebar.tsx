"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  MapPin,
  Bookmark,
  Clock,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut,
  Shield,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  className?: string
}

const menuItems = [
  { id: "map", label: "Live Map", icon: MapPin, description: "Real-time parking view" },
  { id: "saved", label: "Saved Locations", icon: Bookmark, description: "Your favorite spots" },
  { id: "history", label: "History", icon: Clock, description: "Past parking sessions" },
  { id: "settings", label: "Settings", icon: Settings, description: "App preferences" },
  { id: "ai", label: "AI Assistant", icon: Sparkles, description: "Smart parking help", highlighted: true },
]

export function CollapsibleSidebar({ activeTab, onTabChange, className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { user, signOut } = useAuth()

  const getUserDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"
  }

  const isAdmin = user?.user_metadata?.role === "admin" || user?.email === "admin@parkalgo.com"

  return (
    <div
      className={cn(
        "bg-gray-900 text-white transition-all duration-300 ease-in-out flex flex-col",
        isCollapsed ? "w-16" : "w-64",
        className,
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <MapPin className="w-8 h-8 text-blue-400" />
              <div>
                <span className="text-lg font-bold">Parking Angel</span>
                <div className="flex items-center gap-1 mt-1">
                  <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                    AI
                  </span>
                  <span className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                    LIVE
                  </span>
                </div>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "w-full justify-start text-left transition-all duration-200",
                isCollapsed ? "px-2" : "px-3",
                activeTab === item.id
                  ? item.highlighted
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                    : "bg-gray-800 text-white"
                  : "text-gray-300 hover:text-white hover:bg-gray-800",
                item.highlighted && activeTab !== item.id && "border border-purple-500/30",
              )}
              onClick={() => onTabChange(item.id)}
            >
              <item.icon className={cn("w-5 h-5", isCollapsed ? "mx-auto" : "mr-3")} />
              {!isCollapsed && (
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-400">{item.description}</div>
                </div>
              )}
              {item.highlighted && !isCollapsed && <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />}
            </Button>
          ))}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-800">
        {!isCollapsed ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{getUserDisplayName()}</div>
                <div className="text-xs text-gray-400 truncate">{user?.email}</div>
              </div>
            </div>

            <div className="flex gap-2">
              {isAdmin && (
                <Button variant="outline" size="sm" className="flex-1 text-xs" asChild>
                  <Link href="/admin">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </Link>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs text-gray-300 border-gray-600 hover:bg-gray-800"
                onClick={signOut}
              >
                <LogOut className="w-3 h-3 mr-1" />
                Sign Out
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Button variant="ghost" size="icon" className="w-full text-gray-400 hover:text-white hover:bg-gray-800">
              <User className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-full text-gray-400 hover:text-white hover:bg-gray-800"
              onClick={signOut}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
