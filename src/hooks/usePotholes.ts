import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'
import { toast } from '@/hooks/use-toast'

type Pothole = Database['public']['Tables']['potholes']['Row']

export const usePotholes = () => {
  const [potholes, setPotholes] = useState<Pothole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPotholes()
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('potholes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'potholes' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setPotholes(prev => [...prev, payload.new as Pothole])
          toast({
            title: "New Pothole Detected",
            description: `${payload.new.title} - Severity: ${payload.new.severity}`,
          })
        } else if (payload.eventType === 'UPDATE') {
          setPotholes(prev => prev.map(p => p.id === payload.new.id ? payload.new as Pothole : p))
        } else if (payload.eventType === 'DELETE') {
          setPotholes(prev => prev.filter(p => p.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchPotholes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('potholes')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setPotholes(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching potholes:', err)
    } finally {
      setLoading(false)
    }
  }

  const createPothole = async (pothole: Database['public']['Tables']['potholes']['Insert']) => {
    try {
      const { data, error } = await supabase
        .from('potholes')
        .insert([pothole])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (err) {
      console.error('Error creating pothole:', err)
      toast({
        title: "Error",
        description: "Failed to create pothole report",
        variant: "destructive"
      })
      throw err
    }
  }

  const updatePothole = async (id: string, updates: Database['public']['Tables']['potholes']['Update']) => {
    try {
      const { data, error } = await supabase
        .from('potholes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (err) {
      console.error('Error updating pothole:', err)
      toast({
        title: "Error", 
        description: "Failed to update pothole",
        variant: "destructive"
      })
      throw err
    }
  }

  return {
    potholes,
    loading,
    error,
    createPothole,
    updatePothole,
    refetch: fetchPotholes
  }
}