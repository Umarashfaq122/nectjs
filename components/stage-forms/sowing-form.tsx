"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Wheat,
  Search,
  Calendar,
  User,
  MapPin,
  Droplets,
  Thermometer,
  TrendingUp,
  BarChart3,
  Eye,
  ChevronRight,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Info,
  Shield,
  Bug,
  CloudRain,
  Hash,
  Home,
  Trees,
  Cloud,
  FileText,
  ClipboardList,
  AlertTriangle,
  Sprout,
  Package,
  Droplet,
  ThermometerSun,
  Zap,
  Leaf,
  Moon,
  FlaskConical,
} from "lucide-react";

/* ===================== TYPES ===================== */

export interface FarmData {
  id: number;
  farm: number;
  farm_name: string;
  farmer_name: string;
  crop_name: string;
  variety: string;
  method_of_sowing: string;
  seed_rate: string;
  raya_sowing_date: string;
  farm_picture?: string | null;
  max_temp_day?: number | null;
  min_temp_day?: number | null;
  avg_temp_night?: number | null;
  humidity?: number | null;
  precipitation?: number | null;
  seed_treatment?: boolean;
  seed_treatment_product?: string | null;
  soil_conditioner?: boolean;
  soil_conditioner_product?: string | null;
  bio_stimulant?: string | null;
  aphid_recommendation?: string | string[] | null;
  basal_fertilizers_applied?: Array<{
    fertilizer: string;
    quantity: number;
  }> | null;
}

/* ===================== COMPONENT ===================== */

export function SowingForm() {
  const [farmData, setFarmData] = useState<FarmData[]>([]);
  const [filteredFarms, setFilteredFarms] = useState<FarmData[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<FarmData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    "all" | "wheat" | "rice" | "corn" | "cotton" | "other"
  >("all");
  const [selectedFarmNumber, setSelectedFarmNumber] = useState("all");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  /* ===================== FETCH ===================== */

  /* ===================== FETCH ===================== */

  useEffect(() => {
    fetchFarmData();
  }, []);

  const fetchFarmData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      setLoading(true);
      setError(null);

      const res = await fetch(
        "https://rda.ngrok.app/api/sowing-emergence-stageView/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        },
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      console.log("Fetched Sowing & Emergence Data:", json);
      console.log(
        "Sample farm data with fertilizers:",
        json.results?.[0]?.basal_fertilizers_applied,
      );

      const normalized: FarmData[] = (json.results || json || []).map(
        (farm: any) => {
          let sowingMethod = "";
          if (
            Array.isArray(farm.method_of_sowing) &&
            farm.method_of_sowing.length > 0
          ) {
            sowingMethod =
              farm.method_of_sowing[0].sowing_method || "Not specified";
          } else if (typeof farm.method_of_sowing === "string") {
            sowingMethod = farm.method_of_sowing;
          }

          let varietyStr = "";
          if (Array.isArray(farm.variety) && farm.variety.length > 0) {
            varietyStr = farm.variety.join(", ");
          } else if (typeof farm.variety === "string") {
            varietyStr = farm.variety;
          }

          let aphidRec = farm.aphid_recommendation;
          if (aphidRec === "") {
            aphidRec = null;
          }

          // Handle basal fertilizers - check different possible field names
          let basalFertilizers = farm.basal_fertilizers_applied;

          // Debug log to see what we're getting
          console.log(`Farm ${farm.id} fertilizers:`, basalFertilizers);

          // If it's an array with items, keep it, otherwise set to null
          if (
            !basalFertilizers ||
            !Array.isArray(basalFertilizers) ||
            basalFertilizers.length === 0
          ) {
            basalFertilizers = null;
          } else {
            // Ensure each fertilizer has the correct structure
            basalFertilizers = basalFertilizers.map((fert: any) => ({
              fertilizer: fert.fertilizer || "Unknown",
              quantity: fert.quantity || 0,
            }));
          }

          // Handle bio_stimulant (fix typo from API: bio_estimant)
          const bioStimulant = farm.bio_stimulant || farm.bio_estimant || null;

          return {
            id: farm.id || 0,
            farm: farm.farm || 0,
            farm_name: farm.farm_name || "Unknown Farm",
            farmer_name: farm.farmer_name || "Unknown Farmer",
            crop_name: farm.crop_name || "Unknown Crop",
            variety: varietyStr,
            method_of_sowing: sowingMethod,
            seed_rate: farm.seed_rate || "Not specified",
            raya_sowing_date:
              farm.raya_sowing_date || new Date().toISOString().split("T")[0],
            farm_picture: farm.farm_picture || null,
            max_temp_day: farm.max_temp_day || null,
            min_temp_day: farm.min_temp_day || null,
            avg_temp_night: farm.avg_temp_night || null,
            humidity: farm.humidity || null,
            precipitation: farm.precipitation || null,
            seed_treatment: farm.seed_treatment || false,
            seed_treatment_product: farm.seed_treatment_product || null,
            soil_conditioner: farm.soil_conditioner || false,
            soil_conditioner_product: farm.soil_conditioner_product || null,
            bio_stimulant: bioStimulant,
            aphid_recommendation: aphidRec,
            basal_fertilizers_applied: basalFertilizers,
          };
        },
      );

      // Debug: Check if fertilizers are being included
      console.log(
        "Normalized data with fertilizers:",
        normalized.map((f) => ({
          id: f.id,
          farm: f.farm,
          fertilizers: f.basal_fertilizers_applied,
        })),
      );

      setFarmData(normalized);
      setFilteredFarms(normalized);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  /* ===================== FILTERING ===================== */

  useEffect(() => {
    let results = [...farmData];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (f) =>
          (f.crop_name?.toLowerCase() || "").includes(q) ||
          (f.variety?.toLowerCase() || "").includes(q) ||
          (f.method_of_sowing?.toLowerCase() || "").includes(q) ||
          (f.farm?.toString() || "").includes(q) ||
          (f.farm_name?.toLowerCase() || "").includes(q) ||
          (f.farmer_name?.toLowerCase() || "").includes(q),
      );
    }

    if (selectedFarmNumber !== "all") {
      results = results.filter((f) => f.farm.toString() === selectedFarmNumber);
    }

    if (activeTab !== "all") {
      results = results.filter((f) =>
        f.crop_name?.toLowerCase().includes(activeTab),
      );
    }

    setFilteredFarms(results);
  }, [farmData, searchQuery, activeTab, selectedFarmNumber]);

  /* ===================== STATS ===================== */

  const stats = useMemo(() => {
    const total = farmData.length;

    // Get unique varieties count
    const allVarieties = farmData.flatMap((f) =>
      f.variety
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
    );
    const uniqueVarieties = new Set(allVarieties);

    // Get unique crops count
    const uniqueCrops = new Set(
      farmData.map((f) => f.crop_name).filter(Boolean),
    );

    // Farms with seed treatment
    const farmsWithSeedTreatment = farmData.filter(
      (f) => f.seed_treatment,
    ).length;

    // Farms with soil conditioner
    const farmsWithSoilConditioner = farmData.filter(
      (f) => f.soil_conditioner,
    ).length;

    // Farms with fertilizers
    const farmsWithFertilizers = farmData.filter(
      (f) =>
        f.basal_fertilizers_applied && f.basal_fertilizers_applied.length > 0,
    ).length;

    return {
      total,
      varietiesCount: uniqueVarieties.size,
      cropsCount: uniqueCrops.size,
      farmsWithSeedTreatment,
      farmsWithSoilConditioner,
      farmsWithFertilizers,
      seedTreatmentPercentage: total
        ? Math.round((farmsWithSeedTreatment / total) * 100)
        : 0,
      soilConditionerPercentage: total
        ? Math.round((farmsWithSoilConditioner / total) * 100)
        : 0,
      fertilizersPercentage: total
        ? Math.round((farmsWithFertilizers / total) * 100)
        : 0,
    };
  }, [farmData]);

  /* ===================== HELPERS ===================== */

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const getUniqueFarmNumbers = () => {
    const numbers = farmData.map((f) => f.farm.toString());
    return [...new Set(numbers)].sort((a, b) => parseInt(a) - parseInt(b));
  };

  const getCropIcon = (cropName: string) => {
    const lowerCrop = cropName.toLowerCase();
    if (lowerCrop.includes("wheat")) return <Wheat className="h-5 w-5" />;
    if (lowerCrop.includes("rice")) return <Sprout className="h-5 w-5" />;
    if (lowerCrop.includes("corn") || lowerCrop.includes("maize"))
      return <Leaf className="h-5 w-5" />;
    if (lowerCrop.includes("cotton")) return <Package className="h-5 w-5" />;
    return <Trees className="h-5 w-5" />;
  };

  const getCropColor = (cropName: string) => {
    const lowerCrop = cropName.toLowerCase();
    if (lowerCrop.includes("wheat")) return "bg-amber-100 text-amber-800";
    if (lowerCrop.includes("rice")) return "bg-emerald-100 text-emerald-800";
    if (lowerCrop.includes("corn") || lowerCrop.includes("maize"))
      return "bg-green-100 text-green-800";
    if (lowerCrop.includes("cotton")) return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  /* ===================== LOADING STATE ===================== */

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Stats Skeletons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>

        {/* Filter Skeletons */}
        <div className="flex flex-col md:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-48" />
        </div>

        {/* Cards Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="py-12 text-center">
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Failed to Load Data</h3>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={fetchFarmData} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
            <Button variant="outline" onClick={() => setError(null)}>
              Dismiss
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Farm Sowing Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Monitor crop varieties, sowing methods, and farm conditions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={fetchFarmData}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Farms
                </p>
                <p className="text-3xl font-bold mt-2">{stats.total}</p>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Crop Varieties
                </p>
                <p className="text-3xl font-bold mt-2 text-purple-600">
                  {stats.varietiesCount}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-50 rounded-full flex items-center justify-center">
                <Trees className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Across all farms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Seed Treatment
                </p>
                <p className="text-3xl font-bold mt-2 text-emerald-600">
                  {stats.farmsWithSeedTreatment}
                </p>
              </div>
              <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <Progress value={stats.seedTreatmentPercentage} className="mt-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {stats.seedTreatmentPercentage}% of farms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Fertilizers
                </p>
                <p className="text-3xl font-bold mt-2 text-orange-600">
                  {stats.farmsWithFertilizers}
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-50 rounded-full flex items-center justify-center"></div>
            </div>
            <Progress
              value={stats.fertilizersPercentage}
              className="mt-3 bg-orange-100"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {stats.fertilizersPercentage}% of farms
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FILTERS */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search farms, crops, varieties, farmers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select
                value={selectedFarmNumber}
                onValueChange={setSelectedFarmNumber}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <Home className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select Farm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Farms</SelectItem>
                  {getUniqueFarmNumbers().map((num) => {
                    const farm = farmData.find(
                      (f) => f.farm.toString() === num,
                    );
                    return (
                      <SelectItem key={num} value={num}>
                        <div className="flex flex-col">
                          <span className="font-medium">Farm #{num}</span>
                          <span className="text-xs text-muted-foreground">
                            {farm?.farm_name || "Unknown Farm"}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-shrink-0">
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as any)}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="all" className="text-xs">
                    All Crops
                  </TabsTrigger>
                  <TabsTrigger value="wheat" className="text-xs gap-1">
                    <Wheat className="h-3 w-3" />
                    Wheat
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FARM CARDS */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Farm Overview</h3>
          <span className="text-sm text-muted-foreground">
            Showing {filteredFarms.length} of {farmData.length} farms
          </span>
        </div>

        {filteredFarms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFarms.map((farm) => (
              <Card
                key={farm.id}
                className="group hover:shadow-lg transition-all duration-200 hover:border-primary/20"
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 bg-gradient-to-br from-amber-100 to-amber-200">
                        <AvatarFallback className="bg-transparent text-amber-700">
                          {getCropIcon(farm.crop_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {farm.crop_name}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`mt-1 ${getCropColor(farm.crop_name)}`}
                        >
                          {farm.variety.split(",")[0] || "Unknown Variety"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span>Farm #{farm.farm}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="truncate">{farm.farm_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{farm.farmer_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Sown on {formatDate(farm.raya_sowing_date)}</span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Sowing Method
                      </p>
                      <p className="text-sm font-medium">
                        {farm.method_of_sowing}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Seed Rate
                      </p>
                      <p className="text-sm font-medium">{farm.seed_rate}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {farm.seed_treatment && (
                      <Badge
                        variant="secondary"
                        className="gap-1 bg-emerald-50 text-emerald-700"
                      >
                        <Shield className="h-3 w-3" />
                        Seed Treated
                      </Badge>
                    )}
                    {farm.soil_conditioner && (
                      <Badge
                        variant="secondary"
                        className="gap-1 bg-orange-50 text-orange-700"
                      >
                        <Zap className="h-3 w-3" />
                        Soil Conditioned
                      </Badge>
                    )}
                    {farm.basal_fertilizers_applied &&
                      farm.basal_fertilizers_applied.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="gap-1 bg-purple-50 text-purple-700"
                        >
                          Fertilized
                        </Badge>
                      )}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full group-hover:border-primary group-hover:text-primary"
                    onClick={() => {
                      setSelectedFarm(farm);
                      setIsDetailModalOpen(true);
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                    <ChevronRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No farms found</h3>
              <p className="text-muted-foreground mb-6">
                No farms match your current filters. Try adjusting your search
                criteria.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setActiveTab("all");
                  setSelectedFarmNumber("all");
                }}
              >
                Clear all filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ENHANCED DETAIL MODAL */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          {selectedFarm && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14 bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-300">
                    <AvatarFallback className="bg-transparent text-amber-700">
                      {getCropIcon(selectedFarm.crop_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <DialogTitle className="text-xl flex items-center gap-2">
                      {selectedFarm.crop_name}
                      <Badge variant="outline" className="font-normal">
                        {selectedFarm.farm_name}
                      </Badge>
                    </DialogTitle>
                    <DialogDescription className="mt-1">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="flex items-center gap-1 text-gray-600">
                          <Hash className="h-3 w-3" />
                          Farm #{selectedFarm.farm}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="flex items-center gap-1 text-gray-600">
                          <User className="h-3 w-3" />
                          {selectedFarm.farmer_name}
                        </span>
                      </div>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* VARIETIES SECTION */}
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Trees className="h-5 w-5 text-amber-700" />
                    <h3 className="font-semibold text-amber-800">
                      Crop Varieties
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedFarm.variety.split(",").map((variety, index) => (
                      <Badge
                        key={index}
                        className="bg-white text-amber-800 border-amber-300 hover:bg-amber-50"
                      >
                        {variety.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* SOWING INFORMATION GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <ClipboardList className="h-4 w-4 text-gray-500" />
                          <h4 className="font-medium">Sowing Information</h4>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              Sowing Method
                            </p>
                            <p className="font-medium">
                              {selectedFarm.method_of_sowing}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              Seed Rate
                            </p>
                            <p className="font-medium">
                              {selectedFarm.seed_rate}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              Sowing Date
                            </p>
                            <p className="font-medium">
                              {formatDate(selectedFarm.raya_sowing_date)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* FERTILIZERS CARD */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">Basal Fertilizers</h4>
                        </div>
                        <div className="space-y-3">
                          {selectedFarm.basal_fertilizers_applied &&
                          selectedFarm.basal_fertilizers_applied.length > 0 ? (
                            selectedFarm.basal_fertilizers_applied.map(
                              (fertilizer, index) => (
                                <div
                                  key={index}
                                  className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg"
                                >
                                  <div>
                                    <p className="font-medium capitalize">
                                      {fertilizer.fertilizer}
                                    </p>
                                  </div>
                                  <Badge variant="default" className="text-sm">
                                    {fertilizer.quantity} kg/acre
                                  </Badge>
                                </div>
                              ),
                            )
                          ) : (
                            <div className="text-center py-4 text-gray-500">
                              <p>No fertilizers applied</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* ENVIRONMENTAL DATA - INCLUDING NIGHT TEMP */}
                {(selectedFarm.max_temp_day !== null ||
                  selectedFarm.min_temp_day !== null ||
                  selectedFarm.avg_temp_night !== null ||
                  selectedFarm.humidity !== null ||
                  selectedFarm.precipitation !== null) && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <ThermometerSun className="h-4 w-4" />
                        Environmental Conditions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {selectedFarm.max_temp_day !== null && (
                          <div className="text-center p-3 bg-gradient-to-b from-orange-50 to-white rounded-lg border">
                            <Thermometer className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                            <p className="text-l font-bold">
                              {selectedFarm.max_temp_day}°C
                            </p>
                            <p className="text-xs text-gray-500">Max Temp</p>
                          </div>
                        )}
                        {selectedFarm.min_temp_day !== null && (
                          <div className="text-center p-3 bg-gradient-to-b from-blue-50 to-white rounded-lg border">
                            <Thermometer className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                            <p className="text-l font-bold">
                              {selectedFarm.min_temp_day}°C
                            </p>
                            <p className="text-xs text-gray-500">Min Temp</p>
                          </div>
                        )}
                        {selectedFarm.avg_temp_night !== null && (
                          <div className="text-center p-3 bg-gradient-to-b from-indigo-50 to-white rounded-lg border">
                            <Moon className="h-6 w-6 mx-auto mb-2 text-indigo-600" />
                            <p className="text-l font-bold">
                              {selectedFarm.avg_temp_night}°C
                            </p>
                            <p className="text-xs text-gray-500">Night Temp</p>
                          </div>
                        )}
                        {selectedFarm.humidity !== null && (
                          <div className="text-center p-3 bg-gradient-to-b from-cyan-50 to-white rounded-lg border">
                            <Droplet className="h-6 w-6 mx-auto mb-2 text-cyan-600" />
                            <p className="text-l font-bold">
                              {selectedFarm.humidity}%
                            </p>
                            <p className="text-xs text-gray-500">Humidity</p>
                          </div>
                        )}
                        {selectedFarm.precipitation !== null && (
                          <div className="text-center p-3 bg-gradient-to-b from-indigo-50 to-white rounded-lg border">
                            <CloudRain className="h-6 w-6 mx-auto mb-2 text-indigo-600" />
                            <p className="text-xl font-bold">
                              {selectedFarm.precipitation}mm
                            </p>
                            <p className="text-xs text-gray-500">Rainfall</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* TREATMENTS SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* SEED TREATMENT */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                          <Shield className="h-4 w-4 text-emerald-600" />
                          <h4 className="font-medium">Seed Treatment</h4>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm">
                              {selectedFarm.seed_treatment
                                ? "Applied"
                                : "Not Applied"}
                            </p>
                            {selectedFarm.seed_treatment_product && (
                              <p className="text-xs text-gray-500 mt-1">
                                {selectedFarm.seed_treatment_product}
                              </p>
                            )}
                          </div>
                          <Badge
                            variant={
                              selectedFarm.seed_treatment
                                ? "default"
                                : "outline"
                            }
                          >
                            {selectedFarm.seed_treatment ? "Yes" : "No"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* SOIL CONDITIONER */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                          <Zap className="h-4 w-4 text-orange-600" />
                          <h4 className="font-medium">Soil Conditioner</h4>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm">
                              {selectedFarm.soil_conditioner
                                ? "Applied"
                                : "Not Applied"}
                            </p>
                            {selectedFarm.soil_conditioner_product && (
                              <p className="text-xs text-gray-500 mt-1">
                                {selectedFarm.soil_conditioner_product}
                              </p>
                            )}
                          </div>
                          <Badge
                            variant={
                              selectedFarm.soil_conditioner
                                ? "default"
                                : "outline"
                            }
                          >
                            {selectedFarm.soil_conditioner ? "Yes" : "No"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* BIO-STIMULANT */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                          <FlaskConical className="h-4 w-4 text-purple-600" />
                          <h4 className="font-medium">Bio-stimulant</h4>
                        </div>
                        <div>
                          <p className="text-sm">
                            {selectedFarm.bio_stimulant || "None applied"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* RECOMMENDATIONS */}
                {selectedFarm.aphid_recommendation && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Bug className="h-4 w-4" />
                        Pest Management Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="bg-blue-100 p-1.5 rounded-full">
                            <Bug className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-blue-800 mb-1">
                              Aphid Control
                            </p>
                            <div className="space-y-1">
                              {Array.isArray(
                                selectedFarm.aphid_recommendation,
                              ) ? (
                                selectedFarm.aphid_recommendation.map(
                                  (rec, i) => (
                                    <p
                                      key={i}
                                      className="text-sm text-gray-700 flex items-start gap-1"
                                    >
                                      <span className="text-blue-500 mt-0.5">
                                        •
                                      </span>
                                      {rec}
                                    </p>
                                  ),
                                )
                              ) : (
                                <p className="text-sm text-gray-700">
                                  {selectedFarm.aphid_recommendation}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <DialogFooter className="pt-6 border-t">
                <div className="flex w-full justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Last updated: {formatDate(selectedFarm.raya_sowing_date)}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsDetailModalOpen(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
