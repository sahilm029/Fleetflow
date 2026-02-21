import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LiveTrackingMap } from '@/components/tracking/live-map'
import { TripsTable } from '@/components/tracking/trips-table'
import { VehicleStatusTable } from '@/components/tracking/vehicle-status-table'

export default async function TrackingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch vehicle status
  const { data: vehicleStatus } = await supabase
    .from('vehicle_status')
    .select('*, vehicles(make, model, license_plate, id)')
    .order('last_update', { ascending: false })

  // Fetch active trips
  const { data: activeTrips } = await supabase
    .from('trip_history')
    .select(
      '*, vehicles(make, model, license_plate), profiles(first_name, last_name), routes(name, distance_km)'
    )
    .eq('status', 'in_progress')
    .order('start_time', { ascending: false })

  // Fetch completed trips
  const { data: completedTrips } = await supabase
    .from('trip_history')
    .select(
      '*, vehicles(make, model, license_plate), profiles(first_name, last_name), routes(name, distance_km)'
    )
    .eq('status', 'completed')
    .order('end_time', { ascending: false })
    .limit(20)

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Route Optimization & Tracking</h1>
        <p className="text-muted-foreground">Real-time GPS tracking and trip management</p>
      </div>

      <Tabs defaultValue="map" className="w-full">
        <TabsList>
          <TabsTrigger value="map">Live Map</TabsTrigger>
          <TabsTrigger value="active">Active Trips</TabsTrigger>
          <TabsTrigger value="completed">Trip History</TabsTrigger>
          <TabsTrigger value="status">Vehicle Status</TabsTrigger>
        </TabsList>

        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle>Live Vehicle Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <LiveTrackingMap vehicles={vehicleStatus || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Trips</CardTitle>
            </CardHeader>
            <CardContent>
              <TripsTable trips={activeTrips || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Trip History</CardTitle>
            </CardHeader>
            <CardContent>
              <TripsTable trips={completedTrips || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Status</CardTitle>
            </CardHeader>
            <CardContent>
              <VehicleStatusTable vehicles={vehicleStatus || []} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
