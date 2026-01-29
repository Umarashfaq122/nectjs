'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MapPin, Droplets, Wind, Thermometer, Eye } from 'lucide-react'
import Link from 'next/link'

export default function MobileFarmDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-20">
        <div className="p-4 flex items-center gap-3">
          <Link href="/mobile">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Green Valley Farm</h1>
            <p className="text-xs text-muted-foreground">Wheat • 12.5 hectares</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Farm Image */}
        <div className="relative w-full h-48 bg-primary/10 rounded-lg overflow-hidden flex items-center justify-center">
          <img 
            src="/wheat-field-farm-aerial-view.jpg" 
            alt="Farm" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Temperature', value: '28°C', icon: Thermometer },
            { label: 'Humidity', value: '65%', icon: Droplets },
            { label: 'Wind Speed', value: '12 km/h', icon: Wind },
            { label: 'Visibility', value: 'Good', icon: Eye },
          ].map((stat, idx) => (
            <Card key={idx} className="p-3">
              <div className="flex items-start gap-2">
                <div className="bg-primary/20 p-2 rounded-lg">
                  <stat.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-sm font-semibold mt-1">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Farm Details */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Farm Information</h3>
          <div className="space-y-3">
            {[
              { label: 'Location', value: 'District: Gurdaspur, State: Punjab' },
              { label: 'Total Area', value: '12.5 hectares' },
              { label: 'Current Crop', value: 'Wheat (Variety: PBW-343)' },
              { label: 'Sowing Date', value: 'Nov 10, 2024' },
              { label: 'Expected Harvest', value: 'Apr 20, 2025' },
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-start border-b border-border pb-3 last:border-0">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm font-semibold text-right">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Crop Stage */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Current Growth Stage</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Tillering Stage</span>
                <span className="text-sm font-semibold text-primary">65%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: '65%' }} />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1">
                View Details
              </Button>
              <Button size="sm" className="flex-1">
                Log Update
              </Button>
            </div>
          </div>
        </Card>

        {/* Recent Observations */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Recent Observations</h3>
          <div className="space-y-3">
            {[
              { date: 'Today', obs: 'Healthy crop growth observed', icon: '✓' },
              { date: 'Yesterday', obs: 'Light irrigation applied', icon: '💧' },
              { date: '2 days ago', obs: 'NPK fertilizer applied (20:20:20)', icon: '🌱' },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-3 pb-3 border-b border-border last:border-0">
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{item.obs}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
