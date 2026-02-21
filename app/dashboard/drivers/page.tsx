'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DriversTable } from '@/components/drivers/drivers-table'
import { AddDriverButton } from '@/components/drivers/add-driver-button'

export default function DriversPage() {
  const [drivers, setDrivers] = useState<any[]>([])
  const [userRole, setUserRole] = useState<string>('driver')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      
      // Get user and role from metadata
      const { data: { user } } = await supabase.auth.getUser()
      const role = user?.user_metadata?.role || 'driver'
      setUserRole(role)

      // Fetch drivers from API endpoint (handles RLS issues server-side)
      try {
        const response = await fetch('/api/drivers')
        if (response.ok) {
          const data = await response.json()
          setDrivers(data || [])
        } else {
          console.error('Failed to fetch drivers:', response.status)
          setDrivers([])
        }
      } catch (error) {
        console.error('Error fetching drivers:', error)
        setDrivers([])
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
          <h1 className="text-3xl font-bold tracking-tight">Driver Management</h1>
          <p className="text-muted-foreground">Manage your drivers and their information</p>
        </div>
        {canEdit && <AddDriverButton />}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Drivers</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Loading drivers...</p>
          ) : (
            <DriversTable drivers={drivers} canEdit={canEdit} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
