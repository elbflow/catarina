'use client'

import {
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

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value) => [value ?? 0, 'Pest Count']}
            labelStyle={{ color: '#374151', fontWeight: 500 }}
          />
          <ReferenceLine
            y={threshold}
            stroke="#ef4444"
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{ 
              value: `Threshold: ${threshold}`, 
              position: 'right',
              fill: '#ef4444',
              fontSize: 12,
            }}
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
            dot={{ fill: 'white', stroke: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ fill: '#3b82f6', r: 6, stroke: 'white', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
