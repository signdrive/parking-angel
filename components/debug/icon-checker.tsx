"use client"

import { useEffect, useState } from "react"

export function IconChecker() {
  const [iconStatus, setIconStatus] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const checkIcons = async () => {
      const icons = [
        "/icon-192x192.png",
        "/icon-512x512.png",
        "/apple-touch-icon.png",
        "/favicon-32x32.png",
        "/favicon-16x16.png",
      ]

      const status: Record<string, boolean> = {}

      for (const icon of icons) {
        try {
          const response = await fetch(icon, { method: "HEAD" })
          status[icon] = response.ok
        } catch (error) {
          status[icon] = false
        }
      }

      setIconStatus(status)
    }

    checkIcons()
  }, [])

  if (process.env.NODE_ENV === "production") {
    return null // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-2 rounded text-xs z-50">
      <div className="font-bold">Icon Status:</div>
      {Object.entries(iconStatus).map(([icon, isOk]) => (
        <div key={icon} className={isOk ? "text-green-400" : "text-red-400"}>
          {icon}: {isOk ? "✓" : "✗"}
        </div>
      ))}
    </div>
  )
}
