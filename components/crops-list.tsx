"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sprout,
  Filter,
  Search,
  TrendingUp,
  Calendar,
  Droplets,
  Scale,
  Wheat,
  ChevronRight,
  BarChart3,
  Package,
  Eye,
  Leaf,
  Crop,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

type CropHistory = {
  id: number;
  field: number;
  field_name: string;
  farmer_name: string;
  crop_name: string;
  crop_rotation_pattern: string;
  cultivated_area_last_year: number;
  planned_area_this_year: number;
  variety_cultivated: string;
  average_yield: number;
  planting_date?: string;
  harvest_date?: string;
  crop_type?: string;
};

export function CropsList() {
  const [allHistory, setAllHistory] = useState<CropHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<CropHistory[]>([]);
  const [selectedField, setSelectedField] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Fetch crop history
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("authToken")
          : null;

      if (!token) return;

      try {
        const res = await fetch(
          "https://rda.ngrok.app/api/crop-history/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        const data = await res.json();
        console.log(data, "crop data");

        const history = Array.isArray(data)
          ? data
          : data.results || data.data || [];

        setAllHistory(history);
        setFilteredHistory(history);
      } catch (error) {
        console.error("Error fetching crop history:", error);
        setAllHistory([]);
        setFilteredHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Unique fields
  const uniqueFields = Array.from(
    new Map(
      allHistory.map((item) => [
        item.field.toString(),
        { id: item.field.toString(), name: item.farmer_name },
      ])
    ).values()
  );

  // Calculate stats
  const totalCrops = allHistory.length;
  const totalAreaLastYear = allHistory.reduce(
    (sum, item) => sum + item.cultivated_area_last_year,
    0
  );
  const totalPlannedArea = allHistory.reduce(
    (sum, item) => sum + item.planned_area_this_year,
    0
  );
  const uniqueFarmers = [...new Set(allHistory.map((item) => item.farmer_name))]
    .length;
  const averageYield =
    allHistory.length > 0
      ? allHistory.reduce((sum, item) => sum + item.average_yield, 0) /
        allHistory.length
      : 0;

  // Apply filters
  useEffect(() => {
    let results = [...allHistory];

    // Apply field filter
    if (selectedField !== "all") {
      results = results.filter(
        (item) => item.field.toString() === selectedField
      );
    }

    // Apply tab filter
    if (activeTab === "high-yield") {
      results = results.filter((item) => item.average_yield > 50);
    } else if (activeTab === "increased") {
      results = results.filter(
        (item) => item.planned_area_this_year > item.cultivated_area_last_year
      );
    }

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (item) =>
          item.crop_name.toLowerCase().includes(query) ||
          item.farmer_name.toLowerCase().includes(query) ||
          item.variety_cultivated.toLowerCase().includes(query)
      );
    }

    setFilteredHistory(results);
  }, [selectedField, searchQuery, activeTab, allHistory]);

  const getRotationColor = (pattern: string) => {
    const colors: Record<string, string> = {
      monocropping: "bg-red-100 text-red-800",
      "crop rotation": "bg-green-100 text-green-800",
      intercropping: "bg-blue-100 text-blue-800",
      "mixed cropping": "bg-purple-100 text-purple-800",
      "sequential cropping": "bg-amber-100 text-amber-800",
    };
    return colors[pattern.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const getCropColor = (crop: string) => {
    const colors: Record<string, string> = {
      wheat: "bg-yellow-100 text-yellow-800",
      raya: "bg-blue-100 text-blue-800",
      corn: "bg-green-100 text-green-800",
      soybean: "bg-brown-100 text-brown-800",
      cotton: "bg-white text-gray-800 border",
    };
    return colors[crop.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const getYieldColor = (yieldValue: number) => {
    if (yieldValue > 60) return "text-green-600";
    if (yieldValue > 40) return "text-amber-600";
    return "text-red-600";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Package className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button size="sm">
            <Sprout className="h-4 w-4 mr-2" />
            Add New Crop
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
                  Total Crops Tracked
                </p>
                <h3 className="text-2xl font-bold text-green-900 mt-2">
                  {totalCrops}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-200 flex items-center justify-center">
                <Leaf className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">
                  Area Increase
                </p>
                <h3 className="text-2xl font-bold text-blue-900 mt-2">
                  {totalPlannedArea > totalAreaLastYear ? "+" : ""}
                  {(totalPlannedArea - totalAreaLastYear).toFixed(1)} acres
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-200 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-700" />
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2">Planned vs Last Year</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700">
                  Average Yield
                </p>
                <h3 className="text-2xl font-bold text-amber-900 mt-2">
                  {averageYield.toFixed(1)}
                </h3>
                <p className="text-xs text-amber-600 mt-1">tons per acre</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-200 flex items-center justify-center">
                <Scale className="h-6 w-6 text-amber-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">
                  Farmers Tracked
                </p>
                <h3 className="text-2xl font-bold text-purple-900 mt-2">
                  {uniqueFarmers}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-200 flex items-center justify-center">
                <User className="h-6 w-6 text-purple-700" />
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
                  placeholder="Search crops by name, farmer, or variety..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full lg:w-[400px]"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedField} onValueChange={setSelectedField}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Farmer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        All Farmers
                      </div>
                    </SelectItem>
                    {uniqueFields.map((field) => (
                      <SelectItem key={field.id} value={field.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {field.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-auto"
              >
                <TabsList>
                  <TabsTrigger value="all">All Crops</TabsTrigger>
                  <TabsTrigger value="high-yield">High Yield</TabsTrigger>
                  <TabsTrigger value="increased">Area Increase</TabsTrigger>
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
            {selectedField === "all"
              ? "All Crop Records"
              : "Selected Farmer Crops"}
            <span className="text-muted-foreground font-normal ml-2">
              ({filteredHistory.length}{" "}
              {filteredHistory.length === 1 ? "record" : "records"})
            </span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Sorted by latest planting
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredHistory.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Sprout className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No crop records found
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                {searchQuery
                  ? "No crops match your search criteria. Try different keywords."
                  : "No crop history has been recorded yet. Start by adding crop data."}
              </p>
              {!searchQuery && (
                <Button className="mt-4">
                  <Sprout className="h-4 w-4 mr-2" />
                  Add First Crop Record
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item) => {
              const areaChange =
                item.planned_area_this_year - item.cultivated_area_last_year;
              const changePercentage =
                item.cultivated_area_last_year > 0
                  ? (areaChange / item.cultivated_area_last_year) * 100
                  : 100;

              return (
                <Card
                  key={item.id}
                  className="group hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-green-500"
                >
                  <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Left Section - Main Info */}
                      <div className="flex-1">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <div
                                className={`h-10 w-10 rounded-full ${getCropColor(
                                  item.crop_name
                                )} flex items-center justify-center`}
                              >
                                <Wheat className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold group-hover:text-green-600 transition-colors capitalize">
                                  {item.crop_name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <Badge
                                    variant="outline"
                                    className="text-xs capitalize"
                                  >
                                    <User className="h-3 w-3 mr-1" />
                                    {item.farmer_name}
                                  </Badge>

                                  <Badge
                                    variant="secondary"
                                    className="text-xs capitalize"
                                  >
                                    {item.field_name}
                                  </Badge>

                                  <Badge
                                    className={`text-xs ${getRotationColor(
                                      item.crop_rotation_pattern
                                    )}`}
                                  >
                                    {item.crop_rotation_pattern}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Variety and Yield */}
                            <div className="flex items-center gap-6 mt-4">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <Crop className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Variety
                                  </p>
                                  <p className="font-medium text-sm">
                                    {item.variety_cultivated}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                                  <Scale className="h-4 w-4 text-amber-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Average Yield
                                  </p>
                                  <p
                                    className={`font-bold text-sm ${getYieldColor(
                                      item.average_yield
                                    )}`}
                                  >
                                    {item.average_yield} tons/acre
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Area Change Indicator */}
                          <div className="lg:text-right">
                            <div
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                areaChange > 0
                                  ? "bg-green-100 text-green-800"
                                  : areaChange < 0
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              <TrendingUp
                                className={`h-4 w-4 mr-1 ${
                                  areaChange > 0
                                    ? "text-green-600"
                                    : areaChange < 0
                                    ? "text-red-600"
                                    : "text-gray-600"
                                }`}
                              />
                              {areaChange > 0 ? "+" : ""}
                              {areaChange.toFixed(1)} acres
                              <span className="ml-1">
                                ({changePercentage > 0 ? "+" : ""}
                                {changePercentage.toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Section - Area Details */}
                      <div className="lg:w-1/3">
                        <div className="space-y-4">
                          {/* Area Comparison */}
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-muted-foreground">
                                Area Comparison
                              </span>
                              <span className="font-medium">
                                {changePercentage.toFixed(1)}% change
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">Last Year</span>
                                </div>
                                <span className="font-semibold">
                                  {item.cultivated_area_last_year} acres
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-green-600" />
                                  <span className="text-sm">
                                    Planned This Year
                                  </span>
                                </div>
                                <span className="font-bold text-green-600">
                                  {item.planned_area_this_year} acres
                                </span>
                              </div>
                            </div>
                            <Progress
                              value={
                                (item.planned_area_this_year /
                                  (item.cultivated_area_last_year +
                                    item.planned_area_this_year)) *
                                100
                              }
                              className="mt-2 h-2"
                            />
                          </div>

                          {/* Action Button */}
                          {/* <div className="pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full gap-2"
                            >
                              <BarChart3 className="h-4 w-4" />
                              View Detailed Analytics
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div> */}
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    {(item.planting_date || item.harvest_date) && (
                      <div className="mt-6 pt-6 border-t">
                        <div className="flex flex-wrap gap-4">
                          {item.planting_date && (
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                                <Sprout className="h-3 w-3 text-green-600" />
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Planting Date
                                </p>
                                <p className="text-sm font-medium">
                                  {formatDate(item.planting_date)}
                                </p>
                              </div>
                            </div>
                          )}
                          {item.harvest_date && (
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center">
                                <Package className="h-3 w-3 text-amber-600" />
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Harvest Date
                                </p>
                                <p className="text-sm font-medium">
                                  {formatDate(item.harvest_date)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
