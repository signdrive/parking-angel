import { useEffect, useState, useCallback, useRef } from 'react'
import { getAdminSupabase } from '@/lib/supabase/admin-client'
import type { Profile, ParkingSpot, SpotStatistics } from '@/types/admin'
import { toast } from '@/components/ui/use-toast'
import type { RealtimeChannel } from '@supabase/supabase-js'

export function useRealtimeAdmin() {
  const [realtimeProfiles, setRealtimeProfiles] = useState<Profile[]>([])
  const [realtimeSpots, setRealtimeSpots] = useState<ParkingSpot[]>([])
  const [stats, setStats] = useState<SpotStatistics>({
    total: 0,
    active: 0,
    dailyReports: 0,
    uptime: 99.9,
  })
  const [isLoading, setIsLoading] = useState(true)

  // Calculate statistics whenever spots change
  const calculateStats = useCallback((spots: ParkingSpot[]) => {
    const activeSpots = spots.filter(spot => spot.status === 'active').length
    setStats({
      total: spots.length,
      active: activeSpots,
      dailyReports: spots.reduce((acc, spot) => acc + (spot.reports || 0), 0),
      uptime: 99.9 // This could be calculated from actual monitoring data
    })
  }, [])
  const fetchInitialData = useCallback(async () => {
    setIsLoading(true)
    try {
      const supabase = getAdminSupabase()
      if (!supabase) {
        throw new Error("Failed to initialize admin connection")
      }
      
      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
      
      if (profilesError) throw profilesError
      
      if (profilesData) {
        setRealtimeProfiles(profilesData)
      }

      // Fetch parking spots
      const { data: spotsData, error: spotsError } = await supabase
        .from('parking_spots')
        .select('*')
      
      if (spotsError) throw spotsError
      
      if (spotsData) {
        setRealtimeSpots(spotsData as ParkingSpot[])
        calculateStats(spotsData as ParkingSpot[])
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
      toast({
        title: "Error",
        description: "Failed to fetch admin data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [calculateStats])

interface RealtimeAdminReturn {
    realtimeProfiles: Profile[];
    realtimeSpots: ParkingSpot[];
    stats: SpotStatistics;
    isLoading: boolean;
    refresh: () => void;
}

interface Payload<T = any> {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE' | string;
    new: T;
    old: T;
}

const refresh: () => void = useCallback(() => {
    fetchInitialData()
}, [fetchInitialData])

useEffect(() => {
    let isMounted: boolean = true
    const profilesChannelRef: React.MutableRefObject<RealtimeChannel | null> = useRef<RealtimeChannel | null>(null)
    const spotsChannelRef: React.MutableRefObject<RealtimeChannel | null> = useRef<RealtimeChannel | null>(null)
    
    const supabase = getAdminSupabase()
    if (!supabase) {
        setIsLoading(false)
        toast({
            title: "Error",
            description: "Failed to initialize admin connection. Please try again later.",
            variant: "destructive",
        })
        return
    }

    const setupSubscriptions = async (): Promise<void> => {
        if (!isMounted) return

        // First fetch initial data
        await fetchInitialData()

        // Then set up realtime subscriptions
        profilesChannelRef.current = supabase
            .channel('profiles-changes')
            .on(
                'postgres_changes' as any,
                {
                    event: '*',
                    schema: 'public',
                    table: 'profiles'
                },
                (payload: Payload<Profile>) => {
                    if (!isMounted) return

                    setRealtimeProfiles((prev: Profile[]) => {
                        if (payload.eventType === 'INSERT') {
                            return [...prev, payload.new as Profile]
                        } else if (payload.eventType === 'DELETE') {
                            return prev.filter(profile => profile.id !== payload.old.id)
                        } else if (payload.eventType === 'UPDATE') {
                            return prev.map(profile => 
                                profile.id === payload.new.id ? { ...profile, ...payload.new } : profile
                            )
                        }
                        return prev
                    })
                }
            )
            .subscribe()

        spotsChannelRef.current = supabase
            .channel('spots-changes')
            .on(
                'postgres_changes' as any,
                {
                    event: '*',
                    schema: 'public',
                    table: 'parking_spots'
                },
                (payload: Payload<ParkingSpot>) => {
                    if (!isMounted) return

                    setRealtimeSpots((prev: ParkingSpot[]) => {
                        let newSpots: ParkingSpot[]
                        if (payload.eventType === 'INSERT') {
                            newSpots = [...prev, payload.new as ParkingSpot]
                        } else if (payload.eventType === 'DELETE') {
                            newSpots = prev.filter(spot => spot.id !== payload.old.id)
                        } else if (payload.eventType === 'UPDATE') {
                            newSpots = prev.map(spot => 
                                spot.id === payload.new.id ? { ...spot, ...payload.new } : spot
                            )
                        } else {
                            newSpots = prev
                        }
                        // Calculate new stats after spots change
                        calculateStats(newSpots)
                        return newSpots
                    })
                }
            )
            .subscribe()
    }

    setupSubscriptions()
    // Cleanup function
    return () => {
        isMounted = false
        if (profilesChannelRef.current) {
            supabase.removeChannel(profilesChannelRef.current)
            profilesChannelRef.current = null
        }
        if (spotsChannelRef.current) {
            supabase.removeChannel(spotsChannelRef.current)
            spotsChannelRef.current = null
        }
    }
}, [fetchInitialData, calculateStats])

  return {
    realtimeProfiles,
    realtimeSpots,
    stats,
    isLoading,
    refresh,
  }
}
