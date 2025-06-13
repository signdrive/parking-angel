import { useState, useCallback } from "react"
import { AdminService } from "@/lib/admin-service"
import { toast } from "@/components/ui/use-toast"
import { Profile, ParkingSpot } from "@/types/admin"

export function useAdminOperations() {
  const [isLoading, setIsLoading] = useState(false)
  const adminService = AdminService.getInstance()

  const handleError = useCallback((error: Error | null, action: string) => {
    if (error) {
      console.error(`Error ${action}:`, error)
      toast({
        title: "Error",
        description: `Failed to ${action}. Please try again.`,
        variant: "destructive",
      })
    }
  }, [])

  const editProfile = useCallback(async (userId: string, data: Partial<Profile>) => {
    setIsLoading(true)
    try {
      const { data: updatedProfile, error } = await adminService.updateUserProfile(userId, data)
      if (error) throw error
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
      return updatedProfile
    } catch (error) {
      handleError(error as Error, "update profile")
      return null
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  const suspendUser = useCallback(async (userId: string) => {
    setIsLoading(true)
    try {
      const { success, error } = await adminService.suspendUser(userId)
      if (!success || error) throw error

      toast({
        title: "Success",
        description: "User suspended successfully",
      })
      return true
    } catch (error) {
      handleError(error as Error, "suspend user")
      return false
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  const addParkingSpot = useCallback(async (spot: Omit<ParkingSpot, "id" | "created_at" | "last_updated">) => {
    setIsLoading(true)
    try {
      const { data: newSpot, error } = await adminService.addParkingSpot(spot)
      if (error) throw error

      toast({
        title: "Success",
        description: "Parking spot added successfully",
      })
      return newSpot
    } catch (error) {
      handleError(error as Error, "add parking spot")
      return null
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  const updateParkingSpot = useCallback(async (spotId: string, data: Partial<ParkingSpot>) => {
    setIsLoading(true)
    try {
      const { data: updatedSpot, error } = await adminService.updateParkingSpot(spotId, data)
      if (error) throw error

      toast({
        title: "Success",
        description: "Parking spot updated successfully",
      })
      return updatedSpot
    } catch (error) {
      handleError(error as Error, "update parking spot")
      return null
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  const removeParkingSpot = useCallback(async (spotId: string) => {
    setIsLoading(true)
    try {
      const { success, error } = await adminService.removeParkingSpot(spotId)
      if (!success || error) throw error

      toast({
        title: "Success",
        description: "Parking spot removed successfully",
      })
      return true
    } catch (error) {
      handleError(error as Error, "remove parking spot")
      return false
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  const getSystemStats = useCallback(async () => {
    setIsLoading(true)
    try {
      const stats = await adminService.getSystemStats()
      if (stats.error) throw stats.error
      return stats
    } catch (error) {
      handleError(error as Error, "fetch system stats")
      return null
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  return {
    isLoading,
    editProfile,
    suspendUser,
    addParkingSpot,
    updateParkingSpot,
    removeParkingSpot,
    getSystemStats,
  }
}
