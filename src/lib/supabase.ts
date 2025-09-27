import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Graceful fallback: do not crash the app if Supabase env vars are missing
// We provide a minimal no-op client that satisfies the methods used in the app.
type NoopQuery = {
  select: (...args: any[]) => Promise<{ data: any[]; error: null; count?: number }>
  order: (...args: any[]) => NoopQuery
  limit: (...args: any[]) => NoopQuery
  eq: (...args: any[]) => NoopQuery
  insert: (...args: any[]) => Promise<{ data: null; error: null }>
  update: (...args: any[]) => Promise<{ data: null; error: null }>
  delete: (...args: any[]) => Promise<{ data: null; error: null }>
}

const makeNoopQuery = (): NoopQuery => {
  const api: NoopQuery = {
    select: async () => ({ data: [], error: null, count: 0 }),
    order: () => api,
    limit: () => api,
    eq: () => api,
    insert: async () => ({ data: null, error: null }),
    update: async () => ({ data: null, error: null }),
    delete: async () => ({ data: null, error: null }),
  }
  return api
}

const makeNoopChannel = () => {
  const ch = {
    on: (..._args: any[]) => ch,
    subscribe: () => ({ unsubscribe: () => {} }),
  }
  return ch
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : (() => {
        console.warn(
          'Supabase environment variables are missing. Running in fallback (no-op) mode. Connect your project to Supabase to enable data features.'
        )
        return {
          channel: (_name?: string) => makeNoopChannel(),
          from: (_table: string) => makeNoopQuery(),
        } as any
      })()

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

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
