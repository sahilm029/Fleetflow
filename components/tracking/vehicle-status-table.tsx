'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

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
  }
}

export function VehicleStatusTable({ vehicles }: { vehicles: Vehicle[] }) {
  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No vehicle status data available.</p>
      </div>
    )
  }

  const getTimeAgo = (date: string) => {
    const now = new Date()
    const then = new Date(date)
    const diff = now.getTime() - then.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return `${seconds}s ago`
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Vehicle</TableHead>
          <TableHead>License Plate</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Latitude</TableHead>
          <TableHead>Longitude</TableHead>
          <TableHead>Last Update</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vehicles.map((vehicle) => (
          <TableRow key={vehicle.vehicle_id}>
            <TableCell className="font-medium">
              {vehicle.vehicles?.make} {vehicle.vehicles?.model}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {vehicle.vehicles?.license_plate}
            </TableCell>
            <TableCell>
              <Badge
                className={
                  vehicle.is_online
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }
              >
                {vehicle.is_online ? 'Online' : 'Offline'}
              </Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {vehicle.current_latitude ? vehicle.current_latitude.toFixed(6) : 'N/A'}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {vehicle.current_longitude ? vehicle.current_longitude.toFixed(6) : 'N/A'}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {vehicle.last_update ? getTimeAgo(vehicle.last_update) : 'Never'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
