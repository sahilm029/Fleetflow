'use client'

import { Card } from '@/components/ui/card'
import { MapPin, Navigation } from 'lucide-react'

interface Vehicle {
  id: string
  vehicle_id: string
  current_latitude: number | null
  current_longitude: number | null
  is_online: boolean
  last_update: string
  vehicles: {
    make: string
    model: string
    license_plate: string
    id: string
  }
}

export function LiveTrackingMap({ vehicles }: { vehicles: Vehicle[] }) {
  const onlineVehicles = vehicles.filter((v) => v.is_online)
  const offlineVehicles = vehicles.filter((v) => !v.is_online)

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-muted-foreground">No vehicle location data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm font-medium text-muted-foreground">Online Vehicles</div>
          <div className="text-3xl font-bold text-green-600">{onlineVehicles.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-medium text-muted-foreground">Offline Vehicles</div>
          <div className="text-3xl font-bold text-gray-600">{offlineVehicles.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-medium text-muted-foreground">Total Fleet</div>
          <div className="text-3xl font-bold text-blue-600">{vehicles.length}</div>
        </Card>
      </div>

      <Card className="p-6 space-y-4">
        <div className="space-y-3">
          <h3 className="font-semibold">Vehicle Locations</h3>
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.vehicle_id}
              className="flex items-start justify-between p-3 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <div className="space-y-1">
                <div className="font-medium flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      vehicle.is_online ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  />
                  {vehicle.vehicles?.make} {vehicle.vehicles?.model}
                </div>
                <div className="text-sm text-muted-foreground">
                  {vehicle.vehicles?.license_plate}
                </div>
                {vehicle.current_latitude && vehicle.current_longitude ? (
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Navigation className="w-3 h-3" />
                    {vehicle.current_latitude.toFixed(4)}, {vehicle.current_longitude.toFixed(4)}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">No location data</div>
                )}
              </div>
              <div className="text-right space-y-1">
                <div className={`text-xs font-medium ${vehicle.is_online ? 'text-green-600' : 'text-gray-600'}`}>
                  {vehicle.is_online ? 'Online' : 'Offline'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {vehicle.last_update
                    ? new Date(vehicle.last_update).toLocaleTimeString()
                    : 'N/A'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="text-xs text-muted-foreground p-4 bg-blue-50 rounded-lg">
        <strong>Note:</strong> Live map integration with Mapbox or Google Maps can be added for full geographic visualization.
        Currently displaying location coordinates for all tracked vehicles.
      </div>
    </div>
  )
}
