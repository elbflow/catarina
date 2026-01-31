'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import type { ObservationWithRelations } from '@/lib/payload-client'

interface TrendChartProps {
  observations: ObservationWithRelations[]
  threshold: number
}

export function TrendChart({ observations, threshold }: TrendChartProps) {
  // Sort observations by date
  const sorted = [...observations].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  // Format data for chart
  const chartData = sorted.map((obs) => ({
    date: new Date(obs.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    count: obs.count,
    fullDate: obs.date,
  }))

  // Determine risk zones
  const getRiskColor = (count: number) => {
    const percentage = (count / threshold) * 100
    if (percentage >= 100) return '#ef4444' // red-500
    if (percentage >= 80) return '#f59e0b' // amber-500
    return '#10b981' // emerald-500
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [value, 'Count']}
          />
          <ReferenceLine
            y={threshold}
            stroke="#ef4444"
            strokeDasharray="5 5"
            label={{ value: `Threshold: ${threshold}`, position: 'right' }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorCount)"
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
