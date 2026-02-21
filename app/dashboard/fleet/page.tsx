import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { VehiclesTable } from '@/components/fleet/vehicles-table'
import { AddVehicleButton } from '@/components/fleet/add-vehicle-button'

export default async function FleetPage() {
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

  // Fetch vehicles
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fleet Management</h1>
          <p className="text-muted-foreground">Manage your vehicle fleet</p>
        </div>
        {['admin', 'manager'].includes(profile?.role) && (
          <AddVehicleButton />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vehicles</CardTitle>
        </CardHeader>
        <CardContent>
          <VehiclesTable vehicles={vehicles || []} canEdit={['admin', 'manager'].includes(profile?.role)} />
        </CardContent>
      </Card>
    </div>
  )
}
