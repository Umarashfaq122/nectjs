'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'

export function CropStageTracker() {
  const stages = [
    {
      name: 'Pre-Sowing',
      description: 'Land preparation and soil testing',
      completed: false,
      icon: Clock,
    },
    {
      name: 'Sowing & Emergence',
      description: 'Seed sowing and germination tracking',
      completed: true,
      icon: CheckCircle2,
    },
    {
      name: 'Growth & Tillering',
      description: 'Plant development and fertilizer application',
      completed: true,
      icon: CheckCircle2,
    },
    {
      name: 'Heading & Flowering',
      description: 'Reproductive stage monitoring',
      completed: false,
      icon: Clock,
    },
    {
      name: 'Maturity & Harvesting',
      description: 'Final stage and harvest readiness',
      completed: false,
      icon: Clock,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crop Growth Stages</CardTitle>
        <CardDescription>Track development across all stages</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stages.map((stage, idx) => (
            <div key={stage.name} className="flex items-start gap-4 pb-3 border-b border-border last:border-b-0 last:pb-0">
              <div className="mt-1">
                <stage.icon 
                  className={`w-6 h-6 ${stage.completed ? 'text-primary' : 'text-muted-foreground'}`}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{stage.name}</h4>
                  <Badge variant={stage.completed ? 'default' : 'outline'}>
                    {stage.completed ? 'Completed' : 'Pending'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
