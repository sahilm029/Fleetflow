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
import { createClient } from '@/lib/supabase/client'

interface Profile {
  id: string
  first_name: string
  last_name: string
  email: string
}

const SAMPLE_DATA = [
  {
    license_number: 'DL1420230012345',
    license_expiry: '2028-03-15',
    phone: '+91-9876543210',
    experience_years: 8,
  },
  {
    license_number: 'MH0220230012347',
    license_expiry: '2029-01-10',
    phone: '+91-9876543212',
    experience_years: 12,
  },
  {
    license_number: 'KA0320230012354',
    license_expiry: '2028-07-11',
    phone: '+91-9876543219',
    experience_years: 18,
  },
]

export function AddDriverButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [profilesLoading, setProfilesLoading] = useState(false)
  const [profilesError, setProfilesError] = useState('')
  const [error, setError] = useState('')
  const [availableProfiles, setAvailableProfiles] = useState<Profile[]>([])
  const [formData, setFormData] = useState({
    user_id: '',
    license_number: '',
    license_expiry: '',
    phone: '',
    status: 'active',
    experience_years: 0,
  })

  useEffect(() => {
    const fetchAvailableProfiles = async () => {
      if (!open) return

      setProfilesLoading(true)
      setProfilesError('')
      
      try {
        const supabase = createClient()
        
        // Get all profiles with role 'driver'
        const { data: allProfiles, error: profilesErr } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .eq('role', 'driver')

        if (profilesErr) {
          console.error('Profiles fetch error:', profilesErr)
          setProfilesError('🔒 Cannot load profiles - RLS not disabled. Run the SQL fix script!')
          return
        }

        // Get existing driver user_ids
        const { data: existingDrivers } = await supabase
          .from('drivers')
          .select('user_id')

        const existingIds = new Set(existingDrivers?.map(d => d.user_id) || [])
        
        // Filter out profiles that already have driver records
        const available = allProfiles?.filter(p => !existingIds.has(p.id)) || []
        setAvailableProfiles(available)
        
        if (available.length === 0) {
          setProfilesError('No available profiles found. Create users with "driver" role first.')
        }
      } catch (error) {
        console.error('Error fetching profiles:', error)
        setProfilesError('Failed to load profiles. Check console for details.')
      } finally {
        setProfilesLoading(false)
      }
    }

    fetchAvailableProfiles()
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate user_id is selected
    if (!formData.user_id) {
      setError('Please select a driver profile')
      return
    }
    
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setOpen(false)
        setFormData({
          user_id: '',
          license_number: '',
          license_expiry: '',
          phone: '',
          status: 'active',
          experience_years: 0,
        })
        router.refresh()
      } else {
        setError(data.error || 'Failed to add driver')
        console.error('API Error:', data)
      }
    } catch (error) {
      setError('Network error. Please try again.')
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
                onClick={() => setFormData({ ...formData, ...sample, status: 'active' })}
                className="p-2 text-xs border rounded hover:bg-accent hover:border-primary transition-colors text-left"
              >
                <div className="font-semibold">{sample.license_number}</div>
                <div className="text-muted-foreground">{sample.experience_years} yrs exp</div>
              </button>
            ))}
          </div>
        </div>

        {/* Profiles Loading/Error States */}
        {profilesError && (
          <div className="p-3 text-sm bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">
            {profilesError}
          </div>
        )}

        {/* Form Error Display */}
        {error && (
          <div className="p-3 text-sm bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="user">Select Driver Profile</Label>
            {profilesLoading ? (
              <div className="p-2 text-sm text-muted-foreground border rounded">Loading profiles...</div>
            ) : (
              <Select
                value={formData.user_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, user_id: value })
                }
                disabled={availableProfiles.length === 0}
              >
                <SelectTrigger id="user">
                  <SelectValue placeholder="Select a driver profile" />
                </SelectTrigger>
                <SelectContent>
                  {availableProfiles.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No available profiles
                    </SelectItem>
                  ) : (
                    availableProfiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.first_name} {profile.last_name} ({profile.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

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
