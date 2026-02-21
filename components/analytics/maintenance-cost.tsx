'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface MaintenanceLog {
  cost: number | null
}

export function MaintenanceCostChart({
  maintenance,
}: {
  maintenance: MaintenanceLog[]
}) {
  // Group maintenance by cost ranges
  const data = [
    {
      range: '$0-$100',
      count: maintenance.filter((m) => (m.cost || 0) <= 100).length,
    },
    {
      range: '$100-$500',
      count: maintenance.filter(
        (m) => (m.cost || 0) > 100 && (m.cost || 0) <= 500
      ).length,
    },
    {
      range: '$500-$1000',
      count: maintenance.filter(
        (m) => (m.cost || 0) > 500 && (m.cost || 0) <= 1000
      ).length,
    },
    {
      range: '$1000+',
      count: maintenance.filter((m) => (m.cost || 0) > 1000).length,
    },
  ]

  if (maintenance.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center text-muted-foreground">
        <p>No maintenance data available</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="range" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="#ef4444" name="Number of Services" />
      </BarChart>
    </ResponsiveContainer>
  )
}
