'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'

export default function FarmsPage() {
  const farms = [
    { id: 1, name: 'North Field', area: '5 acres', crops: 'Wheat', status: 'active' },
    { id: 2, name: 'East Plot', area: '3 acres', crops: 'Rice', status: 'active' },
    { id: 3, name: 'South Vegetable', area: '2 acres', crops: 'Vegetables', status: 'active' },
  ]

  return (
    <div className="flex flex-col h-screen bg-background pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 bg-primary text-white p-4 shadow-lg">
        <Link href="/mobile/dashboard">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold flex-1">Your Farms</h1>
        <Button size="icon" className="bg-white hover:bg-gray-100 text-primary">
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {/* Farms List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {farms.map((farm) => (
          <Link key={farm.id} href={`/mobile/farms/${farm.id}`}>
            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold">{farm.name}</h3>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Active</span>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>📍 Area: {farm.area}</p>
                  <p>🌾 Current Crop: {farm.crops}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
