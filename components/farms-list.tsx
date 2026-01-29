'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MapPin,
  Users,
  Package,
  TrendingUp,
  Filter,
  Search,
  ChevronRight,
  Home,
  Scale,
  User,
  Clock,
  Eye,
  Calendar,
  Droplets,
  Sun,
  PieChart,
  BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

/* ================= TYPES ================= */

type Farmer = {
  id: number
  first_name: string
  last_name: string
  total_fields?: number
  total_area?: number
}

type Field = {
  id: number
  field_name: string
  location: string
  total_area: number
  cultivatable_area: number
  ownership_type_display: string
  farmer_name: string
  farmer: number // This is the farmer ID field
  crops_grown?: string[]
  last_visited?: string
  soil_type?: string
  irrigation_type?: string
}

type Stats = {
  total_fields: number
  total_area: number
  total_area_acres: number
  cultivatable_area_acres: number
  total_farmers: number
  avg_field_size: number
  cultivation_percentage: number
}

/* ================= COMPONENT ================= */

export function FarmsList() {
  const [fields, setFields] = useState<Field[]>([])
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [stats, setStats] = useState<Stats>({
    total_fields: 0,
    total_area: 0,
    total_area_acres: 0,
    cultivatable_area_acres: 0,
    total_farmers: 0,
    avg_field_size: 0,
    cultivation_percentage: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFarmer, setSelectedFarmer] = useState('all')
  const [viewType, setViewType] = useState('grid')

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('authToken')
      : null

  /* ================= FETCH FIELDS & FARMERS ================= */

  const fetchAllFields = async () => {
    setLoading(true)
    let url: string | null = 'https://rda.ngrok.app/api/fields/'
    let allFields: Field[] = []

    try {
      while (url) {
        const res:any = await fetch(url.replace('http://', 'https://'), {
          headers: {
            Authorization: `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true',
          },
        })

        if (!res.ok) throw new Error('Failed to fetch fields')
        
        const data = await res.json()
        console.log('Fetched fields data:', data)
        allFields.push(...(data.data || []))
        url = data.next ? data.next.replace('http://', 'https://') : null
      }

      setFields(allFields)
      calculateStats(allFields)
      
      // Extract unique farmers from fields with safe parsing
      const farmerMap = new Map<number, Farmer>()
      allFields.forEach(field => {
        const farmerId = field.farmer
        if (!farmerId) return // Skip if farmer ID is missing
        
        if (!farmerMap.has(farmerId)) {
          // Safely parse farmer name
          const nameParts = field.farmer_name ? field.farmer_name.split(' ') : ['Unknown', 'Farmer']
          farmerMap.set(farmerId, {
            id: farmerId,
            first_name: nameParts[0] || 'Unknown',
            last_name: nameParts.slice(1).join(' ') || 'Farmer',
            total_fields: 0,
            total_area: 0
          })
        }
        const farmer = farmerMap.get(farmerId)!
        farmer.total_fields = (farmer.total_fields || 0) + 1
        farmer.total_area = (farmer.total_area || 0) + field.total_area
      })
      
      setFarmers(Array.from(farmerMap.values()))
    } catch (err) {
      console.error('Error fetching fields:', err)
      setFields([])
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (fields: Field[]) => {
    const totalFields = fields.length
    const totalArea = fields.reduce((sum, field) => sum + (field.total_area || 0), 0)
    const cultivatableArea = fields.reduce((sum, field) => sum + (field.cultivatable_area || 0), 0)
    const uniqueFarmers = new Set(fields.map(f => f.farmer).filter(id => id)).size

    const calculatedStats: Stats = {
      total_fields: totalFields,
      total_area: totalArea,
      total_area_acres: totalArea,
      cultivatable_area_acres: cultivatableArea,
      total_farmers: uniqueFarmers,
      avg_field_size: totalFields > 0 ? totalArea / totalFields : 0,
      cultivation_percentage: totalArea > 0 ? (cultivatableArea / totalArea) * 100 : 0
    }

    setStats(calculatedStats)
  }

  /* ================= INITIAL LOAD ================= */

  useEffect(() => {
    if (!token) return
    fetchAllFields()
  }, [token])

  /* ================= FILTER ================= */

  const filteredFields = fields.filter(field => {
    const matchesSearch = 
      (field.field_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (field.location?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (field.farmer_name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    
    const matchesFarmer = selectedFarmer === 'all' || field.farmer?.toString() === selectedFarmer
    
    return matchesSearch && matchesFarmer
  })

  /* ================= UI ================= */

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      {/* <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Farm Management Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage all farms in your network
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Tabs value={viewType} onValueChange={setViewType} className="w-auto">
            <TabsList className="grid grid-cols-2 w-32">
              <TabsTrigger value="grid">
                <Eye className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="list">
                <BarChart3 className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            <Package className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div> */}

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-white to-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Farmers</p>
                <h3 className="text-2xl font-bold mt-2">{stats.total_farmers}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  <TrendingUp className="inline h-3 w-3 text-green-600 mr-1" />
                  Active in network
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-white to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Farms</p>
                <h3 className="text-2xl font-bold mt-2">{stats.total_fields}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  <Home className="inline h-3 w-3 text-blue-600 mr-1" />
                  Across all farmers
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 bg-gradient-to-br from-white to-amber-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Area</p>
                <h3 className="text-2xl font-bold mt-2">
                  {stats.total_area_acres.toLocaleString()} acres
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  <Scale className="inline h-3 w-3 text-amber-600 mr-1" />
                  Avg: {stats.avg_field_size.toFixed(1)} acres
                </p>
              </div>
              <div className="p-3 rounded-full bg-amber-100">
                <Scale className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-br from-white to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cultivated Area</p>
                <h3 className="text-2xl font-bold mt-2">
                  {stats.cultivatable_area_acres.toLocaleString()} acres
                </h3>
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Cultivation Ratio</span>
                    <span className="font-medium">{stats.cultivation_percentage.toFixed(1)}%</span>
                  </div>
                  <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-emerald-600 rounded-full transition-all duration-300"
                      style={{ width: `${stats.cultivation_percentage}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-full bg-emerald-100">
                <PieChart className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FILTERS BAR */}
      <Card className="border shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search farms by name, location, or farmer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium whitespace-nowrap">Filter by:</span>
              <Select value={selectedFarmer} onValueChange={setSelectedFarmer}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Farmer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Farmers ({farmers.length})</SelectItem>
                  {farmers.map(farmer => {
                    if (!farmer.id) return null // Skip if farmer ID is undefined
                    
                    return (
                      <SelectItem key={farmer.id} value={farmer.id.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <span>
                            {farmer.first_name} {farmer.last_name}
                          </span>
                          <span className="text-muted-foreground text-xs ml-2">
                            ({farmer.total_fields || 0})
                          </span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {filteredFields.length} of {fields.length} farms
              {selectedFarmer !== 'all' && ` for selected farmer`}
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setSelectedFarmer('all')
                setSearchQuery('')
              }}
            >
              Clear filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* FARM CARDS GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredFields.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No farms found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filter criteria
            </p>
            <Button 
              variant="outline"
              onClick={() => {
                setSelectedFarmer('all')
                setSearchQuery('')
              }}
            >
              Clear all filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFields.map((field) => (
            <Card 
              key={field.id} 
              className="group hover:shadow-lg transition-all duration-300 hover:border-green-300 overflow-hidden"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-semibold group-hover:text-green-700 transition-colors">
                      {field.field_name || 'Unnamed Farm'}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {field.location || 'Location not specified'}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {field.ownership_type_display || 'Unknown'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pb-3">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Farmer</span>
                    </div>
                    <span className="font-medium">{field.farmer_name || 'Unknown Farmer'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Scale className="h-3 w-3 mr-1" />
                        Total Area
                      </div>
                      <p className="font-semibold">{field.total_area || 0} acres</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Sun className="h-3 w-3 mr-1" />
                        Cultivable
                      </div>
                      <p className="font-semibold text-emerald-600">
                        {field.cultivatable_area || 0} acres
                      </p>
                    </div>
                  </div>

                  {field.last_visited && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      Last visited: {new Date(field.last_visited).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="pt-3 border-t">
                <div className="flex items-center justify-between w-full">
                  {field.crops_grown && field.crops_grown.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {field.crops_grown.slice(0, 2).map((crop, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {crop}
                        </Badge>
                      ))}
                      {field.crops_grown.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{field.crops_grown.length - 2} more
                        </Badge>
                      )}
                    </div>
                  )}
                  {/* <Button size="sm" variant="ghost" className="ml-auto group/btn">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                    <ChevronRight className="h-4 w-4 ml-1 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  </Button> */}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}