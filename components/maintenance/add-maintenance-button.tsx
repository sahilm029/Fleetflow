'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Tabs, TabsContent, TabsList, TabsTrigger } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Vehicle {
  id: string
  make: string
  model: string
  license_plate: string
}

export function AddMaintenanceButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState('schedule')
  const [loading, setLoading] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [scheduleData, setScheduleData] = useState({
    vehicle_id: '',
    service_type: '',
    scheduled_date: '',
    interval_months: 0,
    priority: 'normal',
    estimated_cost: 0,
  })
  const [logData, setLogData] = useState({
    vehicle_id: '',
    service_type: '',
    completion_date: new Date().toISOString().split('T')[0],
    service_provider: '',
    cost: 0,
    odometer_reading: 0,
  })

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await fetch('/api/vehicles')
        if (res.ok) {
          const data = await res.json()
          setVehicles(data)
        }
      } catch (error) {
        console.error('Failed to fetch vehicles:', error)
      }
    }

    if (open) {
      fetchVehicles()
    }
  }, [open])

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/maintenance/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData),
      })

      if (response.ok) {
        setOpen(false)
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to add schedule:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/maintenance/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
      })

      if (response.ok) {
        setOpen(false)
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to add log:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Maintenance
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Maintenance Record</DialogTitle>
          <DialogDescription>
            Add a maintenance schedule or log entry.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 border-b">
          <button
            onClick={() => setTab('schedule')}
            className={`pb-2 px-4 text-sm font-medium ${
              tab === 'schedule'
                ? 'border-b-2 border-foreground'
                : 'text-muted-foreground'
            }`}
          >
            Schedule
          </button>
          <button
            onClick={() => setTab('log')}
            className={`pb-2 px-4 text-sm font-medium ${
              tab === 'log'
                ? 'border-b-2 border-foreground'
                : 'text-muted-foreground'
            }`}
          >
            History
          </button>
        </div>

        {tab === 'schedule' && (
          <form onSubmit={handleScheduleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="vehicle">Vehicle</Label>
              <Select
                value={scheduleData.vehicle_id}
                onValueChange={(value) =>
                  setScheduleData({ ...scheduleData, vehicle_id: value })
                }
              >
                <SelectTrigger id="vehicle">
                  <SelectValue placeholder="Select a vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.make} {vehicle.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="service">Service Type</Label>
              <Input
                id="service"
                required
                value={scheduleData.service_type}
                onChange={(e) =>
                  setScheduleData({
                    ...scheduleData,
                    service_type: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">Scheduled Date</Label>
              <Input
                id="date"
                type="date"
                required
                value={scheduleData.scheduled_date}
                onChange={(e) =>
                  setScheduleData({
                    ...scheduleData,
                    scheduled_date: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={scheduleData.priority}
                onValueChange={(value) =>
                  setScheduleData({ ...scheduleData, priority: value })
                }
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cost">Estimated Cost</Label>
              <Input
                id="cost"
                type="number"
                value={scheduleData.estimated_cost}
                onChange={(e) =>
                  setScheduleData({
                    ...scheduleData,
                    estimated_cost: parseFloat(e.target.value),
                  })
                }
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Adding...' : 'Add Schedule'}
            </Button>
          </form>
        )}

        {tab === 'log' && (
          <form onSubmit={handleLogSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="log-vehicle">Vehicle</Label>
              <Select
                value={logData.vehicle_id}
                onValueChange={(value) =>
                  setLogData({ ...logData, vehicle_id: value })
                }
              >
                <SelectTrigger id="log-vehicle">
                  <SelectValue placeholder="Select a vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.make} {vehicle.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="log-service">Service Type</Label>
              <Input
                id="log-service"
                required
                value={logData.service_type}
                onChange={(e) =>
                  setLogData({ ...logData, service_type: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="log-provider">Service Provider</Label>
              <Input
                id="log-provider"
                value={logData.service_provider}
                onChange={(e) =>
                  setLogData({ ...logData, service_provider: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="log-cost">Cost</Label>
              <Input
                id="log-cost"
                type="number"
                value={logData.cost}
                onChange={(e) =>
                  setLogData({ ...logData, cost: parseFloat(e.target.value) })
                }
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Adding...' : 'Add Log Entry'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
