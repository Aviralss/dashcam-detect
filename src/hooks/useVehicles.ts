import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

type Vehicle = Database['public']['Tables']['vehicles']['Row']

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [activeVehicles, setActiveVehicles] = useState(0)

  useEffect(() => {
    fetchVehicles()
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('vehicles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setVehicles(prev => [...prev, payload.new as Vehicle])
        } else if (payload.eventType === 'UPDATE') {
          setVehicles(prev => prev.map(v => v.id === payload.new.id ? payload.new as Vehicle : v))
        } else if (payload.eventType === 'DELETE') {
          setVehicles(prev => prev.filter(v => v.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    setActiveVehicles(vehicles.filter(v => v.is_active).length)
  }, [vehicles])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('name')
      
      if (error) throw error
      setVehicles(data || [])
    } catch (err) {
      console.error('Error fetching vehicles:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateVehicleStatus = async (id: string, is_active: boolean) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ 
          is_active, 
          last_ping: new Date().toISOString() 
        })
        .eq('id', id)
      
      if (error) throw error
    } catch (err) {
      console.error('Error updating vehicle status:', err)
    }
  }

  return {
    vehicles,
    loading,
    activeVehicles,
    updateVehicleStatus,
    refetch: fetchVehicles
  }
}