'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { Map as LeafletMap } from 'leaflet'

interface Vehicle {
  vehicle_id: string
  current_latitude: number | null
  current_longitude: number | null
  is_online: boolean
  last_update: string
  vehicles?: {
    make: string
    model: string
    license_plate: string
  }
}

interface MapInnerProps {
  vehicles: Vehicle[]
  center: { lat: number; lng: number }
}

export default function MapInner({ vehicles, center }: MapInnerProps) {
  useEffect(() => {
    // Fix Leaflet default icon paths broken by webpack
    const L = require('leaflet')
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    })
  }, [])

  const createIcon = (isOnline: boolean) => {
    const L = require('leaflet')
    return L.divIcon({
      className: '',
      html: `<div style="width:28px;height:28px;border-radius:50%;background:${
        isOnline ? '#10b981' : '#6b7280'
      };border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    })
  }

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {vehicles.map((vehicle) => {
        if (!vehicle.current_latitude || !vehicle.current_longitude) return null
        return (
          <Marker
            key={vehicle.vehicle_id}
            position={[vehicle.current_latitude, vehicle.current_longitude]}
            icon={createIcon(vehicle.is_online)}
          >
            <Popup>
              <div className="p-1">
                <strong className="text-sm block">{vehicle.vehicles?.make} {vehicle.vehicles?.model}</strong>
                <span className="text-xs text-gray-500 block">{vehicle.vehicles?.license_plate}</span>
                <span className={`text-xs font-semibold block ${vehicle.is_online ? 'text-emerald-600' : 'text-gray-500'}`}>
                  {vehicle.is_online ? '🟢 Online' : '⚫ Offline'}
                </span>
                <span className="text-xs text-gray-400 block">
                  {vehicle.last_update
                    ? new Date(vehicle.last_update).toLocaleTimeString()
                    : 'No update'}
                </span>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
