'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MaintenanceScheduleTable } from '@/components/maintenance/schedule-table'
import { MaintenanceLogsTable } from '@/components/maintenance/logs-table'
import { AddMaintenanceButton } from '@/components/maintenance/add-maintenance-button'

export default function MaintenancePage() {
  const [schedules, setSchedules] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [userRole, setUserRole] = useState<string>('driver')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      
      // Get user and role from metadata
      const { data: { user } } = await supabase.auth.getUser()
      const role = user?.user_metadata?.role || 'driver'
      setUserRole(role)

      // Fetch maintenance data from API endpoints
      try {
        const [schedulesRes, logsRes] = await Promise.all([
          fetch('/api/maintenance/schedules'),
          fetch('/api/maintenance/logs'),
        ])

        if (schedulesRes.ok) {
          const schedulesData = await schedulesRes.json()
          setSchedules(schedulesData || [])
        } else {
          console.error('Failed to fetch schedules:', schedulesRes.status)
          setSchedules([])
        }

        if (logsRes.ok) {
          const logsData = await logsRes.json()
          setLogs(logsData || [])
        } else {
          console.error('Failed to fetch logs:', logsRes.status)
          setLogs([])
        }
      } catch (error) {
        console.error('Error fetching maintenance data:', error)
        setSchedules([])
        setLogs([])
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
          <h1 className="text-3xl font-bold tracking-tight">Maintenance Management</h1>
          <p className="text-muted-foreground">Track vehicle maintenance schedules and history</p>
        </div>
        {canEdit && <AddMaintenanceButton />}
      </div>

      <Tabs defaultValue="schedules" className="w-full">
        <TabsList>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="logs">History</TabsTrigger>
        </TabsList>

        <TabsContent value="schedules">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Schedules</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-8 text-muted-foreground">Loading schedules...</p>
              ) : (
                <MaintenanceScheduleTable schedules={schedules} canEdit={canEdit} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance History</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-8 text-muted-foreground">Loading logs...</p>
              ) : (
                <MaintenanceLogsTable logs={logs} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
