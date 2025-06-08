"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface Version {
  id: number
  version: string
}

// Simple list of versions from 130 to 175
const versions: Version[] = Array.from({ length: 46 }, (_, i) => ({
  id: 130 + i,
  version: `v${Math.floor((130 + i) / 10)}.${(130 + i) % 10}`,
}))

export default function VersionList() {
  const [currentVersion, setCurrentVersion] = useState<number | null>(null)
  const [restoring, setRestoring] = useState<number | null>(null)

  const handleRestore = async (versionId: number) => {
    setRestoring(versionId)
    // Simulate restore process
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setCurrentVersion(versionId)
    setRestoring(null)
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Available Versions (130-175)</h1>
      <p className="mb-6">Select a version to restore and test</p>

      {currentVersion && (
        <div className="p-3 bg-green-100 text-green-800 rounded-md mb-4">
          Currently running version {versions.find((v) => v.id === currentVersion)?.version} (ID: {currentVersion})
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {versions.map((version) => (
          <div
            key={version.id}
            className={`border rounded-md p-4 ${currentVersion === version.id ? "border-green-500 bg-green-50" : ""}`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{version.version}</span>
              <span className="text-sm text-gray-500">ID: {version.id}</span>
            </div>
            <Button
              onClick={() => handleRestore(version.id)}
              disabled={restoring === version.id}
              className="w-full"
              variant={currentVersion === version.id ? "outline" : "default"}
            >
              {restoring === version.id
                ? "Restoring..."
                : currentVersion === version.id
                  ? "Current Version"
                  : "Restore"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
