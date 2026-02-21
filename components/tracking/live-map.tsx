'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Card } from '@/components/ui/card'
import { MapPin, Navigation } from 'lucide-react'

// Load the entire Leaflet map only on the client — prevents SSR "appendChild" crash
const MapInner = dynamic(() => import('./map-inner'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-50">
      <p className="text-sm text-muted-foreground">Loading map…</p>
    </div>
  ),
})

interface Vehicle {
  id: string
  vehicle_id: string
  current_latitude: number | null
  current_longitude: number | null
  is_online: boolean
  last_update: string
  vehicles?: {
    make: string
    model: string
    license_plate: string
    id: string
  }
}

export function LiveTrackingMap({ vehicles }: { vehicles: Vehicle[] }) {
  const onlineVehicles = vehicles.filter((v) => v.is_online)
  const offlineVehicles = vehicles.filter((v) => !v.is_online)

  const center = useMemo(() => {
    const withLocation = vehicles.filter((v) => v.current_latitude && v.current_longitude)
    if (withLocation.length === 0) return { lat: 28.6139, lng: 77.209 }
    return {
      lat: withLocation.reduce((s, v) => s + (v.current_latitude ?? 0), 0) / withLocation.length,
      lng: withLocation.reduce((s, v) => s + (v.current_longitude ?? 0), 0) / withLocation.length,
    }
  }, [vehicles])

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-muted-foreground">No vehicle data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm font-medium text-muted-foreground">Online</div>
          <div className="text-3xl font-bold text-green-600">{onlineVehicles.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-medium text-muted-foreground">Offline</div>
          <div className="text-3xl font-bold text-gray-600">{offlineVehicles.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-medium text-muted-foreground">Total</div>
          <div className="text-3xl font-bold text-blue-600">{vehicles.length}</div>
        </Card>
      </div>

      {/* Map */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Live Fleet Map</h3>
        <div className="h-96 rounded-lg overflow-hidden border border-border">
          <MapInner vehicles={vehicles} center={center} />
        </div>
      </Card>

      {/* Vehicle list */}
      <Card className="p-6">
        <h3 className="font-semibold mb-3">Vehicle Locations</h3>
        <div className="space-y-2">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.vehicle_id}
              className="flex items-start justify-between p-3 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <div className="space-y-1">
                <div className="font-medium flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${vehicle.is_online ? 'bg-green-500' : 'bg-gray-400'}`} />
                  {vehicle.vehicles?.make} {vehicle.vehicles?.model}
                </div>
                <div className="text-sm text-muted-foreground">{vehicle.vehicles?.license_plate}</div>
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
                  {vehicle.last_update ? new Date(vehicle.last_update).toLocaleTimeString() : 'N/A'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}