import { getAdminSupabaseOrThrow } from "./supabase/admin-client" // Updated import
import { Profile, ParkingSpot } from "@/types/admin"

export class AdminService {
  private static instance: AdminService
  private constructor() {}

  static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService()
    }
    return AdminService.instance
  }

  private getSupabaseClient() {
    return getAdminSupabaseOrThrow()
  }

  async updateUserProfile(userId: string, data: Partial<Profile>): Promise<{ data: Profile | null; error: Error | null }> {
    try {
      const supabase = this.getSupabaseClient()
      const { data: updatedProfile, error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", userId)
        .select()
        .single()

      if (error) throw error
      return { data: updatedProfile as Profile, error: null }
    } catch (error) {
      console.error("Error updating user profile:", error)
      return { data: null, error: error as Error }
    }
  }

  async suspendUser(userId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const supabase = this.getSupabaseClient()
      const { error } = await supabase
        .from("profiles")
        .update({ status: "suspended" })
        .eq("id", userId)

      if (error) throw error
      return { success: true, error: null }
    } catch (error) {
      console.error("Error suspending user:", error)
      return { success: false, error: error as Error }
    }
  }

  async addParkingSpot(spot: Omit<ParkingSpot, "id" | "created_at" | "last_updated">): Promise<{ data: ParkingSpot | null; error: Error | null }> {
    try {
      const supabase = this.getSupabaseClient()
      const { data, error } = await supabase
        .from("parking_spots")
        .insert([spot])
        .select()
        .single()

      if (error) throw error
      return { data: data as ParkingSpot, error: null }
    } catch (error) {
      console.error("Error adding parking spot:", error)
      return { data: null, error: error as Error }
    }
  }

  async updateParkingSpot(spotId: string, data: Partial<ParkingSpot>): Promise<{ data: ParkingSpot | null; error: Error | null }> {
    try {
      const supabase = this.getSupabaseClient()
      const { data: updatedSpot, error } = await supabase
        .from("parking_spots")
        .update(data)
        .eq("id", spotId)
        .select()
        .single()

      if (error) throw error
      return { data: updatedSpot as ParkingSpot, error: null }
    } catch (error) {
      console.error("Error updating parking spot:", error)
      return { data: null, error: error as Error }
    }
  }

  async removeParkingSpot(spotId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const supabase = this.getSupabaseClient()
      const { error } = await supabase
        .from("parking_spots")
        .delete()
        .eq("id", spotId)

      if (error) throw error
      return { success: true, error: null }
    } catch (error) {
      console.error("Error removing parking spot:", error)
      return { success: false, error: error as Error }
    }
  }

  async getSystemStats(): Promise<{ 
    totalUsers: number;
    activeSpots: number;
    dailyReports: number;
    uptime: number;
    error: Error | null;
  }> {
    try {
      const supabase = this.getSupabaseClient()
      const [
        { count: totalUsers, error: usersError },
        { count: activeSpots, error: spotsError },
        { count: dailyReports, error: reportsError }
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("parking_spots").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("spot_reports").select("*", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      ])

      if (usersError) throw usersError;
      if (spotsError) throw spotsError;
      if (reportsError) throw reportsError;

      return {
        totalUsers: totalUsers || 0,
        activeSpots: activeSpots || 0,
        dailyReports: dailyReports || 0,
        uptime: 99.9, // This could be calculated from actual monitoring data
        error: null
      }
    } catch (error) {
      console.error("Error fetching system stats:", error)
      return {
        totalUsers: 0,
        activeSpots: 0,
        dailyReports: 0,
        uptime: 0,
        error: error as Error
      }
    }
  }
}
