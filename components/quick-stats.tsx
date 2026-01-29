'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Leaf,
  TrendingUp,
  Layers,
  CheckCircle2,
  Calendar,
  Eye,
  Sprout,
} from 'lucide-react'

type DashboardStats = {
  total_subadmins: number
  total_fields: number
  total_farmers: number
  active_crops: number
  my_visits: number
  total_area_acres: number
}

export function QuickStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('authToken')
        if (!token) return

        const res = await fetch(
          'https://rda.ngrok.app/api/subadmin/assigned-farmers/',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'ngrok-skip-browser-warning': 'true',
            },
          }
        )

        if (!res.ok) {
          throw new Error(`API Error: ${res.status}`)
        }

        const data = await res.json()
        console.log('✅ Dashboard Stats:', data)

        // Log the visits data to confirm it exists
        console.log('My Visits:', data.my_visits)
        console.log('Total Visits:', data.total_visits)
        
        setStats(data)
      } catch (err) {
        console.error('❌ Failed to load dashboard stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const cards = [
    {
      label: 'Total FOAS',
      value: stats?.total_subadmins,
      icon: Leaf,
      bg: 'bg-primary/10',
      color: 'text-primary',
    },
  
    {
      label: 'Total Farmers',
      value: stats?.total_farmers,
      icon: Sprout,
      bg: 'bg-green-500/10',
      color: 'text-green-600',
     
    },
      {
      label: 'Total Farms',
      value: stats?.total_fields,
      icon: Layers,
      bg: 'bg-secondary/10',
      color: 'text-secondary',
    },
 {
  label: 'Total Area',
  value: stats?.total_area_acres
    ? `${stats.total_area_acres} acres`
    : '—',
  icon: Layers,
  bg: 'bg-secondary/10',
  color: 'text-secondary',
}

  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm text-muted-foreground">
                  {card.label}
                </p>
                <p className="text-2xl font-bold mt-1">
                  {loading ? '...' : card.value || 0}
                </p>
              </div>

              <div className={`${card.bg} p-3 rounded-lg`}>
                <card.icon className={`${card.color} w-6 h-6`} />
              </div>
            </div>
            
         
          </CardContent>
        </Card>
      ))}
    </div>
  )
}