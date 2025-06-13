"use client"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MapPin, Bookmark, History, Settings, Bot, ChevronLeft, ChevronRight, LogOut, User, Shield } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { usePersistentState } from "@/hooks/use-persistent-state"
import { useMemo } from "react"

interface CollapsibleSidebarProps {
  activeTab: string
  onTabChangeAction: (tab: string) => void
  className?: string
}

const sidebarItems = [
  {
    id: "map",
    label: "Live Map",
    description: "Real-time parking view",
    icon: MapPin,
  },
  {
    id: "saved",
    label: "Saved Locations",
    description: "Your favorite spots",
    icon: Bookmark,
  },
  {
    id: "history",
    label: "History",
    description: "Past parking sessions",
    icon: History,
  },
  {
    id: "settings",
    label: "Settings",
    description: "App preferences",
    icon: Settings,
  },
  {
    id: "ai",
    label: "AI Assistant",
    description: "Smart parking help",
    icon: Bot,
  },
]

const adminEmails = [
  "admin@parkalgo.com",
  "your-email@example.com", // Replace with your actual email
  // Add more admin emails as needed
]

export function CollapsibleSidebar({ activeTab, onTabChangeAction, className }: CollapsibleSidebarProps) {
  const { user, signOut } = useAuth()
  const [isCollapsed, setIsCollapsed] = usePersistentState("sidebarCollapsed", false)

  // Admin check (same as /admin/page.tsx)
  const isAdmin = useMemo(() => {
    return (
      user?.user_metadata?.role === "admin" ||
      adminEmails.includes(user?.email || "")
    )
  }, [user])

  return (
    <div
      className={cn(
        "h-full bg-gray-900 text-white transition-all duration-300 ease-in-out relative",
        isCollapsed ? "w-16" : "w-64",
        className,
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <MapPin className="w-6 h-6 text-blue-400" />
              <span className="font-bold text-lg">Park Algo</span>
            </div>
          )}
          {isCollapsed && (
            <div className="flex justify-center w-full">
              <MapPin className="w-6 h-6 text-blue-400" />
            </div>
          )}
        </div>

        {!isCollapsed && (
          <div className="mt-2 flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400 font-medium">AI</span>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-blue-400 font-medium">LIVE</span>
          </div>
        )}
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
              onClick={() => onTabChangeAction(item.id)}
              className={cn(
                "w-full justify-start text-left transition-colors",
                isActive
                  ? "bg-blue-600 text-white hover:bg-blue-700"
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
              {isActive && item.id === "ai" && !isCollapsed && (
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              )}
            </Button>
          )
        })}
        {/* Admin Sidebar Item */}
        {isAdmin && (
          <Button
            key="admin"
            variant="ghost"
            onClick={() => (window.location.href = "/admin")}
            className={cn(
              "w-full justify-start text-left transition-colors bg-red-700 hover:bg-red-800 text-white font-semibold",
              isCollapsed ? "px-2" : "px-3 mt-2",
            )}
          >
            <Shield className={cn("w-5 h-5", isCollapsed ? "mx-auto" : "mr-3")}/>
            {!isCollapsed && (
              <div className="flex-1">
                <div className="font-medium">Admin</div>
                <div className="text-xs opacity-70">Admin Dashboard</div>
              </div>
            )}
          </Button>
        )}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-700">
        {user && (
          <div className={cn("mb-4", isCollapsed && "text-center")}>
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {user.user_metadata?.full_name || user.email?.split("@")[0] || "User"}
                  </div>
                  <div className="text-xs text-gray-400 truncate">{user.email}</div>
                </div>
              </div>
            )}
            {isCollapsed && (
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        )}

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
