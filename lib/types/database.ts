// Temporary types for spot holds until Supabase types are regenerated
export interface SpotHold {
  id: string
  user_id: string
  spot_id: string
  expires_at: string
  created_at: string
  hold_duration: number
  price_paid: number
}

// Temporary RPC function types
export interface CreateSpotHoldParams {
  spot_uuid: string
  user_uuid: string
  duration_minutes: number
}

export interface CreateSpotHoldResult {
  success: boolean
  hold_id?: string
  expires_at?: string
  error_message?: string
}

export interface ReleaseSpotHoldParams {
  hold_uuid: string
}

export interface ReleaseSpotHoldResult {
  success: boolean
  error_message?: string
}

export interface GetSpotActiveHoldParams {
  spot_uuid: string
}

export interface GetSpotActiveHoldResult {
  id?: string
  user_id?: string
  expires_at?: string
}

// Re-export Database type from the main types
export type { Database } from '../../types/supabase'