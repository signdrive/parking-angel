"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Car, Building, Square, Home, UserCheck, Truck } from 'lucide-react'
import { useAuth } from '@/components/auth/auth-provider'
import { toast } from 'sonner'

interface SpotReportDialogProps {
  open: boolean
  toggleAction: (open: boolean) => void
  location: { lat: number; lng: number; address?: string } | null
}

const SPOT_TYPES = [
  { value: 'street', label: 'Street Parking', icon: Car, description: 'Regular street parking spot' },
  { value: 'garage', label: 'Parking Garage', icon: Building, description: 'Multi-level parking garage' },
  { value: 'lot', label: 'Parking Lot', icon: Square, description: 'Surface parking lot' },
  { value: 'private', label: 'Private Parking', icon: Home, description: 'Private driveway or space' },
  { value: 'disabled', label: 'Disabled Parking', icon: UserCheck, description: 'Accessible parking spot' },
  { value: 'loading', label: 'Loading Zone', icon: Truck, description: 'Loading/unloading zone' }
]

export function SpotReportDialog({ open, toggleAction, location }: SpotReportDialogProps) {
  const { user } = useAuth()
  const [selectedSpotType, setSelectedSpotType] = useState<string>('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('Please sign in to report parking spots')
      return
    }

    if (!location) {
      toast.error('Location is required')
      return
    }

    if (!selectedSpotType) {
      toast.error('Please select a spot type')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/spots/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spot_type: selectedSpotType,
          latitude: location.lat,
          longitude: location.lng,
          address: address.trim() || null,
          notes: notes.trim() || null,
          status: 'available',
          confidence: 100
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit report')
      }

      const result = await response.json()
      
      toast.success('Parking spot reported successfully!')
      toggleAction(false)
      
      // Reset form
      setSelectedSpotType('')
      setNotes('')
      setAddress('')
      
    } catch (error) {
      console.error('Error submitting spot report:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit report')
    } finally {
      setIsSubmitting(false)
    }
  }
  if (!user) {
    return (
      <Dialog open={open} onOpenChange={toggleAction}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign In Required</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 mb-4">Please sign in to report parking spots.</p>
          <Button onClick={() => toggleAction(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={toggleAction}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Report Parking Spot
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Location Info */}
          {location && (
            <div className="bg-gray-50 p-2 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Location</p>
              <p className="text-xs font-medium">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
              {location.address && (
                <p className="text-xs text-gray-500 truncate">{location.address}</p>
              )}
            </div>
          )}

          {/* Spot Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="spot-type">What type of parking spot is this? *</Label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {SPOT_TYPES.map((type) => {
                const Icon = type.icon
                return (
                  <Card 
                    key={type.value}
                    className={`cursor-pointer transition-all ${
                      selectedSpotType === type.value 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedSpotType(type.value)}
                  >
                    <CardContent className="p-2">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${
                          selectedSpotType === type.value ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs">{type.label}</p>
                          <p className="text-xs text-gray-500 truncate">{type.description}</p>
                        </div>
                        <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${
                          selectedSpotType === type.value 
                            ? 'bg-blue-600 border-blue-600' 
                            : 'border-gray-300'
                        }`}>
                          {selectedSpotType === type.value && (
                            <div className="w-full h-full bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Address (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="address">Address (Optional)</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g., 123 Main St, City"
            />
          </div>

          {/* Notes (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional details..."
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-2 pt-2 sticky bottom-0 bg-white">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => toggleAction(false)}
              className="flex-1"
              size="sm"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !selectedSpotType}
              className="flex-1"
              size="sm"
            >
              {isSubmitting ? 'Reporting...' : 'Report Spot'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}