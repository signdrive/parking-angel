import { useState, useCallback } from "react"
import { getAdminSupabaseOrThrow } from "@/lib/supabase/admin-client"
import { toast } from "@/components/ui/use-toast"
import { Profile, ParkingSpot, SystemStats } from "@/types/admin"
import { PostgrestError } from "@supabase/supabase-js"

export function useAdminOperations() {
  const [isLoading, setIsLoading] = useState(false)

  const getClient = () => {
    try {
      return getAdminSupabaseOrThrow()
    } catch (error) {
      console.error("Failed to get Supabase admin client:", error)
      toast({
        title: "Error",
        description: "Admin operations are unavailable. Supabase client failed to initialize.",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleError = useCallback((error: Error | PostgrestError | null, action: string) => {
    if (error) {
      console.error(`Error ${action}:`, error)
      toast({
        title: "Error",
        description: `Failed to ${action}. ${'message' in error ? error.message : 'Please try again.'}`,
        variant: "destructive",
      })
    }
  }, [])

  const editProfile = useCallback(async (userId: string, data: Partial<Profile>) => {
    setIsLoading(true)
    try {
      const supabase = getClient()
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', userId)
        .select()
        .single()
      
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
      const supabase = getClient()
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'suspended' })
        .eq('id', userId)

      if (error) throw error

      toast({
        title: "Success",
        description: "User status updated successfully (simulated suspension).",
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
      const supabase = getClient()
      const { data: newSpot, error } = await supabase
        .from('parking_spots')
        .insert([spot])
        .select()
        .single()
      
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

  const updateParkingSpot = useCallback(async (spotId: string, spotData: Partial<ParkingSpot>) => {
    setIsLoading(true)
    try {
      const supabase = getClient()
      const { id, created_at, last_updated, ...updateData } = spotData;

      const { data: updatedSpot, error } = await supabase
        .from('parking_spots')
        .update(updateData)
        .eq('id', spotId)
        .select()
        .single()

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
      const supabase = getClient()
      const { error } = await supabase
        .from('parking_spots')
        .delete()
        .eq('id', spotId)

      if (error) throw error

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

  const getSystemStats = useCallback(async (): Promise<SystemStats | null> => {
    setIsLoading(true);
    try {
      const supabase = getClient();
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;
      
      const stats: SystemStats = {
        totalUsers: totalUsers ?? 0,
      };

      return stats;
    } catch (error) {
      handleError(error as Error, "fetch system stats");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);


  return { 
    isLoading, 
    editProfile, 
    suspendUser, 
    addParkingSpot, 
    updateParkingSpot, 
    removeParkingSpot,
    getSystemStats 
  }
}
