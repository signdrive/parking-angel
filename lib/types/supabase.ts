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
          id: string
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
          created_at?: string
          updated_at?: string
        }
      }
      subscription_events: {
        Row: {
          id: string
          user_id: string
          event_type: string
          tier: string
          stripe_event_id: string
          subscription_id: string | null
          created_at: string
          event_data: Json
        }
        Insert: {
          id?: string
          user_id: string
          event_type: string
          tier: string
          stripe_event_id: string
          subscription_id?: string | null
          created_at?: string
          event_data: Json
        }
        Update: {
          id?: string
          user_id?: string
          event_type?: string
          tier?: string
          stripe_event_id?: string
          subscription_id?: string | null
          created_at?: string
          event_data?: Json
        }
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          role: string | null
          created_at: string | null
          status: string | null
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: string | null
          created_at?: string | null
          status?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: string | null
          created_at?: string | null
          status?: string | null
        }
      }
      parking_spots: {
        Row: {
          id: string
          name: string
          spot_type: string | null
          is_available: boolean
          latitude: number | null
          longitude: number | null
          created_at: string
          confidence_score: number | null
        }
        Insert: {
          id?: string
          name: string
          spot_type?: string | null
          is_available?: boolean
          latitude?: number | null
          longitude?: number | null
          created_at?: string
          confidence_score?: number | null
        }
        Update: {
          id?: string
          name?: string
          spot_type?: string | null
          is_available?: boolean
          latitude?: number | null
          longitude?: number | null
          created_at?: string
          confidence_score?: number | null
        }
      }
      spot_reports: {
        Row: {
          id: string
          user_id: string
          spot_id: string
          report_type: string
          description: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          spot_id: string
          report_type: string
          description?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          spot_id?: string
          report_type?: string
          description?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      notification_tokens: {
        Row: {
          id: string
          user_id: string
          token: string
          device_type: string
          device_id: string | null
          device_name: string | null
          fcm_token: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token: string
          device_type: string
          device_id?: string | null
          device_name?: string | null
          fcm_token?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          token?: string
          device_type?: string
          device_id?: string | null
          device_name?: string | null
          fcm_token?: string | null
          active?: boolean
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
      subscription_tier: 'free' | 'premium' | 'pro' | 'enterprise'
    }
  }
}
