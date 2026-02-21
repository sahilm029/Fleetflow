'use client'

import { useState } from 'react'
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
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function AddVehicleButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    vin: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    license_plate: '',
    status: 'available',
    current_odometer: 0,
    fuel_capacity: 50,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setOpen(false)
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to add vehicle:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Vehicle
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Vehicle</DialogTitle>
          <DialogDescription>
            Enter vehicle details to add to your fleet.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="make">Make</Label>
              <Input
                id="make"
                required
                value={formData.make}
                onChange={(e) =>
                  setFormData({ ...formData, make: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                required
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                required
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: parseInt(e.target.value) })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="license-plate">License Plate</Label>
              <Input
                id="license-plate"
                required
                value={formData.license_plate}
                onChange={(e) =>
                  setFormData({ ...formData, license_plate: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="vin">VIN</Label>
            <Input
              id="vin"
              required
              value={formData.vin}
              onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="odometer">Current Odometer (km)</Label>
              <Input
                id="odometer"
                type="number"
                value={formData.current_odometer}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    current_odometer: parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fuel-capacity">Fuel Capacity (liters)</Label>
              <Input
                id="fuel-capacity"
                type="number"
                value={formData.fuel_capacity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fuel_capacity: parseFloat(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="in_use">In Use</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Adding...' : 'Add Vehicle'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
