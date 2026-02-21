import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/dashboard/stat-card'
import { AnalyticsCharts } from '@/components/analytics/analytics-charts'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export default async function AnalyticsPage() {
  const supabase = await createClient()

  // Fetch analytics data
  const [
    { data: vehicles },
    { data: trips },
    { data: maintenance },
    { data: fuelLogs },
  ] = await Promise.all([
    supabase.from('vehicles').select('id'),
    supabase.from('trip_history').select('distance_km, fuel_used, duration_hours'),
    supabase.from('maintenance_logs').select('cost'),
    supabase.from('fuel_logs').select('fuel_amount'),
  ])

  // KPIs
  const totalTrips = trips?.length || 0
  const totalDistance = trips?.reduce((sum, t) => sum + (t.distance_km || 0), 0) || 0
  const totalFuelUsed = fuelLogs?.reduce((sum, f) => sum + (f.fuel_amount || 0), 0) || 0
  const totalMaintenanceCost = maintenance?.reduce((sum, m) => sum + (m.cost || 0), 0) || 0

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fleet Analytics & Reports</h1>
          <p className="text-muted-foreground">Performance metrics and insights</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Trips"
          value={totalTrips}
          description="Completed journeys"
        />
        <StatCard
          title="Total Distance"
          value={`${totalDistance.toFixed(0)} km`}
          description="Fleet kilometers"
        />
        <StatCard
          title="Total Fuel Used"
          value={`${totalFuelUsed.toFixed(0)} L`}
          description="Liters consumed"
        />
        <StatCard
          title="Maintenance Cost"
          value={`$${totalMaintenanceCost.toFixed(0)}`}
          description="Total spent on upkeep"
        />
      </div>

      {/* Charts */}
      <AnalyticsCharts
        vehicles={vehicles?.length || 0}
        trips={trips || []}
        maintenance={maintenance || []}
      />

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Fleet Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">Average Fuel Efficiency</p>
              <p className="text-2xl font-bold">
                {totalDistance > 0 && totalFuelUsed > 0
                  ? (totalDistance / totalFuelUsed).toFixed(2)
                  : 'N/A'}{' '}
                km/L
              </p>
            </div>
            <div className="p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">Average Trip Distance</p>
              <p className="text-2xl font-bold">
                {totalTrips > 0 ? (totalDistance / totalTrips).toFixed(2) : 'N/A'} km
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
