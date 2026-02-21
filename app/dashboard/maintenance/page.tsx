import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MaintenanceScheduleTable } from '@/components/maintenance/schedule-table'
import { MaintenanceLogsTable } from '@/components/maintenance/logs-table'
import { AddMaintenanceButton } from '@/components/maintenance/add-maintenance-button'

export default async function MaintenancePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()

  // Fetch maintenance schedules
  const { data: schedules } = await supabase
    .from('maintenance_schedules')
    .select('*, vehicles(make, model, license_plate)')
    .order('scheduled_date', { ascending: true })

  // Fetch maintenance logs
  const { data: logs } = await supabase
    .from('maintenance_logs')
    .select('*, vehicles(make, model, license_plate)')
    .order('completion_date', { ascending: false })

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maintenance Management</h1>
          <p className="text-muted-foreground">Track vehicle maintenance schedules and history</p>
        </div>
        {['admin', 'manager'].includes(profile?.role) && (
          <AddMaintenanceButton />
        )}
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
              <MaintenanceScheduleTable schedules={schedules || []} canEdit={['admin', 'manager'].includes(profile?.role)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance History</CardTitle>
            </CardHeader>
            <CardContent>
              <MaintenanceLogsTable logs={logs || []} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
