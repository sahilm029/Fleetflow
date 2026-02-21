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
import { Plus, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Vehicle {
  id: string
  make: string
  model: string
  license_plate: string
}

const SAMPLE_SCHEDULE_DATA = [
  {
    service_type: 'Oil Change',
    scheduled_date: '2026-03-15',
    priority: 'normal',
    estimated_cost: 3500,
    interval_months: 3,
    notes: 'Regular oil change due',
  },
  {
    service_type: 'Brake Inspection',
    scheduled_date: '2026-03-20',
    priority: 'high',
    estimated_cost: 5000,
    interval_months: 6,
    notes: 'Check brake pads and discs',
  },
  {
    service_type: 'AC Service',
    scheduled_date: '2026-04-05',
    priority: 'normal',
    estimated_cost: 8000,
    interval_months: 12,
    notes: 'AC gas refill and filter change',
  },
]

const SAMPLE_LOG_DATA = [
  {
    service_type: 'Oil Change',
    service_provider: 'AutoCare Service Center',
    cost: 3200,
    odometer_reading: 14500,
    notes: 'Oil and filter changed',
  },
  {
    service_type: 'Brake Pad Replacement',
    service_provider: 'Speed Auto Garage',
    cost: 8500,
    odometer_reading: 31200,
    notes: 'Front brake pads replaced',
  },
  {
    service_type: 'Battery Replacement',
    service_provider: 'Exide Battery Center',
    cost: 11500,
    odometer_reading: 4800,
    notes: 'New battery installed',
  },
]

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
    notes: '',
  })
  const [logData, setLogData] = useState({
    vehicle_id: '',
    service_type: '',
    completion_date: new Date().toISOString().split('T')[0],
    service_provider: '',
    cost: 0,
    odometer_reading: 0,
    notes: '',
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
          <>
            {/* Sample Data Cards */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4" />
                <span>Quick Fill:</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_SCHEDULE_DATA.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setScheduleData({ ...scheduleData, ...sample })}
                    className="p-2 text-xs border rounded hover:bg-accent hover:border-primary transition-colors text-left"
                  >
                    <div className="font-semibold">{sample.service_type}</div>
                    <div className="text-muted-foreground">₹{sample.estimated_cost}</div>
                  </button>
                ))}
              </div>
            </div>

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
              <Label htmlFor="interval">Interval (months)</Label>
              <Input
                id="interval"
                type="number"
                value={scheduleData.interval_months}
                onChange={(e) =>
                  setScheduleData({
                    ...scheduleData,
                    interval_months: parseInt(e.target.value),
                  })
                }
              />
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

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={scheduleData.notes}
                onChange={(e) =>
                  setScheduleData({ ...scheduleData, notes: e.target.value })
                }
                placeholder="Optional notes"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Adding...' : 'Add Schedule'}
            </Button>
          </form>
          </>
        )}

        {tab === 'log' && (
          <>
            {/* Sample Data Cards */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4" />
                <span>Quick Fill:</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_LOG_DATA.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setLogData({ ...logData, ...sample, completion_date: new Date().toISOString().split('T')[0] })}
                    className="p-2 text-xs border rounded hover:bg-accent hover:border-primary transition-colors text-left"
                  >
                    <div className="font-semibold">{sample.service_type}</div>
                    <div className="text-muted-foreground">₹{sample.cost}</div>
                  </button>
                ))}
              </div>
            </div>

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
              <Label htmlFor="log-odometer">Odometer Reading (km)</Label>
              <Input
                id="log-odometer"
                type="number"
                value={logData.odometer_reading}
                onChange={(e) =>
                  setLogData({
                    ...logData,
                    odometer_reading: parseFloat(e.target.value),
                  })
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

            <div className="grid gap-2">
              <Label htmlFor="log-notes">Notes</Label>
              <Input
                id="log-notes"
                value={logData.notes}
                onChange={(e) =>
                  setLogData({ ...logData, notes: e.target.value })
                }
                placeholder="Optional notes"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Adding...' : 'Add Log Entry'}
            </Button>
          </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
