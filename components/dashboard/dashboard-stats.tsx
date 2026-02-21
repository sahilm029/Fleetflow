 'use client'

import { useEffect, useState } from 'react'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { StatCard } from '@/components/dashboard/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Stats = {
  vehicles: number
  drivers: number
  activeTrips: number
}

export function DashboardStats() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState<Stats>({ vehicles: 0, drivers: 0, activeTrips: 0 })
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    setLoading(true)
    try {
      const supabase = createBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Use user metadata directly (most reliable)
        const profile = {
          id: user.id,
          email: user.email || user.user_metadata?.email,
          first_name: user.user_metadata?.first_name,
          last_name: user.user_metadata?.last_name,
          role: user.user_metadata?.role || 'driver',
          created_at: user.created_at,
        }
        setProfile(profile)

        // Try to get counts from database
        const { count: vehicleCount } = await supabase.from('vehicles').select('*', { count: 'exact', head: true })
        const { count: driverCount } = await supabase.from('drivers').select('*', { count: 'exact', head: true })
        const { count: tripCount } = await supabase.from('trip_history').select('*', { count: 'exact', head: true }).eq('status', 'in_progress')

        setStats({
          vehicles: vehicleCount || 0,
          drivers: driverCount || 0,
          activeTrips: tripCount || 0,
        })
      }

      setError(null)
    } catch (err: any) {
      console.error('Failed to fetch stats:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    const id = setInterval(fetchStats, 10000) // poll every 10s
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex-1 space-y-8 p-8 bg-gradient-to-br from-background via-slate-50 to-blue-50">
      {/* Header */}
      <div className="space-y-2 animate-slide-up">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
          Welcome, {profile?.first_name || profile?.email || 'User'}!
        </h1>
        <p className="text-muted-foreground text-lg">Fleet Overview & Key Metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="animate-slide-up animate-stagger-1">
          <StatCard title="Total Vehicles" value={stats.vehicles} description="Active fleet vehicles" />
        </div>
        <div className="animate-slide-up animate-stagger-2">
          <StatCard title="Total Drivers" value={stats.drivers} description="Active drivers" />
        </div>
        <div className="animate-slide-up animate-stagger-3">
          <StatCard title="Active Trips" value={stats.activeTrips} description="Currently in progress" />
        </div>
        <div className="animate-slide-up animate-stagger-4">
          <StatCard title="Your Role" value={(profile?.role || 'USER').toUpperCase()} description="Current account role" />
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg animate-slide-up animate-stagger-2">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <a href="/dashboard/fleet" className="p-4 rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-sm font-semibold text-center transition-all duration-300 transform hover:scale-105 active:scale-95 text-blue-700 shadow-sm hover:shadow-md">View Fleet</a>
            <a href="/dashboard/drivers" className="p-4 rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-sm font-semibold text-center transition-all duration-300 transform hover:scale-105 active:scale-95 text-blue-700 shadow-sm hover:shadow-md">View Drivers</a>
            <a href="/dashboard/assignments" className="p-4 rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-sm font-semibold text-center transition-all duration-300 transform hover:scale-105 active:scale-95 text-blue-700 shadow-sm hover:shadow-md">Assignments</a>
            <a href="/dashboard/maintenance" className="p-4 rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-sm font-semibold text-center transition-all duration-300 transform hover:scale-105 active:scale-95 text-blue-700 shadow-sm hover:shadow-md">Maintenance</a>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-0 shadow-lg animate-slide-up animate-stagger-3">
        <CardHeader className="bg-gradient-to-r from-green-50 to-transparent">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading recent activity…</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : (
            <p className="text-sm text-muted-foreground">No recent activity yet. Start managing your fleet!</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardStats
