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
      parking_spots: {
        Row: {
          id: string
          created_at?: string
          updated_at?: string
          latitude: number
          longitude: number
          address?: string
          available: boolean
          type: string
          price_per_hour?: number
          restrictions?: string
          reported_by?: string
          last_reported?: string
          verified?: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          latitude: number
          longitude: number
          address?: string
          available?: boolean
          type: string
          price_per_hour?: number
          restrictions?: string
          reported_by?: string
          last_reported?: string
          verified?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          latitude?: number
          longitude?: number
          address?: string
          available?: boolean
          type?: string
          price_per_hour?: number
          restrictions?: string
          reported_by?: string
          last_reported?: string
          verified?: boolean
        }
      }
      user_subscriptions: {
        Row: {
          id: string
          created_at?: string
          user_id: string
          stripe_customer_id: string
          subscription_tier: string
          amount_paid: number
          last_payment_date: string
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          stripe_customer_id: string
          subscription_tier: string
          amount_paid: number
          last_payment_date: string
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          stripe_customer_id?: string
          subscription_tier?: string
          amount_paid?: number
          last_payment_date?: string
          is_active?: boolean
        }
      }
      health_checks: {
        Row: {
          id: string
          timestamp: string
          status: string
          details?: Json
        }
        Insert: {
          id?: string
          timestamp?: string
          status: string
          details?: Json
        }
        Update: {
          id?: string
          timestamp?: string
          status?: string
          details?: Json
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      find_nearby_spots: {
        Args: {
          user_lat: number
          user_lng: number
          radius_meters: number
        }
        Returns: {
          id: string
          latitude: number
          longitude: number
          address?: string
          available: boolean
          type: string
          price_per_hour?: number
          restrictions?: string
          distance_meters: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
