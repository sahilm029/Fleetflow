'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { VehiclesTable } from '@/components/fleet/vehicles-table'
import { AddVehicleButton } from '@/components/fleet/add-vehicle-button'

export default function FleetPage() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [userRole, setUserRole] = useState<string>('driver')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      
      // Get user and role from metadata
      const { data: { user } } = await supabase.auth.getUser()
      const role = user?.user_metadata?.role || 'driver'
      setUserRole(role)

      // Fetch vehicles from API endpoint
      try {
        const response = await fetch('/api/vehicles')
        if (response.ok) {
          const data = await response.json()
          setVehicles(data || [])
        } else {
          console.error('Failed to fetch vehicles:', response.status)
          setVehicles([])
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error)
        setVehicles([])
      }
      
      setLoading(false)
    }

    fetchData()
  }, [])

  const canEdit = ['admin', 'manager'].includes(userRole)

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fleet Management</h1>
          <p className="text-muted-foreground">Manage your vehicle fleet</p>
        </div>
        {canEdit && <AddVehicleButton />}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vehicles</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Loading vehicles...</p>
          ) : (
            <VehiclesTable vehicles={vehicles} canEdit={canEdit} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
