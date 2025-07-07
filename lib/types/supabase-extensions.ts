// Temporary type extensions for missing Supabase functions
import type { Database } from './database'

export interface CreateSpotHoldParams {
  spotId: string
  userId: string
  duration: number
  price: number
}

export interface CreateSpotHoldResult {
  success: boolean
  holdId?: string
  error?: string
}

export interface ReleaseSpotHoldParams {
  holdId: string
  userId: string
}

export interface ReleaseSpotHoldResult {
  success: boolean
  error?: string
}

export interface GetSpotActiveHoldParams {
  spotId: string
}

export interface GetSpotActiveHoldResult {
  hasActiveHold: boolean
  hold?: Database['public']['Tables']['spot_holds']['Row']
  error?: string
}

// Extended database type with missing functions
export type ExtendedDatabase = Database & {
  public: Database['public'] & {
    Functions: Database['public']['Functions'] & {
      create_spot_hold: {
        Args: CreateSpotHoldParams
        Returns: CreateSpotHoldResult[]
      }
      release_spot_hold: {
        Args: ReleaseSpotHoldParams
        Returns: ReleaseSpotHoldResult[]
      }
      get_spot_active_hold: {
        Args: GetSpotActiveHoldParams
        Returns: GetSpotActiveHoldResult[]
      }
    }
    Tables: Database['public']['Tables'] & {
      spot_holds: {
        Row: Database['public']['Tables']['spot_holds']['Row']
        Insert: Omit<Database['public']['Tables']['spot_holds']['Row'], 'id' | 'created_at'>
        Update: Partial<Omit<Database['public']['Tables']['spot_holds']['Row'], 'id' | 'created_at'>>
        Relationships: []
      }
    }
  }
}
