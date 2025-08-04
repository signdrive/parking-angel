"use client"

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from "react"
import { AuthContextType } from '@/lib/types/supabase-helpers';
import { useAuth } from "@/hooks/use-auth"
import { getBrowserClient } from "@/lib/supabase/browser"
import { Profile, ParkingSpot } from "@/lib/types/supabase-helpers"
import { AdminUsersList, AdminSpotsTable } from "@/components/admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const router = useRouter()
  const { user, profile } = useAuth() as AuthContextType;
  const [users, setUsers] = useState<Profile[]>([])
  const [spots, setSpots] = useState<ParkingSpot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = getBrowserClient()

  const loadAdminData = useCallback(async () => {
    try {
      setLoading(true)
      const [usersResponse, spotsResponse] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('parking_spots').select('*').order('created_at', { ascending: false })
      ])

      if (usersResponse.error) throw usersResponse.error
      if (spotsResponse.error) throw spotsResponse.error

      setUsers(usersResponse.data as Profile[])
      setSpots(spotsResponse.data as ParkingSpot[])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load admin data'))
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Check admin access and load data
  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (profile?.role !== 'admin') {
      router.push('/')
      return
    }

    loadAdminData()
  }, [user, profile, router, loadAdminData])

  if (!user || profile?.role !== 'admin') {
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading admin dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6">
          <h2 className="text-xl font-bold text-red-600">Error</h2>
          <p className="mt-2">{error.message}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Users ({users.length})</h2>
        <AdminUsersList users={users} />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Parking Spots ({spots.length})</h2>
        <AdminSpotsTable spots={spots} />
      </section>
    </div>
  )
}
