"use client"

import { useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"
import { useTheme } from "next-themes"

interface DataPoint {
  timestamp: string
  activeSpots: number
  reports: number
  users: number
}

interface UsageChartProps {
  data: DataPoint[]
  height?: number
}

export function UsageChart({ data, height = 400 }: UsageChartProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const chartData = useMemo(() => {
    return data.map(point => ({
      ...point,
      timestamp: new Date(point.timestamp).toLocaleTimeString(),
    }))
  }, [data])

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#333" : "#eee"} />
        <XAxis
          dataKey="timestamp"
          stroke={isDark ? "#888" : "#333"}
          tick={{ fill: isDark ? "#888" : "#333" }}
        />
        <YAxis stroke={isDark ? "#888" : "#333"} tick={{ fill: isDark ? "#888" : "#333" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? "#333" : "#fff",
            border: "none",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
          labelStyle={{ color: isDark ? "#fff" : "#333" }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="activeSpots"
          name="Active Spots"
          stroke="#2563eb"
          activeDot={{ r: 8 }}
        />
        <Line
          type="monotone"
          dataKey="reports"
          name="Reports"
          stroke="#dc2626"
          activeDot={{ r: 8 }}
        />
        <Line
          type="monotone"
          dataKey="users"
          name="Active Users"
          stroke="#16a34a"
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
