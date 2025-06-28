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
