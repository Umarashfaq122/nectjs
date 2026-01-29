'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Camera } from 'lucide-react'
import Link from 'next/link'

export default function MobileLogDataPage() {
  const [formData, setFormData] = useState({
    crop: 'Wheat',
    stage: '',
    soilMoisture: '',
    pestStatus: '',
    notes: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
  }

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
            <h1 className="text-lg font-bold">Log Farm Data</h1>
            <p className="text-xs text-muted-foreground">Green Valley Farm • Wheat</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Photo Capture */}
        <Card className="border-2 border-dashed border-primary/30 p-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="bg-primary/20 p-3 rounded-lg">
              <Camera className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-medium">Capture Farm Photo</p>
            <p className="text-xs text-muted-foreground">Take or upload a photo of the current crop status</p>
            <Button type="button" variant="outline" size="sm" className="mt-2">
              Open Camera
            </Button>
          </div>
        </Card>

        {/* Form Fields */}
        <Card className="p-4 space-y-4">
          {/* Growth Stage */}
          <div>
            <label className="text-sm font-semibold mb-2 block">Current Growth Stage</label>
            <select
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
            >
              <option value="">Select stage</option>
              <option value="pre-sowing">Pre-Sowing</option>
              <option value="sowing">Sowing</option>
              <option value="emergence">Emergence</option>
              <option value="tillering">Tillering</option>
              <option value="heading">Heading</option>
            </select>
          </div>

          {/* Soil Moisture */}
          <div>
            <label className="text-sm font-semibold mb-2 block">Soil Moisture Level</label>
            <div className="flex gap-2">
              {['Dry', 'Moist', 'Wet'].map((level) => (
                <Button
                  key={level}
                  type="button"
                  variant={formData.soilMoisture === level ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setFormData({ ...formData, soilMoisture: level })}
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>

          {/* Pest Status */}
          <div>
            <label className="text-sm font-semibold mb-2 block">Pest/Disease Observed</label>
            <div className="space-y-2">
              {['None', 'Minor', 'Moderate', 'Severe'].map((status) => (
                <label key={status} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="pest"
                    value={status}
                    checked={formData.pestStatus === status}
                    onChange={(e) => setFormData({ ...formData, pestStatus: e.target.value })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-semibold mb-2 block">Additional Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any observations..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm resize-none h-24"
            />
          </div>
        </Card>

        {/* Submit Button */}
        <Button type="submit" className="w-full py-6 text-base font-semibold">
          Save Observation
        </Button>
      </form>
    </div>
  )
}
