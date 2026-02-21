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
import { Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Vehicle {
  id: string
  vin: string
  make: string
  model: string
  year: number
  license_plate: string
  status: 'available' | 'in_use' | 'maintenance' | 'retired'
  current_odometer: number
  fuel_capacity: number
  created_at: string
}

export function VehiclesTable({
  vehicles,
  canEdit,
}: {
  vehicles: Vehicle[]
  canEdit: boolean
}) {
  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No vehicles found. Add one to get started.</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'in_use':
        return 'bg-blue-100 text-blue-800'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800'
      case 'retired':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Make/Model</TableHead>
          <TableHead>License Plate</TableHead>
          <TableHead>VIN</TableHead>
          <TableHead>Year</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Odometer</TableHead>
          {canEdit && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {vehicles.map((vehicle) => (
          <TableRow key={vehicle.id}>
            <TableCell className="font-medium">
              {vehicle.make} {vehicle.model}
            </TableCell>
            <TableCell>{vehicle.license_plate}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {vehicle.vin.slice(-6)}
            </TableCell>
            <TableCell>{vehicle.year}</TableCell>
            <TableCell>
              <Badge className={getStatusColor(vehicle.status)}>
                {vehicle.status}
              </Badge>
            </TableCell>
            <TableCell>{vehicle.current_odometer?.toLocaleString() || 'N/A'} km</TableCell>
            {canEdit && (
              <TableCell>
                <div className="flex gap-2">
                  <Link href={`/dashboard/fleet/${vehicle.id}`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" className="text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
