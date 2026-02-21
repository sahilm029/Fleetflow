import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/dashboard/stat-card'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  // Fetch fleet stats
  const { data: vehicles } = await supabase.from('vehicles').select('id')
  const { data: drivers } = await supabase.from('drivers').select('id')
  const { data: activeTrips } = await supabase
    .from('trip_history')
    .select('id')
    .eq('status', 'in_progress')

  return (
    <div className="flex-1 space-y-8 p-8 bg-gradient-to-br from-background via-slate-50 to-blue-50">
      {/* Header */}
      <div className="space-y-2 animate-slide-up">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
          Welcome, {profile?.first_name}!
        </h1>
        <p className="text-muted-foreground text-lg">
          Fleet Overview & Key Metrics
        </p>
      </div>

      {/* Stats Grid with Staggered Animation */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="animate-slide-up animate-stagger-1">
          <StatCard
            title="Total Vehicles"
            value={vehicles?.length || 0}
            description="Active fleet vehicles"
          />
        </div>
        <div className="animate-slide-up animate-stagger-2">
          <StatCard
            title="Total Drivers"
            value={drivers?.length || 0}
            description="Active drivers"
          />
        </div>
        <div className="animate-slide-up animate-stagger-3">
          <StatCard
            title="Active Trips"
            value={activeTrips?.length || 0}
            description="Currently in progress"
          />
        </div>
        <div className="animate-slide-up animate-stagger-4">
          <StatCard
            title="Your Role"
            value={profile?.role?.toUpperCase() || 'USER'}
            description="Current account role"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg animate-slide-up animate-stagger-2">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <QuickActionButton href="/dashboard/fleet" label="View Fleet" />
            <QuickActionButton href="/dashboard/drivers" label="View Drivers" />
            <QuickActionButton href="/dashboard/assignments" label="Assignments" />
            <QuickActionButton href="/dashboard/maintenance" label="Maintenance" />
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-0 shadow-lg animate-slide-up animate-stagger-3">
        <CardHeader className="bg-gradient-to-r from-green-50 to-transparent">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            No recent activity yet. Start managing your fleet!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function QuickActionButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="p-4 rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-sm font-semibold text-center transition-all duration-300 transform hover:scale-105 active:scale-95 text-blue-700 shadow-sm hover:shadow-md"
    >
      {label}
    </a>
  )
}
