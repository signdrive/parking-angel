"use client"

import { useState, useEffect } from "react"

export default function TestIconsPage() {
  const [iconStatus, setIconStatus] = useState<Record<string, string>>({})

  const icons = [
    "/icon-192x192.png",
    "/icon-512x512.png",
    "/apple-touch-icon.png",
    "/favicon-32x32.png",
    "/favicon-16x16.png",
    "/favicon.ico",
    "/manifest.json",
  ]

  useEffect(() => {
    const testIcons = async () => {
      const results: Record<string, string> = {}

      for (const icon of icons) {
        try {
          const response = await fetch(icon)
          results[icon] = response.ok ? "✅ OK" : `❌ ${response.status}`
        } catch (error) {
          results[icon] = `❌ Error: ${error}`
        }
      }

      setIconStatus(results)
    }

    testIcons()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Icon Test Page</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Icon Status</h2>
          <div className="space-y-2">
            {icons.map((icon) => (
              <div key={icon} className="flex items-center justify-between p-2 border rounded">
                <span className="font-mono text-sm">{icon}</span>
                <span className={iconStatus[icon]?.includes("✅") ? "text-green-600" : "text-red-600"}>
                  {iconStatus[icon] || "Testing..."}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Icon Preview</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {icons
              .filter((icon) => icon.endsWith(".png") || icon.endsWith(".ico"))
              .map((icon) => (
                <div key={icon} className="text-center p-4 border rounded">
                  <img src={icon || "/placeholder.svg"} alt={icon} className="w-16 h-16 mx-auto mb-2" />
                  <p className="text-sm font-mono">{icon}</p>
                </div>
              ))}
          </div>
        </div>

        <div className="mt-8">
          <a href="/dashboard" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
