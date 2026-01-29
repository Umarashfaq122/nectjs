"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
import {
  Wheat,
  Thermometer,
  Droplets,
  Scale,
  AlertCircle,
  Package,
  Bug,
  Sprout,
  CheckCircle,
  XCircle,
  ChevronRight,
  Eye,
  Filter,
  Search,
  Download,
  BarChart3,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

interface RosetteData {
  id: number;
  crop_name: string;
  weeds_observed: boolean;
  post_emergent_applied: boolean;
  post_emergent_product: string;
  post_emergent_other_text: string;
  fertilizers_applied: boolean;
  fertilizer_type: string | null; // Can be null
  fertilizer_quantity_bags: string | null; // Can be null
  sulphur_applied: boolean;
  sulphur_product: string;
  sulphur_other_text: string;
  crop_under_stress: boolean;
  amino_applied: boolean;
  amino_product: string;
  amino_other_text: string;
  aphid_attack: boolean;
  aphid_pesticide: string;
  aphid_other_text: string;
  crop_health: string;
  crop_height: string;
  recommendation_irrigation_fertilizers: string; // Actual product name
  recommendation_sulphur_kumulus: string; // Actual product name
  recommendation_white_rust: string; // Actual product name
  recommendation_aphid_ulala: string; // Actual product name
  created_at: string;
  field: number;
  field_name: string;
}

export function RosetteForm() {
  const [rosetteData, setRosetteData] = useState<RosetteData[]>([]);
  const [filteredData, setFilteredData] = useState<RosetteData[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<RosetteData | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFarm, setSelectedFarm] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");

  // Get unique fields for filter
  const uniqueFarms = Array.from(
    new Set(rosetteData.map((record) => record.field_name))
  ).sort((a, b) => a.localeCompare(b));

  // Stats calculation
  const totalRecords = rosetteData.length;
  const healthyCrops = rosetteData.filter(
    (record) => record.crop_health === "healthy"
  ).length;
  const aphidAttacks = rosetteData.filter(
    (record) => record.aphid_attack
  ).length;
  const cropStress = rosetteData.filter(
    (record) => record.crop_under_stress
  ).length;
  const weedsObserved = rosetteData.filter(
    (record) => record.weeds_observed
  ).length;

  useEffect(() => {
    fetchRosetteData();
  }, []);

  // Filter data based on search, field, and tab
  useEffect(() => {
    let results = [...rosetteData];

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (record) =>
          record.crop_name.toLowerCase().includes(query) ||
          record.field_name.toLowerCase().includes(query) ||
          (record.fertilizer_type &&
            record.fertilizer_type.toLowerCase().includes(query)) ||
          record.crop_health.toLowerCase().includes(query)
      );
    }

    // Apply field filter
    if (selectedFarm !== "all") {
      results = results.filter((record) => record.field_name === selectedFarm);
    }

    // Apply tab filter
    if (activeTab === "issues") {
      results = results.filter(
        (record) =>
          record.aphid_attack ||
          record.crop_under_stress ||
          record.weeds_observed
      );
    } else if (activeTab === "healthy") {
      results = results.filter((record) => record.crop_health === "healthy");
    } else if (activeTab === "aphid") {
      results = results.filter((record) => record.aphid_attack);
    } else if (activeTab === "stress") {
      results = results.filter((record) => record.crop_under_stress);
    } else if (activeTab === "weeds") {
      results = results.filter((record) => record.weeds_observed);
    } else if (activeTab === "fair") {
      results = results.filter((record) => record.crop_health === "fair");
    } else if (activeTab === "stressed") {
      results = results.filter((record) => record.crop_health === "stressed");
    }

    setFilteredData(results);
  }, [searchQuery, selectedFarm, activeTab, rosetteData]);

  const fetchRosetteData = async () => {
    try {
      setLoading(true);
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("authToken")
          : null;

      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await fetch(
        "https://rda.ngrok.app/api/rosette-stage/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched rosette data:", data);
      setRosetteData(data.results || []);
      setFilteredData(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      console.error("Error fetching rosette data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getCropHealthColor = (health: string) => {
    switch (health.toLowerCase()) {
      case "healthy":
        return "bg-green-100 text-green-800";
      case "fair":
        return "bg-yellow-100 text-yellow-800";
      case "stressed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCropHealthLabel = (health: string) => {
    switch (health.toLowerCase()) {
      case "healthy":
        return "Healthy";
      case "fair":
        return "Fair";
      case "stressed":
        return "Stressed";
      default:
        return health;
    }
  };

  const getCropHeightLabel = (height: string) => {
    switch (height.toLowerCase()) {
      case "less_than_3_inches":
        return "< 3 inches";
      case "3_to_6_inches":
        return "3-6 inches";
      case "greater_than_6_inches":
        return "> 6 inches";
      default:
        return height.replace(/_/g, " ");
    }
  };

  const getCropHeightColor = (height: string) => {
    switch (height.toLowerCase()) {
      case "greater_than_6_inches":
        return "text-green-600";
      case "3_to_6_inches":
        return "text-amber-600";
      case "less_than_3_inches":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const openRecordDetails = (record: RosetteData) => {
    setSelectedRecord(record);
    setIsDetailModalOpen(true);
  };

  const renderBooleanStatus = (value: boolean) => (
    <div className="flex items-center gap-1">
      {value ? (
        <>
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-green-600 font-medium">Yes</span>
        </>
      ) : (
        <>
          <XCircle className="h-4 w-4 text-gray-400" />
          <span className="text-gray-500">No</span>
        </>
      )}
    </div>
  );

  // Helper to check if recommendation has a value
  const hasRecommendation = (recommendation: string) => {
    return recommendation && recommendation.trim() !== "";
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-red-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg font-semibold">Error Loading Data</p>
            <p className="text-sm mt-2">{error}</p>
            <Button onClick={fetchRosetteData} className="mt-4">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Rosette Stage Data
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor crop health, fertilizer applications, and pest control by
            field
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={fetchRosetteData}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">
                  Total Records
                </p>
                <h3 className="text-2xl font-bold text-green-900 mt-2">
                  {totalRecords}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-200 flex items-center justify-center">
                <Wheat className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">
                  Healthy Crops
                </p>
                <h3 className="text-2xl font-bold text-blue-900 mt-2">
                  {healthyCrops}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-200 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-blue-700" />
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              {totalRecords > 0
                ? ((healthyCrops / totalRecords) * 100).toFixed(1)
                : 0}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">
                  Aphid Attacks
                </p>
                <h3 className="text-2xl font-bold text-red-900 mt-2">
                  {aphidAttacks}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-200 flex items-center justify-center">
                <Bug className="h-6 w-6 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700">
                  Weeds Observed
                </p>
                <h3 className="text-2xl font-bold text-amber-900 mt-2">
                  {weedsObserved}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-200 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-amber-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by crop, fertilizer, health, or field number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full lg:w-[400px]"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Field Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedFarm} onValueChange={setSelectedFarm}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Fields</SelectItem>
                    {uniqueFarms.map((farm) => (
                      <SelectItem
                        key={farm}
                        value={farm}
                        className="capitalize"
                      >
                        {farm}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tab Filters */}
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-auto"
              >
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="issues">With Issues</TabsTrigger>
                  <TabsTrigger value="healthy">Healthy</TabsTrigger>
                  <TabsTrigger value="fair">Fair</TabsTrigger>
                  <TabsTrigger value="stressed">Stressed</TabsTrigger>
                  <TabsTrigger value="aphid">Aphid Attack</TabsTrigger>
                  <TabsTrigger value="weeds">Weeds</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Rosette Stage Records
            <span className="text-muted-foreground font-normal ml-2">
              ({filteredData.length}{" "}
              {filteredData.length === 1 ? "record" : "records"})
            </span>
          </h2>
          <div className="text-sm text-muted-foreground">
            {selectedFarm !== "all" && (
              <Badge variant="outline" className="mr-2 capitalize">
                {selectedFarm}
              </Badge>
            )}
            Sorted by latest date
          </div>
        </div>

        {filteredData.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Sprout className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No rosette data found
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                {searchQuery
                  ? "No records match your search criteria. Try different keywords."
                  : selectedFarm !== "all"
                  ? `No data found for ${selectedFarm}`
                  : "No rosette stage data has been recorded yet."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((record) => (
              <Card
                key={record.id}
                className="group hover:shadow-lg transition-all duration-300 hover:border-primary/30 overflow-hidden"
              >
                <CardContent className="p-0">
                  {/* Header Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 line-clamp-1 capitalize">
                          {record.crop_name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Record #{record.id} • {record.field_name}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge
                          variant="outline"
                          className="bg-white/90 capitalize"
                        >
                          {record.field_name}
                        </Badge>

                        <Badge
                          className={getCropHealthColor(record.crop_health)}
                        >
                          {getCropHealthLabel(record.crop_health)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="space-y-4">
                      {/* Crop Height */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Scale className="h-4 w-4" />
                          <span className="text-sm">Crop Height</span>
                        </div>
                        <span
                          className={`font-bold ${getCropHeightColor(
                            record.crop_height
                          )}`}
                        >
                          {getCropHeightLabel(record.crop_height)}
                        </span>
                      </div>

                      {/* Fertilizer Type */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Package className="h-4 w-4" />
                          <span className="text-sm">Fertilizer</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">
                            {record.fertilizer_type || "None"}
                          </span>
                          {record.fertilizer_quantity_bags && (
                            <p className="text-xs text-gray-500">
                              {record.fertilizer_quantity_bags} bags
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Quick Status Indicators */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              Weeds Observed
                            </span>
                            {renderBooleanStatus(record.weeds_observed)}
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              Aphid Attack
                            </span>
                            {renderBooleanStatus(record.aphid_attack)}
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              Crop Stress
                            </span>
                            {renderBooleanStatus(record.crop_under_stress)}
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              Fertilizers Applied
                            </span>
                            {renderBooleanStatus(record.fertilizers_applied)}
                          </div>
                        </div>
                      </div>

                      {/* Recommendations Section in the card */}
                      <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <h4 className="text-sm font-medium text-amber-800 mb-2 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          Key Recommendations
                        </h4>
                        <div className="space-y-2">
                          {hasRecommendation(
                            record.recommendation_irrigation_fertilizers
                          ) && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                              <div className="text-xs">
                                <span className="font-medium text-gray-700">
                                  Fertilizer:
                                </span>
                                <span className="text-gray-600 ml-1">
                                  {record.recommendation_irrigation_fertilizers}
                                </span>
                              </div>
                            </div>
                          )}
                          {hasRecommendation(
                            record.recommendation_sulphur_kumulus
                          ) && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0"></div>
                              <div className="text-xs">
                                <span className="font-medium text-gray-700">
                                  Sulphur:
                                </span>
                                <span className="text-gray-600 ml-1">
                                  {record.recommendation_sulphur_kumulus}
                                </span>
                              </div>
                            </div>
                          )}
                          {hasRecommendation(
                            record.recommendation_white_rust
                          ) && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                              <div className="text-xs">
                                <span className="font-medium text-gray-700">
                                  White Rust:
                                </span>
                                <span className="text-gray-600 ml-1">
                                  {record.recommendation_white_rust}
                                </span>
                              </div>
                            </div>
                          )}
                          {hasRecommendation(
                            record.recommendation_aphid_ulala
                          ) && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></div>
                              <div className="text-xs">
                                <span className="font-medium text-gray-700">
                                  Aphid Control:
                                </span>
                                <span className="text-gray-600 ml-1">
                                  {record.recommendation_aphid_ulala}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => openRecordDetails(record)}
                      variant="outline"
                      className="w-full mt-4 gap-2 group-hover:border-primary"
                    >
                      <Eye className="h-4 w-4" />
                      View Field Details
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Footer */}
                  <CardFooter className="border-t pt-4 flex justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(record.created_at)}</span>
                    </div>
                  </CardFooter>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedRecord && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                      <Wheat className="h-6 w-6 text-primary" />
                      {selectedRecord.crop_name} - {selectedRecord.field_name}
                    </DialogTitle>
                    <DialogDescription>
                      Complete rosette stage data for {selectedRecord.field_name}
                    </DialogDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      <Label>Farm Name</Label>
                      <p className="font-bold capitalize">
                        {selectedRecord.field_name}
                      </p>
                    </Badge>
                    <Badge
                      className={getCropHealthColor(selectedRecord.crop_health)}
                    >
                      {getCropHealthLabel(selectedRecord.crop_health)}
                    </Badge>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sprout className="h-5 w-5 text-green-600" />
                        Crop Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-muted-foreground">
                            Field Number
                          </Label>
                          <p className="font-bold text-lg">
                            #{selectedRecord.field}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">
                            Crop Height
                          </Label>
                          <p
                            className={`font-bold text-lg ${getCropHeightColor(
                              selectedRecord.crop_height
                            )}`}
                          >
                            {getCropHeightLabel(selectedRecord.crop_height)}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">
                            Crop Health
                          </Label>
                          <Badge
                            className={getCropHealthColor(
                              selectedRecord.crop_health
                            )}
                          >
                            {getCropHealthLabel(selectedRecord.crop_health)}
                          </Badge>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Crop Under Stress</span>
                          {renderBooleanStatus(
                            selectedRecord.crop_under_stress
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Weeds Observed</span>
                          {renderBooleanStatus(selectedRecord.weeds_observed)}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Aphid Attack</span>
                          {renderBooleanStatus(selectedRecord.aphid_attack)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-amber-600" />
                        Field Applications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">
                          Fertilizer
                        </Label>
                        <div className="bg-gray-50 p-3 rounded-lg mt-1">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              {selectedRecord.fertilizer_type || "None"}
                            </span>
                            {selectedRecord.fertilizer_quantity_bags && (
                              <Badge variant="outline">
                                {selectedRecord.fertilizer_quantity_bags} bags
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Applied:{" "}
                            {selectedRecord.fertilizers_applied ? "Yes" : "No"}
                          </p>
                        </div>
                      </div>

                      {selectedRecord.post_emergent_applied && (
                        <div>
                          <Label className="text-sm text-muted-foreground">
                            Post Emergent
                          </Label>
                          <div className="bg-green-50 p-3 rounded-lg mt-1">
                            <p className="font-medium">
                              {selectedRecord.post_emergent_product}
                            </p>
                            {selectedRecord.post_emergent_other_text && (
                              <p className="text-xs text-gray-600 mt-1">
                                {selectedRecord.post_emergent_other_text}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Chemicals & Treatments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bug className="h-5 w-5 text-red-600" />
                      Field Chemicals & Treatments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Sulphur Application */}
                      <div>
                        <Label className="font-medium text-gray-700 mb-2">
                          Sulphur Application
                        </Label>
                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div>
                            <span className="font-medium">
                              {selectedRecord.sulphur_product || "None"}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              Applied:{" "}
                              {selectedRecord.sulphur_applied ? "Yes" : "No"}
                            </p>
                          </div>
                          {selectedRecord.sulphur_other_text && (
                            <Badge variant="outline">
                              Note: {selectedRecord.sulphur_other_text}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Amino Application */}
                      <div>
                        <Label className="font-medium text-gray-700 mb-2">
                          Amino Application
                        </Label>
                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div>
                            <span className="font-medium">
                              {selectedRecord.amino_product || "None"}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              Applied:{" "}
                              {selectedRecord.amino_applied ? "Yes" : "No"}
                            </p>
                          </div>
                          {selectedRecord.amino_other_text && (
                            <Badge variant="outline">
                              Note: {selectedRecord.amino_other_text}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Aphid Pesticide */}
                      {selectedRecord.aphid_attack && (
                        <div>
                          <Label className="font-medium text-gray-700 mb-2">
                            Aphid Control
                          </Label>
                          <div className="bg-red-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-red-700">
                                {selectedRecord.aphid_pesticide}
                              </span>
                              <Badge variant="destructive">Urgent</Badge>
                            </div>
                            {selectedRecord.aphid_other_text && (
                              <p className="text-xs text-gray-600 mt-1">
                                {selectedRecord.aphid_other_text}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-blue-600" />
                      Field Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div
                        className={`p-3 rounded-lg ${
                          hasRecommendation(
                            selectedRecord.recommendation_irrigation_fertilizers
                          )
                            ? "bg-green-50 border border-green-200"
                            : "bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Package
                            className={`h-4 w-4 ${
                              hasRecommendation(
                                selectedRecord.recommendation_irrigation_fertilizers
                              )
                                ? "text-green-600"
                                : "text-gray-400"
                            }`}
                          />
                          <span className="text-sm font-medium text-gray-700">
                            Fertilizer
                          </span>
                        </div>
                        <p
                          className={`text-sm ${
                            hasRecommendation(
                              selectedRecord.recommendation_irrigation_fertilizers
                            )
                              ? "text-green-700 font-medium"
                              : "text-gray-500"
                          }`}
                        >
                          {selectedRecord.recommendation_irrigation_fertilizers ||
                            "N/A"}
                        </p>
                      </div>

                      <div
                        className={`p-3 rounded-lg ${
                          hasRecommendation(
                            selectedRecord.recommendation_sulphur_kumulus
                          )
                            ? "bg-yellow-50 border border-yellow-200"
                            : "bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Thermometer
                            className={`h-4 w-4 ${
                              hasRecommendation(
                                selectedRecord.recommendation_sulphur_kumulus
                              )
                                ? "text-yellow-600"
                                : "text-gray-400"
                            }`}
                          />
                          <span className="text-sm font-medium text-gray-700">
                            Sulphur
                          </span>
                        </div>
                        <p
                          className={`text-sm ${
                            hasRecommendation(
                              selectedRecord.recommendation_sulphur_kumulus
                            )
                              ? "text-yellow-700 font-medium"
                              : "text-gray-500"
                          }`}
                        >
                          {selectedRecord.recommendation_sulphur_kumulus ||
                            "N/A"}
                        </p>
                      </div>

                      <div
                        className={`p-3 rounded-lg ${
                          hasRecommendation(
                            selectedRecord.recommendation_white_rust
                          )
                            ? "bg-blue-50 border border-blue-200"
                            : "bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <AlertCircle
                            className={`h-4 w-4 ${
                              hasRecommendation(
                                selectedRecord.recommendation_white_rust
                              )
                                ? "text-blue-600"
                                : "text-gray-400"
                            }`}
                          />
                          <span className="text-sm font-medium text-gray-700">
                            White Rust
                          </span>
                        </div>
                        <p
                          className={`text-sm ${
                            hasRecommendation(
                              selectedRecord.recommendation_white_rust
                            )
                              ? "text-blue-700 font-medium"
                              : "text-gray-500"
                          }`}
                        >
                          {selectedRecord.recommendation_white_rust || "N/A"}
                        </p>
                      </div>

                      <div
                        className={`p-3 rounded-lg ${
                          hasRecommendation(
                            selectedRecord.recommendation_aphid_ulala
                          )
                            ? "bg-red-50 border border-red-200"
                            : "bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Bug
                            className={`h-4 w-4 ${
                              hasRecommendation(
                                selectedRecord.recommendation_aphid_ulala
                              )
                                ? "text-red-600"
                                : "text-gray-400"
                            }`}
                          />
                          <span className="text-sm font-medium text-gray-700">
                            Aphid Control
                          </span>
                        </div>
                        <p
                          className={`text-sm ${
                            hasRecommendation(
                              selectedRecord.recommendation_aphid_ulala
                            )
                              ? "text-red-700 font-medium"
                              : "text-gray-500"
                          }`}
                        >
                          {selectedRecord.recommendation_aphid_ulala || "N/A"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDetailModalOpen(false)}
                  >
                    Close
                  </Button>
                  <Button>Export Field Report</Button>
                </DialogFooter>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
