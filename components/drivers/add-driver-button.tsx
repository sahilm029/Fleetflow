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

export function AddDriverButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    user_id: '',
    license_number: '',
    license_expiry: '',
    phone: '',
    status: 'active',
    experience_years: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setOpen(false)
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to add driver:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Driver
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Driver</DialogTitle>
          <DialogDescription>
            Enter driver details to add to your team.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="license-number">License Number</Label>
            <Input
              id="license-number"
              required
              value={formData.license_number}
              onChange={(e) =>
                setFormData({ ...formData, license_number: e.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="license-expiry">License Expiry Date</Label>
            <Input
              id="license-expiry"
              type="date"
              required
              value={formData.license_expiry}
              onChange={(e) =>
                setFormData({ ...formData, license_expiry: e.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="experience">Years of Experience</Label>
            <Input
              id="experience"
              type="number"
              value={formData.experience_years}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  experience_years: parseInt(e.target.value),
                })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Adding...' : 'Add Driver'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
