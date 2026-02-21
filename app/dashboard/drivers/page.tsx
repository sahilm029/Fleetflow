import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DriversTable } from '@/components/drivers/drivers-table'
import { AddDriverButton } from '@/components/drivers/add-driver-button'

export default async function DriversPage() {
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

  // Fetch drivers with profile info
  const { data: drivers } = await supabase
    .from('drivers')
    .select('*, profiles(first_name, last_name, email, phone)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Driver Management</h1>
          <p className="text-muted-foreground">Manage your drivers and their information</p>
        </div>
        {['admin', 'manager'].includes(profile?.role) && (
          <AddDriverButton />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Drivers</CardTitle>
        </CardHeader>
        <CardContent>
          <DriversTable drivers={drivers || []} canEdit={['admin', 'manager'].includes(profile?.role)} />
        </CardContent>
      </Card>
    </div>
  )
}
