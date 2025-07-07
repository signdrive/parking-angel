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
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          status: string
          trial_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          status?: string
          trial_end?: string | null
          cancel_at_period_end?: boolean
          updated_at?: string
        }
      }
      subscription_events: {
        Row: {
          id: string
          subscription_id: string
          event_type: string
          event_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          subscription_id: string
          event_type: string
          event_data: Json
          created_at?: string
        }
        Update: {
          id?: string
          subscription_id?: string
          event_type?: string
          event_data?: Json
          created_at?: string
        }
      }
      spot_reports: {
        Row: {
          id: string
          spot_id: string
          user_id: string
          report_type: string
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          spot_id: string
          user_id: string
          report_type: string
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          spot_id?: string
          user_id?: string
          report_type?: string
          description?: string
          created_at?: string
        }
      }
      notification_tokens: {
        Row: {
          id: string
          user_id: string
          token: string
          device_type: string
          device_id: string
          device_name: string | null
          fcm_token: string
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token: string
          device_type: string
          device_id: string
          device_name?: string | null
          fcm_token: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          token?: string
          device_type?: string
          device_id?: string
          device_name?: string | null
          fcm_token?: string
          active?: boolean
          updated_at?: string
        }
      }
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
        Insert: {
          id?: string
          user_id: string
          spot_id: string
          expires_at: string
          hold_duration: number
          price_paid: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          spot_id?: string
          expires_at?: string
          hold_duration?: number
          price_paid?: number
          created_at?: string
        }
      }
      parking_spots: {
        Row: {
          id: string
          name: string
          spot_type: string | null
          is_available: boolean
          latitude: number
          longitude: number
          status: 'available' | 'occupied' | 'reserved'
          price_per_hour: number
          zone_id: string | null
          confidence_score: number | null
          last_updated: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          spot_type?: string | null
          is_available?: boolean
          latitude: number
          longitude: number
          status: 'available' | 'occupied' | 'reserved'
          price_per_hour: number
          zone_id?: string | null
          confidence_score?: number | null
          last_updated?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          spot_type?: string | null
          is_available?: boolean
          latitude?: number
          longitude?: number
          status?: 'available' | 'occupied' | 'reserved'
          price_per_hour?: number
          zone_id?: string | null
          confidence_score?: number | null
          last_updated?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          first_name: string | null
          last_name: string | null
          full_name: string | null
          avatar_url: string | null
          subscription_tier: string | null
          subscription_status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          role: string | null
          status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: string | null
          subscription_status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          role?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: string | null
          subscription_status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          role?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_status: 'active' | 'trialing' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid'
      subscription_tier: 'free' | 'premium' | 'enterprise'
      user_role: 'user' | 'admin' | 'moderator'
      user_status: 'active' | 'suspended' | 'banned'
      spot_status: 'available' | 'occupied' | 'reserved'
    }
  }
}

export type Tables = Database['public']['Tables']
export type Enums = Database['public']['Enums']

// Common table row types
export type SpotHold = Tables['spot_holds']['Row']
export type ParkingSpot = Tables['parking_spots']['Row']
export type Profile = Tables['profiles']['Row']
export type UserSubscription = Tables['user_subscriptions']['Row']

// Params types
export interface CreateSpotHoldParams {
  user_id: string
  spot_id: string
  hold_duration: number
  price_paid: number
}

