'use client'

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  LineChart,
  Line,
  Dot,
} from 'recharts'
import type { ObservationWithRelationsAndRate } from '@/lib/payload-client'

interface TrendChartProps {
  observations: ObservationWithRelationsAndRate[]
  rateThreshold: number
}

export function TrendChart({ observations, rateThreshold }: TrendChartProps) {
  // Sort observations by date ascending and filter out those without rates
  const sorted = [...observations]
    .filter((obs) => obs.rate !== null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Format data for chart with timestamp for proper time scaling
  const chartData = sorted.map((obs) => {
    const rate = obs.rate ?? 0
    const percentage = (rate / rateThreshold) * 100

    let severity: 'safe' | 'warning' | 'danger' = 'safe'
    if (percentage >= 100) severity = 'danger'
    else if (percentage >= 80) severity = 'warning'

    return {
      timestamp: new Date(obs.date).getTime(),
      date: obs.date,
      rate,
      count: obs.count,
      days: obs.daysSincePrevious,
      severity,
    }
  })

  const getDotColor = (severity: 'safe' | 'warning' | 'danger') => {
    switch (severity) {
      case 'danger':
        return '#ef4444' // red-500
      case 'warning':
        return '#f59e0b' // amber-500
      default:
        return '#10b981' // emerald-500
    }
  }

  // Custom dot component that colors based on severity
  const CustomDot = (props: { cx?: number; cy?: number; payload?: (typeof chartData)[number] }) => {
    const { cx, cy, payload } = props
    if (!cx || !cy || !payload) return null

    return (
      <Dot
        cx={cx}
        cy={cy}
        r={5}
        fill={getDotColor(payload.severity)}
        stroke="white"
        strokeWidth={2}
      />
    )
  }

  // Format timestamp to readable date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  if (chartData.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        No rate data available. Add more observations to see the trend.
      </div>
    )
  }

  // Calculate domain for x-axis with some padding
  const timestamps = chartData.map((d) => d.timestamp)
  const minTime = Math.min(...timestamps)
  const maxTime = Math.max(...timestamps)
  const timePadding = (maxTime - minTime) * 0.05 || 86400000 // 5% padding or 1 day

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="timestamp"
            type="number"
            scale="time"
            domain={[minTime - timePadding, maxTime + timePadding]}
            tickFormatter={formatDate}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
            label={{
              value: 'insects/day',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 12, fill: '#6b7280' },
            }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length > 0) {
                const item = payload[0].payload as (typeof chartData)[number]
                return (
                  <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                    <p className="font-medium text-gray-700 mb-1">{formatDate(item.timestamp)}</p>
                    <p className="text-lg font-bold text-gray-900">{item.rate.toFixed(1)}/day</p>
                    <p className="text-sm text-gray-500">
                      +{item.count} insects in {item.days?.toFixed(0)} days
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <ReferenceLine
            y={rateThreshold}
            stroke="#ef4444"
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{
              value: `Threshold: ${rateThreshold}/day`,
              position: 'right',
              fill: '#ef4444',
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="rate"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={<CustomDot />}
            activeDot={{ r: 7, stroke: '#3b82f6', strokeWidth: 2, fill: 'white' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
