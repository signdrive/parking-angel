"use client"

import { CollapsibleSidebar } from "@/components/layout/collapsible-sidebar"
import { FloatingAIChat } from "@/components/ai/floating-ai-chat"
import { NaviCoreProInterface } from "./navicore-pro-interface"
import type { NavigationDestination } from "@/lib/navigation-store"

interface NavigationLayoutProps {
  onExit: () => void
  destination: NavigationDestination | null
}

export function NavigationLayout({ onExit, destination }: NavigationLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <CollapsibleSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 relative">
          <NaviCoreProInterface onExit={onExit} destination={destination} />
        </div>
      </main>
      <FloatingAIChat />
    </div>
  )
}
