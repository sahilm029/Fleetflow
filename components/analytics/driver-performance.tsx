'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface Trip {
  distance_km: number | null
  fuel_used: number | null
  duration_hours: number | null
}

export function DriverPerformanceChart({ trips }: { trips: Trip[] }) {
  // Create cumulative distance data for the last 10 trips
  const data = trips.slice(-10).map((trip, idx) => ({
    trip: `Trip ${idx + 1}`,
    distance: trip.distance_km || 0,
    duration: trip.duration_hours || 0,
    avgSpeed:
      trip.distance_km && trip.duration_hours
        ? (trip.distance_km / trip.duration_hours).toFixed(2)
        : 0,
  }))

  if (data.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center text-muted-foreground">
        <p>No trip data available</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="trip" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area
          type="monotone"
          dataKey="distance"
          fill="#3b82f6"
          stroke="#3b82f6"
          name="Distance (km)"
          opacity={0.7}
        />
        <Area
          type="monotone"
          dataKey="avgSpeed"
          fill="#8b5cf6"
          stroke="#8b5cf6"
          name="Avg Speed (km/h)"
          opacity={0.7}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
