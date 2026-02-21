'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface MaintenanceLog {
  id: string
  vehicle_id: string
  service_type: string
  completion_date: string
  service_provider: string
  cost: number
  odometer_reading: number
  notes: string
  vehicles: {
    make: string
    model: string
    license_plate: string
  }
}

export function MaintenanceLogsTable({
  logs,
}: {
  logs: MaintenanceLog[]
}) {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No maintenance history found.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Vehicle</TableHead>
          <TableHead>Service Type</TableHead>
          <TableHead>Completion Date</TableHead>
          <TableHead>Service Provider</TableHead>
          <TableHead>Cost</TableHead>
          <TableHead>Odometer</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.id}>
            <TableCell className="font-medium">
              {log.vehicles?.make} {log.vehicles?.model}
            </TableCell>
            <TableCell>{log.service_type}</TableCell>
            <TableCell>
              {new Date(log.completion_date).toLocaleDateString()}
            </TableCell>
            <TableCell>{log.service_provider || 'N/A'}</TableCell>
            <TableCell>${log.cost?.toFixed(2)}</TableCell>
            <TableCell>{log.odometer_reading?.toLocaleString()} km</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
