"use client"

import { useEffect, useState, useCallback } from "react"
import { getBrowserClient } from "@/lib/supabase/browser"
import { Database } from "@/lib/types/supabase"
import { toast } from "@/components/ui/use-toast"

type Profile = Database['public']['Tables']['profiles']['Row']
type ParkingSpot = Database['public']['Tables']['parking_spots']['Row']

interface SpotStatistics {
  total: number
  active: number
  dailyReports: number
  uptime: number
}

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

  const [analyticsData, setAnalyticsData] = useState<Array<{
    timestamp: string
    activeSpots: number
    users: number
  }>>([])

  const supabase = getBrowserClient()

  const updateStats = useCallback((spots: ParkingSpot[]) => {
    const activeSpots = spots.filter(spot => spot.is_available === true).length

    setRealtimeData(prev => ({
      ...prev,
      spotStats: {
        ...prev.spotStats,
        total: spots.length,
        active: activeSpots,
      },
    }))

    const timestamp = new Date().toISOString()
    setAnalyticsData(prev => [
      ...prev,
      {
        timestamp,
        activeSpots,
        users: realtimeData.profiles.length,
      },
    ].slice(-50))  // Keep last 50 data points
  }, [realtimeData.profiles.length])

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [profilesResponse, spotsResponse] = await Promise.all([
          supabase.from('profiles').select('*'),
          supabase.from('parking_spots').select('*'),
        ])

        if (profilesResponse.error) throw profilesResponse.error
        if (spotsResponse.error) throw spotsResponse.error

        const profiles = profilesResponse.data || []
        const parkingSpots = spotsResponse.data || []

        setRealtimeData(prev => ({
          ...prev,
          profiles,
          parkingSpots,
        }))

        updateStats(parkingSpots)
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

    const profilesSubscription = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          console.log('Profiles change received!', payload)
          fetchInitialData()
        }
      )
      .subscribe()

    const spotsSubscription = supabase
      .channel('spots-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'parking_spots' },
        (payload) => {
          console.log('Parking spots change received!', payload)
          fetchInitialData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(profilesSubscription)
      supabase.removeChannel(spotsSubscription)
    }
  }, [supabase, updateStats])

  return { realtimeData, analyticsData }
}
