"use client"

import { useEffect, useState, useCallback } from "react"
import { adminSupabase } from "@/lib/supabase/admin-client"
import { Profile, ParkingSpot, SpotStatistics } from "@/types/admin"
import { toast } from "@/components/ui/use-toast"

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
        users: realtimeData.profiles.length,
      },
    ].slice(-50)) // Keep last 50 data points
  }, [realtimeData.profiles.length])

  useEffect(() => {
    // Initial data fetch
    const fetchInitialData = async () => {
      try {
        const [profilesResponse, spotsResponse] = await Promise.all([
          adminSupabase.from('profiles').select('*'),
          adminSupabase.from('parking_spots').select('*'),
        ])

        if (profilesResponse.error) throw profilesResponse.error
        if (spotsResponse.error) throw spotsResponse.error

        setRealtimeData(prev => ({
          ...prev,
          profiles: profilesResponse.data || [],
          parkingSpots: spotsResponse.data || [],
        }))

        if (spotsResponse.data) {
          updateStats(spotsResponse.data)
        }
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
    const profilesSubscription = adminSupabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        async (payload) => {
          const { data: profiles } = await adminSupabase.from('profiles').select('*')
          setRealtimeData(prev => ({
            ...prev,
            profiles: profiles || [],
          }))
        }
      )
      .subscribe()

    const spotsSubscription = adminSupabase
      .channel('spots-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'parking_spots' },
        async (payload) => {
          const { data: spots } = await adminSupabase.from('parking_spots').select('*')
          setRealtimeData(prev => ({
            ...prev,
            parkingSpots: spots || [],
          }))
          if (spots) {
            updateStats(spots)
          }
        }
      )
      .subscribe()

    // Cleanup subscriptions
    return () => {
      profilesSubscription.unsubscribe()
      spotsSubscription.unsubscribe()
    }
  }, [updateStats])

  return {
    ...realtimeData,
    analyticsData,
  }
}
