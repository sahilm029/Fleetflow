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

interface Driver {
  id: string
  user_id: string
  license_number: string
  license_expiry: string
  phone: string
  status: 'active' | 'inactive' | 'on_leave'
  experience_years: number
  profiles: {
    first_name: string
    last_name: string
    email: string
    phone: string
  }
}

export function DriversTable({
  drivers,
  canEdit,
}: {
  drivers: Driver[]
  canEdit: boolean
}) {
  if (!drivers || drivers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No drivers found.</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'on_leave':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const isLicenseExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date()
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>License #</TableHead>
          <TableHead>License Expires</TableHead>
          <TableHead>Experience</TableHead>
          <TableHead>Status</TableHead>
          {canEdit && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {drivers.map((driver) => (
          <TableRow key={driver.id}>
            <TableCell className="font-medium">
              {driver.profiles?.first_name} {driver.profiles?.last_name}
            </TableCell>
            <TableCell>{driver.profiles?.email}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {driver.license_number}
            </TableCell>
            <TableCell>
              {driver.license_expiry ? (
                <span
                  className={
                    isLicenseExpired(driver.license_expiry)
                      ? 'text-red-600 font-medium'
                      : ''
                  }
                >
                  {new Date(driver.license_expiry).toLocaleDateString()}
                </span>
              ) : (
                'N/A'
              )}
            </TableCell>
            <TableCell>{driver.experience_years || 0} years</TableCell>
            <TableCell>
              <Badge className={getStatusColor(driver.status)}>
                {driver.status}
              </Badge>
            </TableCell>
            {canEdit && (
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
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
