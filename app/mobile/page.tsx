'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Droplet, Leaf, TrendingUp, Plus, MapPin, Calendar, Cloud } from 'lucide-react'
import Link from 'next/link'

export default function MobileHomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background pb-24 md:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="p-4 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Hello,</p>
              <h1 className="text-2xl font-bold">Farm Officer</h1>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary" />
            </div>
          </div>

          {/* Quick Weather */}
          <div className="flex items-center gap-3 bg-primary/10 p-3 rounded-lg">
            <Cloud className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Today's Weather</p>
              <p className="text-sm font-semibold">28°C, Light Rain Expected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Critical Alerts */}
        <Card className="bg-destructive/10 border-destructive/20 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">2 Urgent Alerts</p>
              <p className="text-xs text-destructive/80 mt-1">Pest attack detected • Low soil moisture</p>
            </div>
            <Button variant="outline" size="sm" className="flex-shrink-0">View</Button>
          </div>
        </Card>

        {/* Active Farms */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">Your Farms</h2>
            <Button variant="ghost" size="sm" className="text-primary">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>

          <div className="space-y-2">
            {[
              { name: 'Green Valley Farm', status: 'Active', crop: 'Wheat', health: 85 },
              { name: 'North Field', status: 'Active', crop: 'Rice', health: 72 },
            ].map((farm, idx) => (
              <Link key={idx} href={`/mobile/farm/${idx}`}>
                <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-sm flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        {farm.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Current Crop: {farm.crop}</p>
                    </div>
                    <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-semibold rounded">
                      {farm.status}
                    </span>
                  </div>
                  
                  {/* Health Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-foreground">Farm Health</span>
                      <span className="text-xs font-semibold text-primary">{farm.health}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-accent"
                        style={{ width: `${farm.health}%` }}
                      />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="font-semibold text-foreground mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/mobile/log-data">
              <Card className="p-4 text-center cursor-pointer hover:shadow-md transition-shadow">
                <div className="bg-primary/20 w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm font-semibold">Log Data</p>
                <p className="text-xs text-muted-foreground mt-1">Record observations</p>
              </Card>
            </Link>

            <Link href="/mobile/view-crop">
              <Card className="p-4 text-center cursor-pointer hover:shadow-md transition-shadow">
                <div className="bg-accent/20 w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Leaf className="w-5 h-5 text-accent" />
                </div>
                <p className="text-sm font-semibold">Crop Status</p>
                <p className="text-xs text-muted-foreground mt-1">Growth stages</p>
              </Card>
            </Link>

            <Link href="/mobile/recommendations">
              <Card className="p-4 text-center cursor-pointer hover:shadow-md transition-shadow">
                <div className="bg-secondary/20 w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-5 h-5 text-secondary" />
                </div>
                <p className="text-sm font-semibold">Recommendations</p>
                <p className="text-xs text-muted-foreground mt-1">AI insights</p>
              </Card>
            </Link>

            <Link href="/mobile/irrigation">
              <Card className="p-4 text-center cursor-pointer hover:shadow-md transition-shadow">
                <div className="bg-blue-500/20 w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Droplet className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-sm font-semibold">Irrigation</p>
                <p className="text-xs text-muted-foreground mt-1">Water status</p>
              </Card>
            </Link>
          </div>
        </div>

        {/* Recent Tasks */}
        <div>
          <h2 className="font-semibold text-foreground mb-3">Pending Tasks</h2>
          <div className="space-y-2">
            {[
              { title: 'Check pest activity', farm: 'Green Valley', priority: 'high' },
              { title: 'Apply fertilizer', farm: 'North Field', priority: 'medium' },
            ].map((task, idx) => (
              <Card key={idx} className="p-3">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-destructive' : 'bg-accent'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.farm}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <MobileBottomNav />
    </div>
  )
}

function MobileBottomNav() {
  const navItems = [
    { label: 'Home', icon: '🏠', active: true },
    { label: 'Farms', icon: '🌾' },
    { label: 'Alerts', icon: '⚠️' },
    { label: 'Profile', icon: '👤' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden">
      <div className="flex items-center justify-around max-w-screen-sm mx-auto">
        {navItems.map((item, idx) => (
          <button
            key={idx}
            className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 text-xs font-medium transition-colors ${
              item.active
                ? 'text-primary border-t-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
