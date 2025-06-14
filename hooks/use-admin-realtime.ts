"use client"

import { useEffect, useState, useCallback } from "react"
import { getAdminSupabaseOrThrow } from "@/lib/supabase/admin-client" // Updated import
import { Profile, ParkingSpot, SpotStatistics } from "@/types/admin"
import { toast } from "@/components/ui/use-toast"
import { SupabaseClient } from "@supabase/supabase-js" // Import SupabaseClient for type safety

export function useAdminRealtime() {
  const [realtimeData, setRealtimeData] = useState<{
    profiles: Profile[]
    parkingSpots: ParkingSpot[]
    spotStats: SpotStatistics
  }>({
    profiles: [],
    parkingSpots: [],
    spotStats: {
      total: 0,
      active: 0,
      dailyReports: 0,
      uptime: 99.9,
    },
  })

  const [analyticsData, setAnalyticsData] = useState<any[]>([])
  // Hold the client instance in state to ensure it's only initialized once client-side
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null)

  useEffect(() => {
    // Initialize Supabase client on the client side
    const client = getAdminSupabaseOrThrow()
    setSupabase(client)
  }, [])

  const updateStats = useCallback((spots: ParkingSpot[]) => {
    const activeSpots = spots.filter(spot => spot.status === 'active').length
    const dailyReports = spots.reduce((acc, spot) => acc + (spot.reports || 0), 0)

    setRealtimeData(prev => ({
      ...prev,
      spotStats: {
        ...prev.spotStats,
        total: spots.length,
        active: activeSpots,
        dailyReports,
      },
    }))

    // Update analytics data
    const timestamp = new Date().toISOString()
    setAnalyticsData(prev => [
      ...prev,
      {
        timestamp,
        activeSpots,
        reports: dailyReports,
        users: realtimeData.profiles.length, // This will use the latest state
      },
    ].slice(-50)) // Keep last 50 data points
  }, [realtimeData.profiles.length]) // Added realtimeData.profiles.length as a dependency

  useEffect(() => {
    if (!supabase) return // Don't run if supabase client isn't initialized

    // Initial data fetch
    const fetchInitialData = async () => {
      try {
        const [profilesResponse, spotsResponse] = await Promise.all([
          supabase.from('profiles').select('*'),
          supabase.from('parking_spots').select('*'),
        ])

        if (profilesResponse.error) throw profilesResponse.error
        if (spotsResponse.error) throw spotsResponse.error

        const profiles = profilesResponse.data as Profile[] || []
        const parkingSpots = spotsResponse.data as ParkingSpot[] || []

        setRealtimeData(prev => ({
          ...prev,
          profiles: profiles,
          parkingSpots: parkingSpots,
        }))

        updateStats(parkingSpots) // Call updateStats with the fetched spots
      } catch (error) {
        console.error('Error fetching initial data:', error)
        toast({
          title: "Error",
          description: "Failed to fetch real-time data",
          variant: "destructive",
        })
      }
    }

    fetchInitialData()

    // Set up real-time subscriptions
    const profilesSubscription = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        async (payload) => {
          // Re-fetch all profiles to ensure consistency, or handle payload directly
          const { data: profiles, error } = await supabase.from('profiles').select('*')
          if (error) {
            console.error('Error fetching profiles after change:', error)
            toast({ title: "Error", description: "Failed to update user list.", variant: "destructive" })
            return
          }
          setRealtimeData(prev => ({
            ...prev,
            profiles: (profiles as Profile[]) || [],
          }))
          // Note: updateStats is not directly called here as profile changes don't directly affect spot stats
          // However, if user count is part of spotStats or analytics, it will be updated via updateStats's dependency on realtimeData.profiles.length
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error('Profiles subscription error:', err)
          toast({ title: "Real-time Error", description: "User data updates might be delayed.", variant: "destructive"})
        }
      })

    const spotsSubscription = supabase
      .channel('spots-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'parking_spots' },
        async (payload) => {
          // Re-fetch all spots to ensure consistency
          const { data: spots, error } = await supabase.from('parking_spots').select('*')
          if (error) {
            console.error('Error fetching parking spots after change:', error)
            toast({ title: "Error", description: "Failed to update parking spot list.", variant: "destructive" })
            return
          }
          const updatedSpots = (spots as ParkingSpot[]) || []
          setRealtimeData(prev => ({
            ...prev,
            parkingSpots: updatedSpots,
          }))
          updateStats(updatedSpots) // Call updateStats with the new spots
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error('Parking spots subscription error:', err)
          toast({ title: "Real-time Error", description: "Parking spot updates might be delayed.", variant: "destructive"})
        }
      })

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(profilesSubscription)
      supabase.removeChannel(spotsSubscription)
    }
  }, [supabase, updateStats]) // Added supabase to dependency array

  return {
    ...realtimeData,
    analyticsData,
  }
}
