"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ParkingSpot } from "@/types/admin"
import { toast } from "@/components/ui/use-toast"

const parkingSpotSchema = z.object({
  location_name: z.string().min(3, "Location name must be at least 3 characters"),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  type: z.enum(["street", "garage", "lot"]),
  status: z.enum(["active", "inactive", "occupied", "maintenance"]).default("active"),
})

type ParkingSpotFormData = z.infer<typeof parkingSpotSchema>

interface ParkingSpotFormProps {
  isOpen: boolean
  onCloseAction: () => void
  onSubmitAction: (data: ParkingSpotFormData) => Promise<void>
  initialData?: Partial<ParkingSpot>
}

export function ParkingSpotForm({ isOpen, onCloseAction, onSubmitAction, initialData }: ParkingSpotFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ParkingSpotFormData>({
    resolver: zodResolver(parkingSpotSchema),
    defaultValues: {
      location_name: initialData?.location_name || "",
      coordinates: initialData?.coordinates || { lat: 0, lng: 0 },
      type: initialData?.type || "street",
      status: initialData?.status || "active",    },
  })
    const handleFormSubmit = async (data: ParkingSpotFormData) => {
    try {
      await onSubmitAction(data)
      reset()
      onCloseAction()
      toast({
        title: "Success",
        description: initialData ? "Parking spot updated successfully" : "New parking spot added successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save parking spot. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onCloseAction}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Parking Spot" : "Add New Parking Spot"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit as any)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Location Name</label>
            <Input
              {...register("location_name")}
              placeholder="Enter location name"
            />
            {errors.location_name && (
              <p className="text-sm text-red-500">{errors.location_name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Latitude</label>
              <Input
                type="number"
                step="any"
                {...register("coordinates.lat", { valueAsNumber: true })}
                placeholder="Enter latitude"
              />
              {errors.coordinates?.lat && (
                <p className="text-sm text-red-500">{errors.coordinates.lat.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Longitude</label>
              <Input
                type="number"
                step="any"
                {...register("coordinates.lng", { valueAsNumber: true })}
                placeholder="Enter longitude"
              />
              {errors.coordinates?.lng && (
                <p className="text-sm text-red-500">{errors.coordinates.lng.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <select
              {...register("type")}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="street">Street</option>
              <option value="garage">Garage</option>
              <option value="lot">Lot</option>
            </select>
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <select
              {...register("status")}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {errors.status && (
              <p className="text-sm text-red-500">{errors.status.message}</p>
            )}
          </div>          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onCloseAction}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : initialData ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
