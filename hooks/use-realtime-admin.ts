import { useEffect, useState, useCallback, useRef } from 'react'
import { getAdminSupabaseOrThrow } from '@/lib/supabase/admin-client' // Changed import
import type { Profile, ParkingSpot, SpotStatistics } from '@/types/admin'
import { toast } from '@/components/ui/use-toast'
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'

export function useRealtimeAdmin() {
  const [realtimeProfiles, setRealtimeProfiles] = useState<Profile[]>([])
  const [realtimeSpots, setRealtimeSpots] = useState<ParkingSpot[]>([])
  const [stats, setStats] = useState<SpotStatistics>({
    total: 0,
    active: 0,
    dailyReports: 0,
    uptime: 99.9, // Placeholder
  })
  const [isLoading, setIsLoading] = useState(true)
  const supabaseClientRef = useRef<SupabaseClient | null>(null); // Ref to hold the client

  // Initialize Supabase client on mount (client-side)
  useEffect(() => {
    try {
      supabaseClientRef.current = getAdminSupabaseOrThrow();
    } catch (error) {

      toast({
        title: "Realtime Error",
        description: "Failed to connect for real-time updates.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }, []);

  const calculateStats = useCallback((spots: ParkingSpot[]) => {
    const activeSpots = spots.filter(spot => spot.status === 'active').length
    const dailyReports = spots.reduce((acc, spot) => acc + (spot.reports || 0), 0);
    setStats({
      total: spots.length,
      active: activeSpots,
      dailyReports: dailyReports,
      uptime: 99.9, // This could be calculated from actual monitoring data
    })
  }, [])

  const fetchInitialData = useCallback(async () => {
    if (!supabaseClientRef.current) {
      setIsLoading(false); // Stop loading if client is not available
      return;
    }
    setIsLoading(true)
    try {
      const supabase = supabaseClientRef.current;
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
      
      if (profilesError) throw profilesError
      if (profilesData) setRealtimeProfiles(profilesData as Profile[])

      const { data: spotsData, error: spotsError } = await supabase
        .from('parking_spots')
        .select('*')
      
      if (spotsError) throw spotsError
      if (spotsData) {
        const typedSpotsData = spotsData as ParkingSpot[];
        setRealtimeSpots(typedSpotsData)
        calculateStats(typedSpotsData)
      }
    } catch (error) {

      toast({
        title: "Error",
        description: `Failed to fetch admin data. ${error instanceof Error ? error.message : ''}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [calculateStats])


  useEffect(() => {
    if (!supabaseClientRef.current) return; // Don't proceed if client isn't initialized

    fetchInitialData(); // Fetch initial data once client is available

    const supabase = supabaseClientRef.current;
    let profilesChannel: RealtimeChannel | undefined;
    let spotsChannel: RealtimeChannel | undefined;

    // Profiles subscription
    profilesChannel = supabase
      .channel('admin-realtime-profiles')
      .on<Profile>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {

          // Refetch all profiles for simplicity, or implement more granular updates
          fetchInitialData(); 
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {

        }
        if (status === 'CHANNEL_ERROR' || err) {

          toast({ title: "Realtime Error", description: "Profile updates might be delayed.", variant: "destructive"})
        }
      });

    // Parking spots subscription
    spotsChannel = supabase
      .channel('admin-realtime-parking-spots')
      .on<ParkingSpot>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'parking_spots' },
        (payload) => {

          // Refetch all spots for simplicity
          fetchInitialData();
        }
      )
      .subscribe((status, err) => {
         if (status === 'SUBSCRIBED') {

        }
        if (status === 'CHANNEL_ERROR' || err) {

          toast({ title: "Realtime Error", description: "Parking spot updates might be delayed.", variant: "destructive"})
        }
      });

    return () => {
      if (profilesChannel) supabase.removeChannel(profilesChannel)
      if (spotsChannel) supabase.removeChannel(spotsChannel)
    }
  }, [fetchInitialData]); // Rerun effect if fetchInitialData (and thus supabaseClientRef.current) changes

  const refresh = useCallback(() => {
    if (supabaseClientRef.current) { // Ensure client is available before refreshing
        fetchInitialData();
    } else {

        toast({
            title: "Info",
            description: "Real-time connection not yet established. Please wait.",
            variant: "default",
        });
    }
  }, [fetchInitialData]);

  return { 
    realtimeProfiles, 
    realtimeSpots, 
    stats, 
    isLoading,
    refresh
  }
}
