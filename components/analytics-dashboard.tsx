"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export function AnalyticsDashboard() {
  const cropPerformanceData = [
    { name: "Wheat", health: 85, yield: 88, area: 50 },
    { name: "Maize", health: 72, yield: 78, area: 75 },
    { name: "Cotton", health: 90, yield: 92, area: 40 },
    { name: "Rice", health: 65, yield: 70, area: 35 },
  ]

  const stageProgressData = [
    { stage: "Pre-Sowing", completed: 45, pending: 55 },
    { stage: "Sowing", completed: 62, pending: 38 },
    { stage: "Growth", completed: 78, pending: 22 },
    { stage: "Emergence", completed: 85, pending: 15 },
  ]

  const farmHealthData = [
    { name: "Green Valley", value: 82, color: "#A5D6A7" },
    { name: "Sunrise", value: 76, color: "#C8E6C9" },
    { name: "Harvest Hills", value: 68, color: "#81C784" },
  ]

  const weatherTrendData = [
    { day: "Mon", temp: 28, humidity: 65, rainfall: 0 },
    { day: "Tue", temp: 29, humidity: 62, rainfall: 2 },
    { day: "Wed", temp: 27, humidity: 68, rainfall: 5 },
    { day: "Thu", temp: 26, humidity: 72, rainfall: 12 },
    { day: "Fri", temp: 25, humidity: 75, rainfall: 8 },
    { day: "Sat", temp: 24, humidity: 70, rainfall: 0 },
    { day: "Sun", temp: 23, humidity: 65, rainfall: 0 },
  ]

  const pastelGreenColors = {
    light: "#C8E6C9", // Very light pastel green
    medium: "#A5D6A7", // Medium pastel green
    sage: "#81C784", // Sage green
    deep: "#66BB6A", // Deeper pastel green
    muted: "#90CAF9", // Complementary pastel blue for variety
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm mb-1">Average Farm Health</p>
              <p className="text-4xl font-bold text-primary">75%</p>
              <p className="text-xs text-muted-foreground mt-2">↑ 5% vs last week</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm mb-1">Expected Yield</p>
              <p className="text-4xl font-bold text-secondary">82%</p>
              <p className="text-xs text-muted-foreground mt-2">On track</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm mb-1">Active Crops</p>
              <p className="text-4xl font-bold text-accent">28</p>
              <p className="text-xs text-muted-foreground mt-2">Across 12 farms</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Crop Performance Metrics</CardTitle>
          <CardDescription>Health and yield comparison across crops</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cropPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "0.5rem",
                }}
              />
              <Legend />
              <Bar dataKey="health" fill={pastelGreenColors.sage} name="Health %" />
              <Bar dataKey="yield" fill={pastelGreenColors.medium} name="Expected Yield %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Stage Completion Progress</CardTitle>
            <CardDescription>Percentage of farms at each growth stage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stageProgressData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" stroke="var(--color-muted-foreground)" />
                <YAxis dataKey="stage" type="category" width={80} stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "0.5rem",
                  }}
                />
                <Bar dataKey="completed" stackId="a" fill={pastelGreenColors.deep} name="Completed %" />
                <Bar dataKey="pending" stackId="a" fill={pastelGreenColors.light} name="Pending %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Farm Health Overview</CardTitle>
            <CardDescription>Overall health score by farm</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={farmHealthData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {farmHealthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "0.5rem",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Weather Trend</CardTitle>
          <CardDescription>Temperature, humidity, and rainfall monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weatherTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "0.5rem",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="temp"
                stroke={pastelGreenColors.sage}
                name="Temperature (°C)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="humidity"
                stroke={pastelGreenColors.medium}
                name="Humidity (%)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="rainfall"
                stroke={pastelGreenColors.light}
                name="Rainfall (mm)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
