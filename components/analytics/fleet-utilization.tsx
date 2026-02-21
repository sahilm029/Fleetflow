'use client'

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'

export function FleetUtilizationChart({
  vehicles,
  trips,
}: {
  vehicles: number
  trips: number
}) {
  const data = [
    {
      name: 'Active Vehicles',
      value: vehicles > 0 ? Math.min(trips, vehicles) : 0,
    },
    {
      name: 'Idle Vehicles',
      value: vehicles > 0 ? Math.max(0, vehicles - Math.min(trips, vehicles)) : 0,
    },
  ]

  const COLORS = ['#10b981', '#d1d5db']

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name}: ${value}`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
