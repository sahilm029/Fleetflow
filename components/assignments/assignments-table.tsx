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

interface Assignment {
  id: string
  vehicle_id: string
  driver_id: string
  is_active: boolean
  assigned_date: string
  unassigned_date: string | null
  vehicles: {
    make: string
    model: string
    license_plate: string
  }
  profiles: {
    first_name: string
    last_name: string
    email: string
  }
}

export function AssignmentsTable({
  assignments,
  canEdit,
}: {
  assignments: Assignment[]
  canEdit: boolean
}) {
  if (!assignments || assignments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No assignments found.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Driver</TableHead>
          <TableHead>Vehicle</TableHead>
          <TableHead>License Plate</TableHead>
          <TableHead>Assigned Date</TableHead>
          <TableHead>Status</TableHead>
          {canEdit && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {assignments.map((assignment) => (
          <TableRow key={assignment.id}>
            <TableCell className="font-medium">
              {assignment.profiles?.first_name} {assignment.profiles?.last_name}
            </TableCell>
            <TableCell>
              {assignment.vehicles?.make} {assignment.vehicles?.model}
            </TableCell>
            <TableCell>{assignment.vehicles?.license_plate}</TableCell>
            <TableCell>
              {new Date(assignment.assigned_date).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <Badge className={assignment.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {assignment.is_active ? 'Active' : 'Inactive'}
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
