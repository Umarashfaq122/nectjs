'use client'

import { Card } from '@/components/ui/card'
import { ArrowLeft, Bell, X } from 'lucide-react'
import Link from 'next/link'

export default function AlertsPage() {
  const alerts = [
    { id: 1, priority: 'critical', title: 'Heavy Rain Alert', desc: 'Heavy rainfall expected in 4 hours. Cover sensitive crops.', time: '15 min ago' },
    { id: 2, priority: 'high', title: 'Pest Warning', desc: 'Army worms detected in neighboring fields.', time: '2 hours ago' },
    { id: 3, priority: 'medium', title: 'Maintenance Due', desc: 'Irrigation system needs maintenance.', time: '1 day ago' },
    { id: 4, priority: 'low', title: 'Reminder', desc: 'Schedule soil testing for Field #3.', time: '2 days ago' },
  ]

  return (
    <div className="flex flex-col h-screen bg-background pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 bg-primary text-white p-4 shadow-lg">
        <Link href="/mobile/dashboard">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold flex-1">Alerts</h1>
      </div>

      {/* Alerts List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {alerts.map((alert) => {
          const colors = {
            critical: 'border-l-4 border-red-500 bg-red-50',
            high: 'border-l-4 border-orange-500 bg-orange-50',
            medium: 'border-l-4 border-yellow-500 bg-yellow-50',
            low: 'border-l-4 border-blue-500 bg-blue-50',
          }

          return (
            <Card key={alert.id} className={`p-3 ${colors[alert.priority]}`}>
              <div className="flex items-start gap-3">
                <Bell className="w-4 h-4 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{alert.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.desc}</p>
                  <p className="text-xs text-muted-foreground mt-2">{alert.time}</p>
                </div>
                <X className="w-4 h-4 text-muted-foreground cursor-pointer flex-shrink-0" />
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
