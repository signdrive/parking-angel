"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/components/auth/auth-provider"
import { MapPin } from "lucide-react"

interface SpotReportDialogProps {
  open: boolean
  toggleAction: (open: boolean) => void
  location: { lat: number; lng: number } | null
}

export function SpotReportDialog({ open, toggleAction, location }: SpotReportDialogProps) {
  const { user } = useAuth()
  const [spotType, setSpotType] = useState<string>("")
  const [address, setAddress] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!location || !user) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/spots/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude: location.lat,
          longitude: location.lng,
          spotType: spotType || "street",
          address,
          notes,        }),
      })

      if (!response.ok) {
        throw new Error("Failed to report parking spot")
      }

      setSuccess(true)
      setTimeout(() => {
        toggleAction(false)
        setSuccess(false)
        setSpotType("")
        setAddress("")
        setNotes("")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to report spot")
    } finally {
      setLoading(false)
    }
  }
  if (!user) {
    return (      <Dialog open={open} onOpenChange={toggleAction}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign In Required</DialogTitle>
            <DialogDescription>Please sign in to report parking spots.</DialogDescription>
          </DialogHeader>
          <Button onClick={() => toggleAction(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    )
  }
  return (
    <Dialog open={open} onOpenChange={toggleAction}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Report Parking Spot
          </DialogTitle>
          <DialogDescription>Help other drivers by reporting an available parking spot.</DialogDescription>
        </DialogHeader>

        {success ? (
          <Alert>
            <AlertDescription>
              Parking spot reported successfully! Thank you for helping the community.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="spotType">Spot Type</Label>
              <Select value={spotType} onValueChange={setSpotType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select spot type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="street">Street Parking</SelectItem>
                  <SelectItem value="garage">Parking Garage</SelectItem>
                  <SelectItem value="lot">Parking Lot</SelectItem>
                  <SelectItem value="meter">Metered Parking</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address (Optional)</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g., 123 Main St"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional details about this spot..."
                disabled={loading}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => toggleAction(false)}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Reporting..." : "Report Spot"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}