'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MoreVertical, Share2 } from 'lucide-react'

export function MobileDashboard() {
  const metrics = [
    { label: 'Total Farms', value: '8', color: 'text-primary' },
    { label: 'Active Crops', value: '12', color: 'text-accent' },
    { label: 'Pending Tasks', value: '5', color: 'text-destructive' },
    { label: 'Alerts', value: '2', color: 'text-yellow-500' },
  ]

  return (
    <div className="space-y-4">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, idx) => (
          <Card key={idx} className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
            <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Recent Activity</h3>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="flex gap-3 pb-3 border-b border-border last:border-0">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Farm activity recorded</p>
                <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
