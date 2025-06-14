export interface Profile {
  id: string
  email: string
  full_name: string | null
  created_at: string
  avatar_url: string | null
  role: string | null
  status?: 'active' | 'suspended' | 'pending' // Added optional status
}

export interface ParkingSpot {
  id: string
  location_name: string
  coordinates: {
    lat: number
    lng: number
  }
  type: 'street' | 'garage' | 'lot'
  status: 'active' | 'inactive' | 'occupied' | 'maintenance' // Added more statuses for clarity if needed by UI
  reports: number // This is a required field
  created_at: string
  last_updated: string
}

export interface SpotStatistics {
  total: number
  active: number
  dailyReports: number
  uptime: number
}
