'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, AlertTriangle, Lightbulb, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function MobileRecommendationsPage() {
  const recommendations = [
    {
      type: 'urgent',
      title: 'Pest Alert: Armyworm Detected',
      description: 'Recommended action: Apply neem oil or chemical pesticide within 48 hours',
      action: 'View Details',
      priority: 'Critical',
    },
    {
      type: 'warning',
      title: 'Low Soil Moisture',
      description: 'Irrigate fields with 30-40 mm water. Schedule for tomorrow morning.',
      action: 'Plan Irrigation',
      priority: 'High',
    },
    {
      type: 'success',
      title: 'Crop Health: Excellent',
      description: 'Current growth stage progress is ahead of schedule. Continue monitoring.',
      action: 'View Chart',
      priority: 'Info',
    },
    {
      type: 'tip',
      title: 'Fertilizer Application',
      description: 'Next N-fertilizer application recommended in 5-7 days. Prepare supplies.',
      action: 'Schedule',
      priority: 'Medium',
    },
  ]

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
            <h1 className="text-lg font-bold">AI Recommendations</h1>
            <p className="text-xs text-muted-foreground">Personalized farm insights</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="p-4 space-y-3">
        {recommendations.map((rec, idx) => {
          const iconMap = {
            urgent: <AlertTriangle className="w-5 h-5 text-destructive" />,
            warning: <AlertTriangle className="w-5 h-5 text-accent" />,
            success: <CheckCircle2 className="w-5 h-5 text-primary" />,
            tip: <Lightbulb className="w-5 h-5 text-secondary" />,
          }

          const bgMap = {
            urgent: 'bg-destructive/10 border-destructive/20',
            warning: 'bg-accent/10 border-accent/20',
            success: 'bg-primary/10 border-primary/20',
            tip: 'bg-secondary/10 border-secondary/20',
          }

          return (
            <Card key={idx} className={`border-2 p-4 ${bgMap[rec.type as keyof typeof bgMap]}`}>
              <div className="flex gap-3 mb-3">
                <div className="mt-1">
                  {iconMap[rec.type as keyof typeof iconMap]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold">{rec.title}</p>
                    <span className="text-xs font-semibold px-2 py-1 bg-foreground/10 rounded text-nowrap flex-shrink-0">
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 mt-2">{rec.description}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                {rec.action}
              </Button>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
