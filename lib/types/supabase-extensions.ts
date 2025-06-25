// Temporary type extensions for missing Supabase functions
import type { Database } from '../../types/supabase'
import type { 
  CreateSpotHoldParams, 
  CreateSpotHoldResult,
  ReleaseSpotHoldParams,
  ReleaseSpotHoldResult,
  GetSpotActiveHoldParams,
  GetSpotActiveHoldResult,
  SpotHold
} from './database'

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
        Row: SpotHold
        Insert: Omit<SpotHold, 'id' | 'created_at'>
        Update: Partial<Omit<SpotHold, 'id' | 'created_at'>>
        Relationships: []
      }
    }
  }
}
