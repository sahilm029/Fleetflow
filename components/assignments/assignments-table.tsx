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
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface Assignment {
  id: string
  vehicle_id: string
  driver_id: string
  is_active: boolean
  assigned_date: string
  unassigned_date: string | null
  vehicles?: {
    make: string
    model: string
    license_plate: string
  }
  profiles?: {
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
  const router = useRouter()
  const { toast } = useToast()

  const completeAssignment = async (id: string) => {
    try {
      const res = await fetch(`/api/assignments/${id}`, { method: 'PATCH' })
      if (res.ok) {
        toast({ title: '✅ Assignment completed', description: 'Vehicle is now offline.' })
        router.refresh()
      } else {
        const err = await res.json()
        toast({ title: 'Error', description: err.error || 'Failed to complete', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
  }
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
              {assignment.profiles
                ? `${assignment.profiles.first_name} ${assignment.profiles.last_name}`
                : `Driver ID: ${assignment.driver_id.substring(0, 8)}...`}
            </TableCell>
            <TableCell>
              {assignment.vehicles
                ? `${assignment.vehicles.make} ${assignment.vehicles.model}`
                : `Vehicle ID: ${assignment.vehicle_id.substring(0, 8)}...`}
            </TableCell>
            <TableCell>
              {assignment.vehicles?.license_plate || 'N/A'}
            </TableCell>
            <TableCell>
              {new Date(assignment.assigned_date).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <Badge className={assignment.is_active ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                  {assignment.is_active ? 'Active' : 'Completed'}
                </Badge>
                {!assignment.is_active && assignment.unassigned_date && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(assignment.unassigned_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            </TableCell>
            {canEdit && (
              <TableCell>
                <div className="flex gap-2">
                  {assignment.is_active && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Complete this assignment?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will mark the assignment as completed and set the driver offline.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => completeAssignment(assignment.id)}>Complete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
