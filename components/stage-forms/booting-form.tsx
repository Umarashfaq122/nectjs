'use client'

import { useEffect, useState } from 'react'
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Tabs, TabsList, TabsTrigger,
} from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'

import {
  AlertCircle, Search, Eye, Thermometer,
  Droplet, Bug, Skull, Leaf, Sprout, Wheat,
  Shield, Droplets, Sun, Wind, Package
} from 'lucide-react'

/* ===================== TYPES ===================== */

export interface DiseaseData {
  days: string
  disease: string
  pesticide_applied: string
  product: string
}

export interface PestData {
  days: string
  pest: string
  pesticide_applied: string
  product: string
}

export interface FertilizerData {
  fertilizers: Array<{
    product: string
    quantity: string
  }>
}

export interface IrrigationData {
  days_between_irrigation: string
  irrigation_number: string
}

export interface YellowingData {
  causes: string[]
  zone_ids: string
}

export interface FarmData {
  id: number
  farm: number
  farm_name: string
  farmer_name: string
  crop_health: 'excellent' | 'good' | 'fair' | 'poor'
  crop_height: string | null
  crop_uniformity: 'uniform' | 'slightly_uneven' | 'uneven' | null
  
  disease_data?: DiseaseData | null
  pest_data?: PestData | null
  fertilizer_data?: FertilizerData | null
  irrigation_data?: IrrigationData | null
  yellowing_data?: YellowingData | null
  
  flag_leaf_status: string | null
  lodging_status: string | null
  soil_moisture_condition: string | null
  spike_status: string | null
  weeds_in_field: string | null
}

/* ===================== COMPONENT ===================== */

export function BootingForm() {
  const [farmData, setFarmData] = useState<FarmData[]>([])
  const [filteredFarms, setFilteredFarms] = useState<FarmData[]>([])
  const [selectedFarm, setSelectedFarm] = useState<FarmData | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'excellent' | 'good' | 'fair' | 'poor' | 'issues'>('all')

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  /* ===================== FETCH ===================== */

  useEffect(() => {
    fetchFarmData()
  }, [])

  const fetchFarmData = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      setLoading(true)

      const res = await fetch(
        'https://rda.ngrok.app/api/booting/',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true',
          },
        }
      )

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const json = await res.json()
      console.log('Fetched booting data:', json)

      // Extract results array from response
      const results = json.results || json || []
      
      // Normalize data
      const normalized: FarmData[] = results.map((farm: any) => ({
        ...farm,
        disease_data: farm.disease_data || null,
        pest_data: farm.pest_data || null,
        fertilizer_data: farm.fertilizer_data || null,
        irrigation_data: farm.irrigation_data || null,
        yellowing_data: farm.yellowing_data || null,
        crop_height: farm.crop_height || null,
        crop_uniformity: farm.crop_uniformity || null,
        flag_leaf_status: farm.flag_leaf_status || null,
        soil_moisture_condition: farm.soil_moisture_condition || null,
        spike_status: farm.spike_status || null,
        weeds_in_field: farm.weeds_in_field || null,
        lodging_status: farm.lodging_status || null,
      }))

      setFarmData(normalized)
      setFilteredFarms(normalized)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  /* ===================== FILTERING ===================== */

  useEffect(() => {
    let results = [...farmData]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      results = results.filter(f =>
        f.farm_name.toLowerCase().includes(q) ||
        f.farmer_name.toLowerCase().includes(q) ||
        f.farm.toString().includes(q) ||
        (f.pest_data?.pest?.toLowerCase() || '').includes(q) ||
        (f.disease_data?.disease?.toLowerCase() || '').includes(q)
      )
    }

    if (activeTab === 'issues') {
      results = results.filter(f => 
        (f.yellowing_data?.causes?.length || 0) > 0 ||
        f.crop_health === 'poor' ||
        f.crop_health === 'fair' ||
        f.pest_data !== null ||
        f.disease_data !== null
      )
    } else if (activeTab !== 'all') {
      results = results.filter(f => f.crop_health === activeTab)
    }

    setFilteredFarms(results)
  }, [farmData, searchQuery, activeTab])

  /* ===================== HELPERS ===================== */

  const getCropHealthColor = (status: string) => {
    if (status === 'excellent') return 'bg-emerald-100 text-emerald-800'
    if (status === 'good') return 'bg-green-100 text-green-800'
    if (status === 'fair') return 'bg-yellow-100 text-yellow-800'
    if (status === 'poor') return 'bg-red-100 text-red-800'
    return 'bg-gray-100'
  }

  const getCropHealthIcon = (status: string) => {
    if (status === 'excellent') return <Leaf className="h-4 w-4 text-emerald-600" />
    if (status === 'good') return <Sprout className="h-4 w-4 text-green-600" />
    if (status === 'fair') return <Wheat className="h-4 w-4 text-yellow-600" />
    return <AlertCircle className="h-4 w-4 text-red-600" />
  }

  const getWeedsStatusColor = (status: string | null) => {
    if (!status) return 'bg-gray-100'
    if (status.includes('100%')) return 'bg-green-100 text-green-800'
    if (status.includes('weeds_free')) return 'bg-green-100 text-green-800'
    if (status.includes('few')) return 'bg-yellow-100 text-yellow-800'
    if (status.includes('many')) return 'bg-red-100 text-red-800'
    return 'bg-gray-100'
  }

  const formatCropHeight = (height: string | null) => {
    if (!height) return 'N/A'
    return height.replace('_', ' ').replace('feet', 'ft')
  }

  const formatString = (str: string | null) => {
    if (!str) return 'N/A'
    return str.replace(/_/g, ' ')
  }

  const hasIssues = (farm: FarmData) => {
    return (
      farm.crop_health === 'poor' ||
      farm.crop_health === 'fair' ||
      (farm.yellowing_data?.causes?.length || 0) > 0 ||
      farm.pest_data !== null ||
      farm.disease_data !== null
    )
  }

  /* ===================== UI ===================== */

  if (loading) {
    return <Skeleton className="h-64 w-full" />
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-red-600">
          <AlertCircle className="mx-auto mb-4" />
          <p>{error}</p>
          <Button className="mt-4" onClick={fetchFarmData}>Retry</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Booting Stage Monitoring</h2>
        <Button onClick={fetchFarmData} variant="outline">
          Refresh
        </Button>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search farms by name, farmer, pest, or disease..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as any)}>
          <TabsList>
            <TabsTrigger value="all">All Farms</TabsTrigger>
            <TabsTrigger value="excellent">Excellent</TabsTrigger>
            <TabsTrigger value="good">Good</TabsTrigger>
            <TabsTrigger value="fair">Fair</TabsTrigger>
            <TabsTrigger value="poor">Poor</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Farms</p>
                <p className="text-2xl font-bold">{farmData.length}</p>
              </div>
              <Wheat className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">With Pests</p>
                <p className="text-2xl font-bold">
                  {farmData.filter(f => f.pest_data).length}
                </p>
              </div>
              <Bug className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">With Diseases</p>
                <p className="text-2xl font-bold">
                  {farmData.filter(f => f.disease_data).length}
                </p>
              </div>
              <Skull className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Yellowing Issues</p>
                <p className="text-2xl font-bold">
                  {farmData.filter(f => f.yellowing_data?.causes?.length).length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFarms.map(farm => (
          <Card key={farm.id} className={`hover:shadow-lg transition ${hasIssues(farm) ? 'border-yellow-200' : ''}`}>
            <CardContent className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">Farm #{farm.farm}</h3>
                  <p className="text-sm text-muted-foreground">
                    {farm.farm_name} • {farm.farmer_name}
                  </p>
                </div>
                <Badge className={getCropHealthColor(farm.crop_health)}>
                  <span className="flex items-center gap-1">
                    {getCropHealthIcon(farm.crop_health)}
                    {farm.crop_health.charAt(0).toUpperCase() + farm.crop_health.slice(1)}
                  </span>
                </Badge>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Sprout className="h-4 w-4" />
                    Crop Height
                  </span>
                  <span className="font-medium">{formatCropHeight(farm.crop_height)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Wheat className="h-4 w-4" />
                    Uniformity
                  </span>
                  <span className="font-medium">
                    {formatString(farm.crop_uniformity)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Droplet className="h-4 w-4" />
                    Soil Moisture
                  </span>
                  <Badge variant="outline" className="capitalize">
                    {formatString(farm.soil_moisture_condition)}
                  </Badge>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Leaf className="h-4 w-4" />
                    Weeds
                  </span>
                  <Badge className={getWeedsStatusColor(farm.weeds_in_field)}>
                    {formatString(farm.weeds_in_field)}
                  </Badge>
                </div>
              </div>

              {/* Quick Issues Preview */}
              <div className="pt-2 border-t">
                <div className="flex flex-wrap gap-2">
                  {farm.pest_data && (
                    <Badge variant="outline" className="text-red-600">
                      <Bug className="h-3 w-3 mr-1" />
                      {formatString(farm.pest_data.pest)}
                    </Badge>
                  )}
                  {farm.disease_data && (
                    <Badge variant="outline" className="text-orange-600">
                      <Skull className="h-3 w-3 mr-1" />
                      {formatString(farm.disease_data.disease)}
                    </Badge>
                  )}
                  {farm.fertilizer_data?.fertilizers && (
                    <Badge variant="outline" className="text-blue-600">
                      <Package className="h-3 w-3 mr-1" />
                      {farm.fertilizer_data.fertilizers.length} Fertilizer(s)
                    </Badge>
                  )}
                  {farm.yellowing_data?.causes?.map((cause, i) => (
                    <Badge key={i} variant="outline" className="text-yellow-600">
                      {formatString(cause)}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSelectedFarm(farm)
                  setIsDetailModalOpen(true)
                }}
              >
                <Eye className="mr-2 h-4 w-4" /> View Full Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* DETAIL MODAL */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedFarm && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Wheat className="h-5 w-5" />
                  Farm #{selectedFarm.farm} - Booting Stage Details
                </DialogTitle>
                <DialogDescription>
                  {selectedFarm.farm_name} • Farmer: {selectedFarm.farmer_name}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Crop Health Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Leaf className="h-5 w-5" />
                      Crop Health & Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Overall Health</Label>
                      <div className="flex items-center gap-2">
                        <Badge className={getCropHealthColor(selectedFarm.crop_health)}>
                          {selectedFarm.crop_health.toUpperCase()}
                        </Badge>
                        <Progress 
                          value={
                            selectedFarm.crop_health === 'excellent' ? 100 :
                            selectedFarm.crop_health === 'good' ? 75 :
                            selectedFarm.crop_health === 'fair' ? 50 : 25
                          } 
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Crop Height</Label>
                        <p className="font-medium">{formatCropHeight(selectedFarm.crop_height)}</p>
                      </div>
                      <div>
                        <Label>Uniformity</Label>
                        <p className="font-medium capitalize">
                          {formatString(selectedFarm.crop_uniformity)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Flag Leaf Status</Label>
                        <p className="font-medium capitalize">
                          {formatString(selectedFarm.flag_leaf_status)}
                        </p>
                      </div>
                      <div>
                        <Label>Spike Status</Label>
                        <p className="font-medium capitalize">
                          {formatString(selectedFarm.spike_status)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label>Weeds in Field</Label>
                      <Badge className={getWeedsStatusColor(selectedFarm.weeds_in_field)}>
                        {formatString(selectedFarm.weeds_in_field)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Environmental Conditions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Thermometer className="h-5 w-5" />
                      Environmental Conditions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Soil Moisture Condition</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Droplet className="h-4 w-4 text-blue-500" />
                        <p className="font-medium capitalize">{formatString(selectedFarm.soil_moisture_condition)}</p>
                      </div>
                    </div>

                    {selectedFarm.irrigation_data && (
                      <div className="space-y-2">
                        <Label>Irrigation Details</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Irrigation #</p>
                            <p className="font-medium">{selectedFarm.irrigation_data.irrigation_number}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Days Between</p>
                            <p className="font-medium">{selectedFarm.irrigation_data.days_between_irrigation}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedFarm.fertilizer_data?.fertilizers && (
                      <div>
                        <Label>Fertilizers Applied</Label>
                        <div className="space-y-2 mt-2">
                          {selectedFarm.fertilizer_data.fertilizers.map((fertilizer, i) => (
                            <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span className="font-medium">{fertilizer.product}</span>
                              <Badge variant="outline">{fertilizer.quantity}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Pest & Disease Management */}
                {(selectedFarm.pest_data || selectedFarm.disease_data) && (
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Pest & Disease Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {selectedFarm.pest_data && (
                          <div className="space-y-3">
                            <Label className="flex items-center gap-2 text-red-600">
                              <Bug className="h-4 w-4" />
                              Pest Detected
                            </Label>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">Pest Type</p>
                                <p className="font-medium capitalize">
                                  {formatString(selectedFarm.pest_data.pest)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Days Since Detection</p>
                                <p className="font-medium">{selectedFarm.pest_data.days}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Pesticide Applied</p>
                                <Badge variant={selectedFarm.pest_data.pesticide_applied === 'Yes' ? 'default' : 'outline'}>
                                  {selectedFarm.pest_data.pesticide_applied}
                                </Badge>
                              </div>
                              {selectedFarm.pest_data.product && (
                                <div>
                                  <p className="text-sm text-gray-500">Product Used</p>
                                  <p className="font-medium">{selectedFarm.pest_data.product}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {selectedFarm.disease_data && (
                          <div className="space-y-3">
                            <Label className="flex items-center gap-2 text-orange-600">
                              <Skull className="h-4 w-4" />
                              Disease Detected
                            </Label>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">Disease Type</p>
                                <p className="font-medium capitalize">
                                  {formatString(selectedFarm.disease_data.disease)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Days Since Detection</p>
                                <p className="font-medium">{selectedFarm.disease_data.days}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Treatment Applied</p>
                                <Badge variant={selectedFarm.disease_data.pesticide_applied === 'Yes' ? 'default' : 'outline'}>
                                  {selectedFarm.disease_data.pesticide_applied}
                                </Badge>
                              </div>
                              {selectedFarm.disease_data.product && (
                                <div>
                                  <p className="text-sm text-gray-500">Product Used</p>
                                  <p className="font-medium">{selectedFarm.disease_data.product}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Yellowing Issues */}
                {selectedFarm.yellowing_data && (
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-yellow-600">
                        <AlertCircle className="h-5 w-5" />
                        Yellowing Issues
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Affected Zone</Label>
                        <p className="font-medium">{selectedFarm.yellowing_data.zone_ids}</p>
                      </div>
                      <div>
                        <Label>Potential Causes</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedFarm.yellowing_data.causes.map((cause, i) => (
                            <Badge key={i} variant="outline" className="text-yellow-700 bg-yellow-50">
                              {formatString(cause)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <DialogFooter>
                <Button onClick={() => setIsDetailModalOpen(false)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}