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
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface MaintenanceSchedule {
  id: string
  vehicle_id: string
  service_type: string
  scheduled_date: string
  interval_months: number
  priority: 'low' | 'normal' | 'high' | 'critical'
  estimated_cost: number
  notes: string
  vehicles: {
    make: string
    model: string
    license_plate: string
  }
}

export function MaintenanceScheduleTable({
  schedules,
  canEdit,
}: {
  schedules: MaintenanceSchedule[]
  canEdit: boolean
}) {
  if (!schedules || schedules.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No maintenance schedules found.</p>
      </div>
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'normal':
        return 'bg-blue-100 text-blue-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const isOverdue = (date: string) => new Date(date) < new Date()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Vehicle</TableHead>
          <TableHead>Service Type</TableHead>
          <TableHead>Scheduled Date</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Estimated Cost</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {schedules.map((schedule) => {
          const overdue = isOverdue(schedule.scheduled_date)
          return (
            <TableRow key={schedule.id} className={overdue ? 'bg-red-50' : ''}>
              <TableCell className="font-medium">
                {schedule.vehicles?.make} {schedule.vehicles?.model}
              </TableCell>
              <TableCell>{schedule.service_type}</TableCell>
              <TableCell>
                {new Date(schedule.scheduled_date).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Badge className={getPriorityColor(schedule.priority)}>
                  {schedule.priority}
                </Badge>
              </TableCell>
              <TableCell>${schedule.estimated_cost?.toFixed(2)}</TableCell>
              <TableCell>
                {overdue ? (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Overdue</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Scheduled</span>
                  </div>
                )}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
