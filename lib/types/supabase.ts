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
      ai_predictions: {
        Row: {
          id: number
          location: string | null
          prediction_type: string | null
          prediction_data: Json | null
          confidence_score: number | null
          valid_until: string | null
          created_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: number
          location?: string | null
          prediction_type?: string | null
          prediction_data?: Json | null
          confidence_score?: number | null
          valid_until?: string | null
          created_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: number
          location?: string | null
          prediction_type?: string | null
          prediction_data?: Json | null
          confidence_score?: number | null
          valid_until?: string | null
          created_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_predictions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      api_usage: {
        Row: {
          id: string
          user_id: string | null
          endpoint: string
          count: number | null
          last_used: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          endpoint: string
          count?: number | null
          last_used?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          endpoint?: string
          count?: number | null
          last_used?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      notification_log: {
        Row: {
          id: string
          user_id: string | null
          type: string
          message: string | null
          sent_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          type: string
          message?: string | null
          sent_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          type?: string
          message?: string | null
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      notification_preferences: {
        Row: {
          id: string
          user_id: string | null
          email: boolean | null
          push: boolean | null
          sms: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          email?: boolean | null
          push?: boolean | null
          sms?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          email?: boolean | null
          push?: boolean | null
          sms?: boolean | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      notification_queue: {
        Row: {
          id: string
          user_id: string | null
          type: string
          message: string | null
          scheduled_for: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          type: string
          message?: string | null
          scheduled_for?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          type?: string
          message?: string | null
          scheduled_for?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_queue_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string | null
          title: string
          message: string
          notification_type: string | null
          data: Json | null
          read: boolean | null
          sent_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          title: string
          message: string
          notification_type?: string | null
          data?: Json | null
          read?: boolean | null
          sent_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string
          message?: string
          notification_type?: string | null
          data?: Json | null
          read?: boolean | null
          sent_at?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      parking_sessions: {
        Row: {
          id: string
          user_id: string | null
          spot_id: string | null
          started_at: string | null
          ended_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          spot_id?: string | null
          started_at?: string | null
          ended_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          spot_id?: string | null
          started_at?: string | null
          ended_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parking_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      parking_spots: {
        Row: {
          id: string
          name: string
          latitude: number
          longitude: number
          address: string | null
          spot_type: string | null
          is_available: boolean | null
          reported_by: string | null
          status: string | null
          created_at: string | null
          updated_at: string | null
          confidence_score: number | null
        }
        Insert: {
          id?: string
          name: string
          latitude: number
          longitude: number
          address?: string | null
          spot_type?: string | null
          is_available?: boolean | null
          reported_by?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
          confidence_score?: number | null
        }
        Update: {
          id?: string
          name?: string
          latitude?: number
          longitude?: number
          address?: string | null
          spot_type?: string | null
          is_available?: boolean | null
          reported_by?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
          confidence_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "parking_spots_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          reputation_score: number | null
          total_reports: number | null
          created_at: string | null
          updated_at: string | null
          last_seen_at: string | null
          stripe_customer_id: string | null
          subscription_status: Database['public']['Enums']['subscription_status'] | null
          subscription_tier: Database['public']['Enums']['subscription_tier'] | null
          role: Database['public']['Enums']['user_role'] | null
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          reputation_score?: number | null
          total_reports?: number | null
          created_at?: string | null
          updated_at?: string | null
          last_seen_at?: string | null
          stripe_customer_id?: string | null
          subscription_status?: Database['public']['Enums']['subscription_status'] | null
          subscription_tier?: Database['public']['Enums']['subscription_tier'] | null
          role?: Database['public']['Enums']['user_role'] | null
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          reputation_score?: number | null
          total_reports?: number | null
          created_at?: string | null
          updated_at?: string | null
          last_seen_at?: string | null
          stripe_customer_id?: string | null
          subscription_status?: Database['public']['Enums']['subscription_status'] | null
          subscription_tier?: Database['public']['Enums']['subscription_tier'] | null
          role?: Database['public']['Enums']['user_role'] | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      real_parking_spots: {
        Row: {
          id: number
          provider_id: string
          provider: string
          name: string
          latitude: number
          longitude: number
          address: string | null
          spot_type: string | null
          price_per_hour: number | null
          is_available: boolean | null
          total_spaces: number | null
          available_spaces: number | null
          real_time_data: boolean | null
          last_updated: string | null
          metadata: Json | null
          created_at: string | null
          status: string | null
          coordinates: number[] | null
        }
        Insert: {
          id?: number
          provider_id: string
          provider: string
          name: string
          latitude: number
          longitude: number
          address?: string | null
          spot_type?: string | null
          price_per_hour?: number | null
          is_available?: boolean | null
          total_spaces?: number | null
          available_spaces?: number | null
          real_time_data?: boolean | null
          last_updated?: string | null
          metadata?: Json | null
          created_at?: string | null
          status?: string | null
          coordinates?: number[] | null
        }
        Update: {
          id?: number
          provider_id?: string
          provider?: string
          name?: string
          latitude?: number
          longitude?: number
          address?: string | null
          spot_type?: string | null
          price_per_hour?: number | null
          is_available?: boolean | null
          total_spaces?: number | null
          available_spaces?: number | null
          real_time_data?: boolean | null
          last_updated?: string | null
          metadata?: Json | null
          created_at?: string | null
          status?: string | null
          coordinates?: number[] | null
        }
        Relationships: []
      }
      spot_reports: {
        Row: {
          id: string
          spot_id: string | null
          reporter_id: string | null
          report_type: string
          notes: string | null
          photo_url: string | null
          verified: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          spot_id?: string | null
          reporter_id?: string | null
          report_type: string
          notes?: string | null
          photo_url?: string | null
          verified?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          spot_id?: string | null
          reporter_id?: string | null
          report_type?: string
          notes?: string | null
          photo_url?: string | null
          verified?: boolean | null
          created_at?: string | null
        }
        Relationships: []
      }
      spot_reviews: {
        Row: {
          id: number
          spot_id: string
          user_id: string
          rating: number
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          spot_id: string
          user_id: string
          rating: number
          comment?: string | null
          created_at: string
          updated_at: string
        }
        Update: {
          id?: number
          spot_id?: string
          user_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "spot_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      subscription_events: {
        Row: {
          id: string
          user_id: string | null
          event_type: string
          event_data: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_type: string
          event_data?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          event_type?: string
          event_data?: Json | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_favorite_spots: {
        Row: {
          id: string
          user_id: string | null
          spot_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          spot_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          spot_id?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_favorite_spots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_locations: {
        Row: {
          id: string
          user_id: string | null
          latitude: number
          longitude: number
          accuracy: number | null
          created_at: string | null
          consent_given: boolean | null
          session_id: string | null
          location: unknown | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          latitude: number
          longitude: number
          accuracy?: number | null
          created_at?: string | null
          consent_given?: boolean | null
          session_id?: string | null
          location?: unknown | null
        }
        Update: {
          id?: string
          user_id?: string | null
          latitude?: number
          longitude?: number
          accuracy?: number | null
          created_at?: string | null
          consent_given?: boolean | null
          session_id?: string | null
          location?: unknown | null
        }
        Relationships: [
          {
            foreignKeyName: "user_locations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string | null
          plan_id: string
          status: string
          trial_end: string | null
          cancel_at_period_end: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          plan_id: string
          status: string
          trial_end?: string | null
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          plan_id?: string
          status?: string
          trial_end?: string | null
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      parking_usage_history: {
        Row: {
          id: number
          spot_id: string
          action: string
          timestamp: string
          created_at: string | null
        }
        Insert: {
          id?: number
          spot_id: string
          action: string
          timestamp: string
          created_at?: string | null
        }
        Update: {
          id?: number
          spot_id?: string
          action?: string
          timestamp?: string
          created_at?: string | null
        }
        Relationships: []
      }
      notification_tokens: {
        Row: {
          id: number
          user_id: string
          device_id: string
          fcm_token: string
          created_at: string
          updated_at: string
          last_used: string | null
          device_type: string | null
          device_name: string | null
          is_active: boolean
        }
        Insert: {
          id?: number
          user_id: string
          device_id: string
          fcm_token: string
          created_at?: string
          updated_at?: string
          last_used?: string | null
          device_type?: string | null
          device_name?: string | null
          is_active?: boolean
        }
        Update: {
          id?: number
          user_id?: string
          device_id?: string
          fcm_token?: string
          created_at?: string
          updated_at?: string
          last_used?: string | null
          device_type?: string | null
          device_name?: string | null
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "notification_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      admin_logs: {
        Row: {
          id: number
          admin_id: string
          action: string
          target_id: string | null
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: number
          admin_id: string
          action: string
          target_id?: string | null
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: number
          admin_id?: string
          action?: string
          target_id?: string | null
          details?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_logs_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      find_nearby_real_spots: {
        Args: {
          lat: number
          lng: number
          radius: number
        }
        Returns: Array<{
          id: string
          name: string
          latitude: number
          longitude: number
          distance: number
          is_available: boolean
          spot_type: string
          last_reported: string
          confidence: number
        }>
      }
      update_user_reputation: {
        Args: {
          user_id: string
          action_type: string
          points: number
        }
        Returns: {
          success: boolean
          new_reputation: number
        }
      }
      calculate_parking_demand: {
        Args: {
          lat: number
          lng: number
          radius: number
          time_window?: string
        }
        Returns: {
          demand_score: number
          confidence: number
          factors: Json
        }
      }
      cleanup_expired_spots: {
        Args: Record<string, never>
        Returns: {
          cleaned_count: number
          updated_at: string
        }
      }
    }
    Enums: {
      subscription_status: 'active' | 'inactive' | 'past_due' | 'canceled'
      subscription_tier: 'free' | 'premium' | 'pro'
      user_role: 'user' | 'admin' | 'moderator' | 'suspended'
      spot_status: 'active' | 'pending' | 'deleted' | 'reported'
    }
  }
}

// Helper types for Supabase tables
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Helper type for insertion
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']

// Helper type for updates
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Helper type for relationships
export type TableRelationships<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Relationships']
