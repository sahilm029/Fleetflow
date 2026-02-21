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
import { Clock, Navigation } from 'lucide-react'

interface Trip {
  id: string
  vehicle_id: string
  driver_id: string
  route_id: string | null
  start_time: string
  end_time: string | null
  distance_km: number
  duration_hours: number
  fuel_used: number
  status: 'in_progress' | 'completed' | 'cancelled'
  vehicles: {
    make: string
    model: string
    license_plate: string
  }
  profiles: {
    first_name: string
    last_name: string
  }
  routes: {
    name: string
    distance_km: number
  } | null
}

export function TripsTable({ trips }: { trips: Trip[] }) {
  if (!trips || trips.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No trips found.</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateDuration = (startTime: string, endTime: string | null) => {
    if (!endTime) {
      const now = new Date()
      const start = new Date(startTime)
      const diff = now.getTime() - start.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      return `${hours}h ${minutes}m (ongoing)`
    }

    const start = new Date(startTime)
    const end = new Date(endTime)
    const diff = end.getTime() - start.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Vehicle</TableHead>
          <TableHead>Driver</TableHead>
          <TableHead>Route</TableHead>
          <TableHead>Start Time</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Distance</TableHead>
          <TableHead>Fuel Used</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {trips.map((trip) => (
          <TableRow key={trip.id}>
            <TableCell className="font-medium">
              {trip.vehicles?.make} {trip.vehicles?.model}
            </TableCell>
            <TableCell>
              {trip.profiles?.first_name} {trip.profiles?.last_name}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {trip.routes?.name || 'Custom Route'}
            </TableCell>
            <TableCell>
              {new Date(trip.start_time).toLocaleString()}
            </TableCell>
            <TableCell className="text-sm">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {calculateDuration(trip.start_time, trip.end_time)}
              </div>
            </TableCell>
            <TableCell className="text-sm">
              <div className="flex items-center gap-1">
                <Navigation className="w-4 h-4" />
                {trip.distance_km?.toFixed(2) || 'N/A'} km
              </div>
            </TableCell>
            <TableCell>{trip.fuel_used?.toFixed(2) || 'N/A'} L</TableCell>
            <TableCell>
              <Badge className={getStatusColor(trip.status)}>
                {trip.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
