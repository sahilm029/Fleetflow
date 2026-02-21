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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Driver {
  id: string
  user_id: string
  license_number: string
  profiles?: { first_name: string; last_name: string }
}

interface Vehicle {
  id: string
  make: string
  model: string
  license_plate: string
}

export function AddAssignmentButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [formData, setFormData] = useState({
    vehicle_id: '',
    driver_id: '',
    is_active: true,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [driversRes, vehiclesRes] = await Promise.all([
          fetch('/api/drivers'),
          fetch('/api/vehicles'),
        ])

        if (driversRes.ok) {
          const driversData = await driversRes.json()
          setDrivers(driversData)
        }

        if (vehiclesRes.ok) {
          const vehiclesData = await vehiclesRes.json()
          setVehicles(vehiclesData)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
    }

    if (open) {
      fetchData()
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.vehicle_id || !formData.driver_id) {
      setError('Please select both a driver and a vehicle')
      return
    }
    
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setOpen(false)
        setFormData({
          vehicle_id: '',
          driver_id: '',
          is_active: true,
        })
        router.refresh()
      } else {
        setError(data.error || 'Failed to create assignment')
        console.error('API Error:', data)
      }
    } catch (error) {
      setError('Network error. Please try again.')
      console.error('Failed to add assignment:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Assignment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Vehicle Assignment</DialogTitle>
          <DialogDescription>
            Assign a vehicle to a driver. The driver will instantly be able to go online from their dashboard.
          </DialogDescription>
        </DialogHeader>

        {/* Error Display */}
        {error && (
          <div className="p-3 text-sm bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="driver">Driver</Label>
            <Select
              value={formData.driver_id}
              onValueChange={(value) =>
                setFormData({ ...formData, driver_id: value })
              }
            >
              <SelectTrigger id="driver">
                <SelectValue placeholder="Select a driver" />
              </SelectTrigger>
              <SelectContent>
                {drivers.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No drivers available
                  </SelectItem>
                ) : (
                  drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.user_id}>
                      {driver.profiles 
                        ? `${driver.profiles.first_name} ${driver.profiles.last_name}`
                        : `Driver: ${driver.license_number}`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="vehicle">Vehicle</Label>
            <Select
              value={formData.vehicle_id}
              onValueChange={(value) =>
                setFormData({ ...formData, vehicle_id: value })
              }
            >
              <SelectTrigger id="vehicle">
                <SelectValue placeholder="Select a vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No vehicles available
                  </SelectItem>
                ) : (
                  vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.make} {vehicle.model} ({vehicle.license_plate})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Adding...' : 'Add Assignment'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
