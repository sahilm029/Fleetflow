'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Power, Loader2, MapPin, Navigation, CheckCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface Assignment {
  id: string
  vehicle_id: string
  is_active: boolean
  vehicles?: {
    make: string
    model: string
    license_plate: string
  }
}

interface VehicleStatus {
  vehicle_id: string
  is_online: boolean
  current_latitude: number | null
  current_longitude: number | null
  last_update: string
}

export function DriverVehicleStatus({ assignments }: { assignments: Assignment[] }) {
  const [vehicleStatuses, setVehicleStatuses] = useState<Map<string, VehicleStatus>>(new Map())
  const [loading, setLoading] = useState<Map<string, boolean>>(new Map())
  const { toast } = useToast()

  const activeAssignments = assignments.filter((a) => a.is_active === true)

  const completeAssignment = async (assignmentId: string, vehicleId: string) => {
    try {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'PATCH',
      })
      if (response.ok) {
        toast({ title: '✅ Assignment Completed', description: 'Vehicle has been released and you are now offline.' })
        // Remove from local state instantly
        setVehicleStatuses((prev) => {
          const next = new Map(prev)
          next.delete(vehicleId)
          return next
        })
        // Reload the page so the assignment disappears
        window.location.reload()
      } else {
        const err = await response.json()
        toast({ title: 'Error', description: err.error || 'Failed to complete assignment', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
  }

  useEffect(() => {
    fetchAllStatuses()
    // Poll every 10 seconds for updates
    const interval = setInterval(fetchAllStatuses, 10000)
    return () => clearInterval(interval)
  }, [assignments])

  const fetchAllStatuses = async () => {
    for (const assignment of activeAssignments) {
      try {
        const response = await fetch(`/api/vehicle-status?vehicle_id=${assignment.vehicle_id}`)
        if (response.ok) {
          const data = await response.json()
          if (data.length > 0) {
            setVehicleStatuses((prev) => new Map(prev).set(assignment.vehicle_id, data[0]))
          }
        }
      } catch (error) {
        console.error('Error fetching vehicle status:', error)
      }
    }
  }

  const getLocation = (): Promise<{ lat: number; lng: number }> =>
    new Promise((resolve) => {
      if (!navigator.geolocation) return resolve({ lat: 28.6139, lng: 77.2090 })
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve({ lat: 28.6139, lng: 77.2090 }),
        { timeout: 5000 }
      )
    })

  const toggleOnlineStatus = async (vehicleId: string, currentStatus: boolean) => {
    setLoading((prev) => new Map(prev).set(vehicleId, true))

    try {
      const goingOnline = !currentStatus
      let coords: { lat: number; lng: number } | null = null
      if (goingOnline) {
        coords = await getLocation()
      }

      const response = await fetch('/api/vehicle-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle_id: vehicleId,
          is_online: goingOnline,
          ...(coords && { current_latitude: coords.lat, current_longitude: coords.lng }),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setVehicleStatuses((prev) => new Map(prev).set(vehicleId, data))
        toast({
          title: !currentStatus ? '🟢 Online' : '⚫ Offline',
          description: !currentStatus
            ? 'You are now online and available for trips'
            : 'You are now offline',
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to update status',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update vehicle status',
        variant: 'destructive',
      })
    } finally {
      setLoading((prev) => new Map(prev).set(vehicleId, false))
    }
  }

  if (activeAssignments.length === 0) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-sm text-muted-foreground">No vehicle assigned to you yet. Contact your manager.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Your Vehicle Status</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {activeAssignments.map((assignment) => {
          const status = vehicleStatuses.get(assignment.vehicle_id)
          const isLoading = loading.get(assignment.vehicle_id) || false
          const isOnline = status?.is_online || false

          return (
            <Card key={assignment.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {assignment.vehicles?.make} {assignment.vehicles?.model}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {assignment.vehicles?.license_plate}
                    </p>
                  </div>
                  <Badge variant={isOnline ? 'default' : 'secondary'} className={isOnline ? 'bg-green-600' : ''}>
                    {isOnline ? '🟢 Online' : '⚫ Offline'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {status?.current_latitude && status?.current_longitude && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Navigation className="w-3 h-3" />
                    GPS: {status.current_latitude.toFixed(4)}, {status.current_longitude.toFixed(4)}
                  </div>
                )}
                
                {status?.last_update && (
                  <div className="text-xs text-muted-foreground">
                    Last update: {new Date(status.last_update).toLocaleString()}
                  </div>
                )}

                <Button
                  onClick={() => toggleOnlineStatus(assignment.vehicle_id, isOnline)}
                  disabled={isLoading}
                  variant={isOnline ? 'outline' : 'default'}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Power className="mr-2 h-4 w-4" />
                      {isOnline ? 'Go Offline' : 'Go Online'}
                    </>
                  )}
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full text-muted-foreground hover:text-red-600">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Complete Assignment
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Complete this assignment?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will mark the assignment as completed and release the vehicle. You will be set offline automatically.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => completeAssignment(assignment.id, assignment.vehicle_id)}>
                        Complete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>


              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
