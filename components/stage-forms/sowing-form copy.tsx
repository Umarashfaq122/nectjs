"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

import {
  Wheat,
  Sprout,
  Leaf,
  AlertCircle,
  Search,
  Filter,
  Calendar,
  Package,
  Eye,
  ChevronRight,
  ThermometerSun,
  Thermometer,
  Droplet,
  CloudRain,
  Sun,
  Cloud,
  Wind,
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

  germination_percentage: "Good" | "Average" | "Poor";
  germination_issues?: Record<string, string[]> | null;

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
    "all" | "good" | "average" | "poor" | "issues" | "recent"
  >("all");
  const [selectedFarmNumber, setSelectedFarmNumber] = useState("all");

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  /* ===================== FETCH ===================== */

  useEffect(() => {
    fetchFarmData();
  }, []);

  const fetchFarmData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      setLoading(true);

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

      // ✅ NORMALIZE DATA (CRITICAL FIX)
      const normalized: FarmData[] = (json.results || json || []).map(
        (farm: any) => {
          // Handle germination_percentage which might be numeric in API
          const germPercentage = farm.germination_percentage;
          let germStatus: "Good" | "Average" | "Poor" = "Average";

          if (typeof germPercentage === "number") {
            if (germPercentage >= 80) germStatus = "Good";
            else if (germPercentage >= 50) germStatus = "Average";
            else germStatus = "Poor";
          } else if (typeof germPercentage === "string") {
            const num = parseInt(germPercentage);
            if (!isNaN(num)) {
              if (num >= 80) germStatus = "Good";
              else if (num >= 50) germStatus = "Average";
              else germStatus = "Poor";
            }
          }

          // Handle method_of_sowing which is an array in API
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

          // Handle variety which is an array in API
          let varietyStr = "";
          if (Array.isArray(farm.variety) && farm.variety.length > 0) {
            varietyStr = farm.variety.join(", ");
          } else if (typeof farm.variety === "string") {
            varietyStr = farm.variety;
          }

          // Handle germination_issues
          let germIssues = farm.germination_issues;
          if (!germIssues || typeof germIssues !== "object") {
            germIssues = {};
          }

          // Handle aphid_recommendation which might be string or array
          let aphidRec = farm.aphid_recommendation;
          if (aphidRec === "") {
            aphidRec = null;
          }

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

            germination_percentage: germStatus,
            germination_issues: germIssues,

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
            bio_stimulant: farm.bio_stimulant || null,
            aphid_recommendation: aphidRec,
          };
        },
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

    if (activeTab === "issues") {
      results = results.filter(
        (f) => Object.keys(f.germination_issues || {}).length > 0,
      );
    } else if (activeTab !== "all") {
      results = results.filter(
        (f) => f.germination_percentage.toLowerCase() === activeTab,
      );
    }

    setFilteredFarms(results);
  }, [farmData, searchQuery, activeTab, selectedFarmNumber]);

  /* ===================== HELPERS ===================== */

  const getGerminationColor = (status: string) => {
    if (status === "Good") return "bg-green-100 text-green-800";
    if (status === "Average") return "bg-yellow-100 text-yellow-800";
    if (status === "Poor") return "bg-red-100 text-red-800";
    return "bg-gray-100";
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const parseAphidRecommendation = (rec: string | string[] | null) => {
    if (!rec) return [];
    if (Array.isArray(rec)) return rec;
    try {
      const parsed = JSON.parse(rec);
      return Array.isArray(parsed) ? parsed : [rec];
    } catch {
      return [rec];
    }
  };

  const getUniqueFarmNumbers = () => {
    const numbers = farmData.map((f) => f.farm.toString());
    return [...new Set(numbers)].sort();
  };

  /* ===================== UI ===================== */

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-red-600">
          <AlertCircle className="mx-auto mb-4" />
          <p>{error}</p>
          <Button className="mt-4" onClick={fetchFarmData}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Sowing & Emergence Data</h2>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex gap-4">
          <Input
            placeholder="Search farms, crops, varieties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />

          <Select
            value={selectedFarmNumber}
            onValueChange={setSelectedFarmNumber}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Farm #" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Farms</SelectItem>
              {getUniqueFarmNumbers().map((num) => {
                const farm = farmData.find((f) => f.farm.toString() === num);

                return (
                  <SelectItem key={num} value={num}>
                    <div className="flex flex-col">
                      <span>
                        Farm #{num} - {farm?.farm_name || "Unknown Farm"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Farmer: {farm?.farmer_name || "Unknown"}
                      </span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="good">Good</TabsTrigger>
            <TabsTrigger value="average">Average</TabsTrigger>
            <TabsTrigger value="poor">Poor</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* SUMMARY STATS */}
      {farmData.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{farmData.length}</p>
                <p className="text-sm text-muted-foreground">Total Farms</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {[...new Set(farmData.map((f) => f.crop_name))].length}
                </p>
                <p className="text-sm text-muted-foreground">Crop Types</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFarms.length > 0 ? (
          filteredFarms.map((farm) => (
            <Card key={farm.id} className="hover:shadow-lg transition">
              <CardContent className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{farm.crop_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {farm.variety}
                    </p>
                  </div>
                  <Badge
                    className={getGerminationColor(farm.germination_percentage)}
                  >
                    {farm.germination_percentage}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground">
                  Farm #{farm.farm} • {farm.farm_name}
                </p>
                <p className="text-sm">Farmer: {farm.farmer_name}</p>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sowing Method</span>
                    <span>{farm.method_of_sowing}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Seed Rate</span>
                    <span>{farm.seed_rate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sowing Date</span>
                    <span>{formatDate(farm.raya_sowing_date)}</span>
                  </div>
                </div>

                {Object.keys(farm.germination_issues || {}).length > 0 && (
                  <div className="pt-2">
                    <Badge
                      variant="outline"
                      className="text-red-600 border-red-200"
                    >
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Has Issues
                    </Badge>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => {
                    setSelectedFarm(farm);
                    setIsDetailModalOpen(true);
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" /> View Details
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">
              No farms found matching your criteria
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                setActiveTab("all");
                setSelectedFarmNumber("all");
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedFarm && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Wheat className="h-5 w-5" />
                  <DialogTitle>{selectedFarm.crop_name}</DialogTitle>
                </div>
                <DialogDescription>
                  {selectedFarm.farm_name} • Farm #{selectedFarm.farm} • Farmer:{" "}
                  {selectedFarm.farmer_name}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* BASIC INFO */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-muted-foreground">Variety</Label>
                      <p>{selectedFarm.variety || "Not specified"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        Sowing Method
                      </Label>
                      <p>{selectedFarm.method_of_sowing}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Seed Rate</Label>
                      <p>{selectedFarm.seed_rate}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        Sowing Date
                      </Label>
                      <p>{formatDate(selectedFarm.raya_sowing_date)}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* GERMINATION STATUS */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Germination Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div
                        className={`px-3 py-1 rounded-full ${getGerminationColor(selectedFarm.germination_percentage)}`}
                      >
                        {selectedFarm.germination_percentage}
                      </div>
                      {Object.keys(selectedFarm.germination_issues || {})
                        .length > 0 && (
                        <Badge variant="destructive">Has Issues</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* GERMINATION ISSUES */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Germination Issues
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Object.keys(selectedFarm.germination_issues || {}).length >
                    0 ? (
                      <div className="space-y-4">
                        {Object.entries(
                          selectedFarm.germination_issues || {},
                        ).map(([category, issues]) => (
                          <div key={category} className="space-y-2">
                            <Label className="text-base font-medium">
                              {category}
                            </Label>
                            <div className="flex flex-wrap gap-2">
                              {(issues || []).map((issue, i) => (
                                <Badge
                                  key={i}
                                  variant="secondary"
                                  className="px-3 py-1"
                                >
                                  {issue}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        No issues reported
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* ENVIRONMENTAL DATA */}
                {(selectedFarm.max_temp_day !== null ||
                  selectedFarm.min_temp_day !== null ||
                  selectedFarm.humidity !== null ||
                  selectedFarm.precipitation !== null) && (
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Environmental Data
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {selectedFarm.max_temp_day !== null && (
                          <div className="text-center">
                            <ThermometerSun className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                            <p className="text-2xl font-bold">
                              {selectedFarm.max_temp_day}°C
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Max Temp
                            </p>
                          </div>
                        )}
                        {selectedFarm.min_temp_day !== null && (
                          <div className="text-center">
                            <Thermometer className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                            <p className="text-2xl font-bold">
                              {selectedFarm.min_temp_day}°C
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Min Temp
                            </p>
                          </div>
                        )}
                        {selectedFarm.humidity !== null && (
                          <div className="text-center">
                            <Droplet className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                            <p className="text-2xl font-bold">
                              {selectedFarm.humidity}%
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Humidity
                            </p>
                          </div>
                        )}
                        {selectedFarm.precipitation !== null && (
                          <div className="text-center">
                            <CloudRain className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                            <p className="text-2xl font-bold">
                              {selectedFarm.precipitation}mm
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Precipitation
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* ADDITIONAL INFO */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Additional Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-muted-foreground">
                          Seed Treatment
                        </Label>
                        <p>{selectedFarm.seed_treatment ? "Yes" : "No"}</p>
                        {selectedFarm.seed_treatment_product && (
                          <p className="text-sm text-muted-foreground">
                            Product: {selectedFarm.seed_treatment_product}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="text-muted-foreground">
                          Soil Conditioner
                        </Label>
                        <p>{selectedFarm.soil_conditioner ? "Yes" : "No"}</p>
                        {selectedFarm.soil_conditioner_product && (
                          <p className="text-sm text-muted-foreground">
                            Product: {selectedFarm.soil_conditioner_product}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="text-muted-foreground">
                          Bio-stimulant
                        </Label>
                        <p>{selectedFarm.bio_stimulant || "None"}</p>
                      </div>
                    </div>
                    {selectedFarm.aphid_recommendation && (
                      <div className="mt-4">
                        <Label className="text-muted-foreground">
                          Aphid Recommendations
                        </Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {parseAphidRecommendation(
                            selectedFarm.aphid_recommendation,
                          ).map((rec, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="bg-blue-50"
                            >
                              {rec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDetailModalOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
