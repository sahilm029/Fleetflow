import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AssignmentsTable } from '@/components/assignments/assignments-table'
import { AddAssignmentButton } from '@/components/assignments/add-assignment-button'

export default async function AssignmentsPage() {
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

  // Fetch assignments
  const { data: assignments } = await supabase
    .from('assignments')
    .select(
      '*, vehicles(make, model, license_plate), profiles(first_name, last_name, email)'
    )
    .order('assigned_date', { ascending: false })

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehicle Assignments</h1>
          <p className="text-muted-foreground">Manage vehicle to driver assignments</p>
        </div>
        {['admin', 'manager'].includes(profile?.role) && (
          <AddAssignmentButton />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <AssignmentsTable
            assignments={assignments || []}
            canEdit={['admin', 'manager'].includes(profile?.role)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
