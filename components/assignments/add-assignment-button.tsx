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
  profiles: { first_name: string; last_name: string }
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
    setLoading(true)

    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setOpen(false)
        router.refresh()
      }
    } catch (error) {
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
            Assign a vehicle to a driver.
          </DialogDescription>
        </DialogHeader>
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
                {drivers.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {driver.profiles?.first_name} {driver.profiles?.last_name}
                  </SelectItem>
                ))}
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
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.make} {vehicle.model} ({vehicle.license_plate})
                  </SelectItem>
                ))}
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
