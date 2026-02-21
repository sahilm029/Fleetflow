'use client'

import {
  LineChart,
  Line,
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
}

export function FuelConsumptionChart({ trips }: { trips: Trip[] }) {
  // Create data for the last 10 trips
  const data = trips.slice(-10).map((trip, idx) => ({
    trip: `Trip ${idx + 1}`,
    fuelUsed: trip.fuel_used || 0,
    efficiency: trip.distance_km && trip.fuel_used
      ? (trip.distance_km / trip.fuel_used).toFixed(2)
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
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="trip" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="fuelUsed"
          stroke="#f59e0b"
          name="Fuel Used (L)"
        />
        <Line
          type="monotone"
          dataKey="efficiency"
          stroke="#10b981"
          name="Efficiency (km/L)"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
