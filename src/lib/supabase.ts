import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      potholes: {
        Row: {
          id: string
          latitude: number
          longitude: number
          severity: 'low' | 'medium' | 'high'
          title: string
          description: string
          image_url: string | null
          vehicle_id: string
          status: 'pending' | 'verified' | 'repaired'
          reported_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          latitude: number
          longitude: number
          severity: 'low' | 'medium' | 'high'
          title: string
          description: string
          image_url?: string | null
          vehicle_id: string
          status?: 'pending' | 'verified' | 'repaired'
          reported_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          latitude?: number
          longitude?: number
          severity?: 'low' | 'medium' | 'high'
          title?: string
          description?: string
          image_url?: string | null
          vehicle_id?: string
          status?: 'pending' | 'verified' | 'repaired'
          reported_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      vehicles: {
        Row: {
          id: string
          vehicle_id: string
          name: string
          is_active: boolean
          last_ping: string
          created_at: string
        }
        Insert: {
          id?: string
          vehicle_id: string
          name: string
          is_active?: boolean
          last_ping?: string
          created_at?: string
        }
        Update: {
          id?: string
          vehicle_id?: string
          name?: string
          is_active?: boolean
          last_ping?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          pothole_id: string
          message: string
          type: 'detection' | 'repair' | 'alert'
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          pothole_id: string
          message: string
          type: 'detection' | 'repair' | 'alert'
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          pothole_id?: string
          message?: string
          type?: 'detection' | 'repair' | 'alert'
          read?: boolean
          created_at?: string
        }
      }
    }
  }
}