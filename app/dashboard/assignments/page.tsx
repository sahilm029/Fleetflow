'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AssignmentsTable } from '@/components/assignments/assignments-table'
import { AddAssignmentButton } from '@/components/assignments/add-assignment-button'
import { DriverVehicleStatus } from '@/components/assignments/driver-vehicle-status'

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([])
  const [userRole, setUserRole] = useState<string>('driver')
  const [userId, setUserId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      
      // Get user and role from metadata
      const { data: { user } } = await supabase.auth.getUser()
      const role = user?.user_metadata?.role || 'driver'
      setUserRole(role)
      setUserId(user?.id || '')

      // Fetch assignments from API endpoint
      try {
        const response = await fetch('/api/assignments')
        if (response.ok) {
          const data = await response.json()
          setAssignments(data || [])
        } else {
          console.error('Failed to fetch assignments:', response.status)
          setAssignments([])
        }
      } catch (error) {
        console.error('Error fetching assignments:', error)
        setAssignments([])
      }
      
      setLoading(false)
    }

    fetchData()
  }, [])

  const canEdit = ['admin', 'manager'].includes(userRole)
  const isDriver = userRole === 'driver'
  
  // Filter assignments for current driver
  const driverAssignments = isDriver
    ? assignments.filter((a) => a.driver_id === userId)
    : []

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehicle Assignments</h1>
          <p className="text-muted-foreground">
            {isDriver ? 'Your vehicle assignments and status' : 'Manage vehicle to driver assignments'}
          </p>
        </div>
        {canEdit && <AddAssignmentButton />}
      </div>

      {/* Driver-specific status control */}
      {isDriver && !loading && <DriverVehicleStatus assignments={driverAssignments} />}

      <Card>
        <CardHeader>
          <CardTitle>{isDriver ? 'Your Assignments' : 'Active Assignments'}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Loading assignments...</p>
          ) : (
            <AssignmentsTable 
              assignments={isDriver ? driverAssignments : assignments} 
              canEdit={canEdit} 
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
