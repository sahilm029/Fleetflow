'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const FleetUtilizationChart = dynamic(
  () => import('./fleet-utilization').then((m) => m.FleetUtilizationChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
)
const FuelConsumptionChart = dynamic(
  () => import('./fuel-consumption').then((m) => m.FuelConsumptionChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
)
const MaintenanceCostChart = dynamic(
  () => import('./maintenance-cost').then((m) => m.MaintenanceCostChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
)
const DriverPerformanceChart = dynamic(
  () => import('./driver-performance').then((m) => m.DriverPerformanceChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
)

function ChartSkeleton() {
  return (
    <div className="w-full h-75 flex items-center justify-center bg-muted/30 rounded-lg animate-pulse">
      <p className="text-sm text-muted-foreground">Loading chart…</p>
    </div>
  )
}

interface Props {
  vehicles: number
  trips: { distance_km: number | null; fuel_used: number | null; duration_hours: number | null }[]
  maintenance: { cost: number | null }[]
}

export function AnalyticsCharts({ vehicles, trips, maintenance }: Props) {
  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fleet Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <FleetUtilizationChart vehicles={vehicles} trips={trips.length} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fuel Consumption Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <FuelConsumptionChart trips={trips} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <MaintenanceCostChart maintenance={maintenance} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Driver Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <DriverPerformanceChart trips={trips} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
