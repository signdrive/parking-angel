export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  status?: 'active' | 'suspended';
  subscription_status?: string;
  // ...add all other validated fields from your DB schema here
}

export interface ParkingSpot {
  id: string;
  coordinates: [number, number];
  status: 'available' | 'occupied' | 'reserved';
  // ...add all other validated fields from your DB schema here
}

export interface SpotStatistics {
  total: number;
  active: number;
  dailyReports: number;
  uptime: number;
}

export interface SystemStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalParkingSpots: number;
  occupiedSpots: number;
}
