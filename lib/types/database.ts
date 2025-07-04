export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      spot_holds: {
        Row: {
          id: string
          user_id: string
          spot_id: string
          expires_at: string
          created_at: string
          hold_duration: number
          price_paid: number
        }
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          subscription_tier: string | null
          subscription_status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          created_at: string
          updated_at: string
        }
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: string
          trial_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
  }
}

// Spot Hold Types
export type SpotHold = Database['public']['Tables']['spot_holds']['Row']

export interface CreateSpotHoldParams {
  user_id: string
  spot_id: string
  hold_duration: number
  price_paid: number
}

export type CreateSpotHoldResult = SpotHold

export interface ReleaseSpotHoldParams {
  hold_id: string
  user_id: string
}

export type ReleaseSpotHoldResult = {
  success: boolean
  message: string
}

export interface GetSpotActiveHoldParams {
  spot_id: string
}

export type GetSpotActiveHoldResult = SpotHold | null

