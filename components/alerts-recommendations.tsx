'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Lightbulb, Droplets, Bug, Wind } from 'lucide-react'

export function AlertsAndRecommendations() {
  const alerts = [
    {
      type: 'warning',
      title: 'Low Soil Moisture',
      description: 'Zone 1 Farm requires irrigation',
      icon: Droplets,
    },
    {
      type: 'warning',
      title: 'Pest Alert',
      description: 'Armyworm detected in Maize field',
      icon: Bug,
    },
    {
      type: 'info',
      title: 'Weather Advisory',
      description: 'Heavy winds expected next 48 hours',
      icon: Wind,
    },
  ]

  const recommendations = [
    'Apply pre-emergent weedicide within 48 hours',
    'Schedule 1st irrigation for Wheat',
    'Check soil pH before Maize sowing',
    'Apply bio-stimulants for better growth',
  ]

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle size={20} />
            Active Alerts
          </CardTitle>
          <CardDescription>5 alerts requiring attention</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.map((alert, idx) => (
            <Alert key={idx} className="border-l-4 border-accent">
              <alert.icon className="h-4 w-4 text-accent" />
              <AlertDescription>
                <p className="font-semibold text-sm">{alert.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
              </AlertDescription>
            </Alert>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb size={20} />
            Recommendations
          </CardTitle>
          <CardDescription>Next steps for optimal yield</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <span className="text-primary font-bold mt-0.5">•</span>
                <span className="text-foreground">{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
