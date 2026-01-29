'use client'

import { Card } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CropsPage() {
  const crops = [
    { id: 1, name: 'Wheat Field #1', stage: 'Growth & Tillering', progress: 65, health: 'Healthy' },
    { id: 2, name: 'Rice Field #2', stage: 'Emergence', progress: 35, health: 'Good' },
    { id: 3, name: 'Vegetable Plot #3', stage: 'Sowing', progress: 20, health: 'Fair' },
  ]

  return (
    <div className="flex flex-col h-screen bg-background pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 bg-primary text-white p-4 shadow-lg">
        <Link href="/mobile/dashboard">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold flex-1">Crop Status</h1>
      </div>

      {/* Crops List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {crops.map((crop) => (
          <Card key={crop.id} className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold">{crop.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{crop.stage}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    crop.health === 'Healthy' ? 'bg-green-100 text-green-700' :
                    crop.health === 'Good' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {crop.health}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Stage Progress</span>
                  <span className="text-xs font-medium">{crop.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${crop.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
