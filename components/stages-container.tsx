'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PreSowingForm } from './stage-forms/pre-sowing-form'
import { SowingForm } from './stage-forms/sowing-form'
import { GrowthForm } from './stage-forms/growth-form'
import { RosetteForm } from './stage-forms/rosette-form'
import { EmergenceForm } from './stage-forms/emergence-form'

export function StagesContainer() {
  const [activeTab, setActiveTab] = useState('pre-sowing')

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-6">
        <TabsTrigger value="pre-sowing">Pre-Sowing</TabsTrigger>
        <TabsTrigger value="sowing">Sowing & Emergence</TabsTrigger>
        <TabsTrigger value="emergence">Emergence</TabsTrigger>
        <TabsTrigger value="growth">Growth & Tillering</TabsTrigger>
        <TabsTrigger value="rosette">Rosette Stage</TabsTrigger>
      </TabsList>

      <TabsContent value="pre-sowing">
        <PreSowingForm />
      </TabsContent>
      <TabsContent value="sowing">
        <SowingForm />
      </TabsContent>
       <TabsContent value="emergence">
        <EmergenceForm />
      </TabsContent>
      <TabsContent value="growth">
        <GrowthForm />
      </TabsContent>
      <TabsContent value="rosette">
        <RosetteForm />
      </TabsContent>
     
    </Tabs>
  )
}
