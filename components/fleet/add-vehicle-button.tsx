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
import { Plus, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

const SAMPLE_DATA = [
  {
    make: 'Toyota',
    model: 'Camry',
    year: 2022,
    license_plate: 'DL-01-AB-1234',
    vin: '1HGBH41JXMN109186',
    current_odometer: 15000,
    fuel_capacity: 50,
  },
  {
    make: 'Maruti',
    model: 'Swift',
    year: 2023,
    license_plate: 'MH-02-CD-5678',
    vin: 'MA3ERLF7S00123456',
    current_odometer: 8000,
    fuel_capacity: 35,
  },
  {
    make: 'Mahindra',
    model: 'Scorpio',
    year: 2022,
    license_plate: 'KA-03-EF-9012',
    vin: 'MBLHA26S9JT012345',
    current_odometer: 22000,
    fuel_capacity: 60,
  },
]

export function AddVehicleButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
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
    setError('')

    try {
      // Ensure numeric fields are numbers, not strings
      const payload = {
        ...formData,
        year: Number(formData.year),
        current_odometer: Number(formData.current_odometer) || 0,
        fuel_capacity: Number(formData.fuel_capacity) || 0,
      }

      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        setOpen(false)
        setFormData({
          vin: '',
          make: '',
          model: '',
          year: new Date().getFullYear(),
          license_plate: '',
          status: 'available',
          current_odometer: 0,
          fuel_capacity: 50,
        })
        router.refresh()
      } else {
        setError(data.error || 'Failed to add vehicle')
        console.error('API Error:', data)
      }
    } catch (error) {
      setError('Network error. Please try again.')
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

        {/* Sample Data Cards */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            <span>Quick Fill - Click to use sample data:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {SAMPLE_DATA.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setFormData({ ...formData, ...sample, status: 'available' })}
                className="p-2 text-xs border rounded hover:bg-accent hover:border-primary transition-colors text-left"
              >
                <div className="font-semibold">{sample.make} {sample.model}</div>
                <div className="text-muted-foreground">{sample.license_plate}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 text-sm bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">
            {error}
          </div>
        )}

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
