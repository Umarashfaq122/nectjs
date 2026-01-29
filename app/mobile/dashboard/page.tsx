'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Cloud, Droplets, Wind, Eye, AlertCircle, CheckCircle, TrendingUp, Plus } from 'lucide-react'
import Link from 'next/link'

export default function MobileDashboard() {
  return (
    <div className="flex flex-col h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-primary text-white p-4 shadow-lg">
        <p className="text-sm opacity-90">Good Morning</p>
        <h1 className="text-2xl font-bold">Ravi Kumar</h1>
        <p className="text-sm opacity-75 mt-1">Farm Officer • North Region</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Weather Card */}
        <div className="p-4 space-y-4">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Weather</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">28°C</p>
                <p className="text-sm text-blue-700 mt-2">Partly Cloudy</p>
              </div>
              <Cloud className="w-12 h-12 text-blue-400" />
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-white bg-opacity-60 rounded p-2 text-center">
                <Droplets className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                <p className="text-xs font-medium">65%</p>
                <p className="text-xs text-muted-foreground">Humidity</p>
              </div>
              <div className="bg-white bg-opacity-60 rounded p-2 text-center">
                <Wind className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                <p className="text-xs font-medium">12 km/h</p>
                <p className="text-xs text-muted-foreground">Wind</p>
              </div>
              <div className="bg-white bg-opacity-60 rounded p-2 text-center">
                <Eye className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                <p className="text-xs font-medium">10 km</p>
                <p className="text-xs text-muted-foreground">Visibility</p>
              </div>
            </div>
          </Card>

          {/* Alert Card */}
          <Card className="p-3 bg-red-50 border-red-200">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-red-900 text-sm">Urgent: Pest Alert</p>
                <p className="text-xs text-red-700 mt-1">Aphids detected in Field #2. Spray recommended.</p>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-2">
            <p className="text-sm font-semibold px-1">Quick Actions</p>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/mobile/log-data">
                <Button className="w-full h-20 bg-primary hover:bg-primary/90 flex flex-col items-center justify-center gap-2">
                  <Plus className="w-5 h-5" />
                  <span className="text-xs">Log Data</span>
                </Button>
              </Link>
              <Link href="/mobile/crops">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-xs">Crop Status</span>
                </Button>
              </Link>
              <Link href="/mobile/recommendations">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-xs">Recommendations</span>
                </Button>
              </Link>
              <Link href="/mobile/tasks">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-xs">Tasks (5)</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Active Farms */}
          <div className="space-y-2">
            <p className="text-sm font-semibold px-1">Your Farms</p>
            {[1, 2, 3].map((farm) => (
              <Card key={farm} className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium">Farm #{farm} - Wheat Field</p>
                    <p className="text-xs text-muted-foreground mt-1">Sowing Stage • 65% Complete</p>
                  </div>
                  <div className="text-right">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-xs font-bold text-green-700">65%</span>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '65%' }} />
                </div>
              </Card>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="space-y-2">
            <p className="text-sm font-semibold px-1">Recent Activity</p>
            {[1, 2, 3].map((activity) => (
              <Card key={activity} className="p-3">
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Data logged in Field #1</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-border shadow-lg">
        <div className="flex justify-around py-2">
          <Link href="/mobile/dashboard" className="flex flex-col items-center justify-center py-2 px-4 text-primary">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-white">
              <span className="text-xs">H</span>
            </div>
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link href="/mobile/farms" className="flex flex-col items-center justify-center py-2 px-4 text-muted-foreground">
            <div className="w-6 h-6 text-muted-foreground">🌾</div>
            <span className="text-xs mt-1">Farms</span>
          </Link>
          <Link href="/mobile/log-data" className="flex flex-col items-center justify-center py-2 px-4 text-muted-foreground">
            <div className="w-6 h-6 text-muted-foreground">📝</div>
            <span className="text-xs mt-1">Log</span>
          </Link>
          <Link href="/mobile/alerts" className="flex flex-col items-center justify-center py-2 px-4 text-muted-foreground">
            <div className="w-6 h-6 text-muted-foreground">🔔</div>
            <span className="text-xs mt-1">Alerts</span>
          </Link>
          <Link href="/mobile/profile" className="flex flex-col items-center justify-center py-2 px-4 text-muted-foreground">
            <div className="w-6 h-6 text-muted-foreground">👤</div>
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
