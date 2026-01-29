"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
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
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
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
  CheckCircle,
  AlertCircle,
  Calendar,
  Package,
  Sprout,
  Droplet,
  Leaf,
  ChevronRight,
  Eye,
  Filter,
  Search,
  Download,
  BarChart3,
  User,
  Wheat,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

interface RecommendationDetail {
  id: number;
  crop_name: string;
  sowing_date: string;
  seed_variety: string;
  seed_treatment: string;
  sowing_method: string;
  soil_conditioner: string;
  basal_fertilizer: string;
  pre_emergent_weedicide: string;
  first_irrigation: string;
  created_at: string;
  farmer_name: string;
  field_name: string;
}

interface AppliedRecommendation {
  id: number;
  recommendation_details: RecommendationDetail;
  effectiveness_display: string;
  visit_details: string;
  applied_date: string;
  farmer_feedback: string;
  effectiveness: string;
  visit: number;
  recommendation: number;
}

export default function RecommendationPage() {
  const [recommendations, setRecommendations] = useState<
    AppliedRecommendation[]
  >([]);
  const [filteredData, setFilteredData] = useState<AppliedRecommendation[]>([]);
  const [selectedRecord, setSelectedRecord] =
    useState<AppliedRecommendation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterField, setFilterField] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");

  // Stats calculation
  const totalRecords = recommendations.length;
  const goodEffectiveness = recommendations.filter(
    (record) => record.effectiveness === "good"
  ).length;
  const fairEffectiveness = recommendations.filter(
    (record) => record.effectiveness === "fair"
  ).length;
  const poorEffectiveness = recommendations.filter(
    (record) => record.effectiveness === "poor"
  ).length;

  // Unique fields
  const uniqueFields = Array.from(
    new Set(
      recommendations.map((record) => record.recommendation_details.field_name)
    )
  ).map((fieldName) => ({
    id: fieldName,
    name: fieldName,
  }));

  useEffect(() => {
    fetchRecommendations();
  }, []);

  // Filter data based on search and filter
  useEffect(() => {
    let results = [...recommendations];

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (record) =>
          record.recommendation_details.crop_name
            .toLowerCase()
            .includes(query) ||
          record.recommendation_details.seed_variety
            .toLowerCase()
            .includes(query) ||
          record.recommendation_details.seed_treatment
            .toLowerCase()
            .includes(query)
      );
    }

    // Apply field filter
    if (filterField !== "all") {
      results = results.filter(
        (record) => record.recommendation_details.field_name === filterField
      );
    }

    // Apply tab filter
    if (activeTab === "good") {
      results = results.filter((record) => record.effectiveness === "good");
    } else if (activeTab === "fair") {
      results = results.filter((record) => record.effectiveness === "fair");
    } else if (activeTab === "poor") {
      results = results.filter((record) => record.effectiveness === "poor");
    }

    setFilteredData(results);
  }, [searchQuery, filterField, activeTab, recommendations]);

  const fetchRecommendations = async () => {
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
        "https://rda.ngrok.app/api/recommendations/applied/",
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
      console.log("Fetched applied recommendations:", data);
      setRecommendations(data.results || []);
      setFilteredData(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      console.error("Error fetching recommendations:", err);
    } finally {
      setLoading(false);
    }
  };

  const getEffectivenessColor = (effectiveness: string) => {
    switch (effectiveness.toLowerCase()) {
      case "good":
        return "bg-green-100 text-green-800";
      case "fair":
        return "bg-yellow-100 text-yellow-800";
      case "poor":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEffectivenessIcon = (effectiveness: string) => {
    switch (effectiveness.toLowerCase()) {
      case "good":
        return <ThumbsUp className="h-4 w-4" />;
      case "fair":
        return <AlertCircle className="h-4 w-4" />;
      case "poor":
        return <ThumbsDown className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getSowingDateColor = (date: string) => {
    switch (date.toLowerCase()) {
      case "normal":
        return "text-green-600";
      case "early":
        return "text-blue-600";
      case "late":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  // Function to render each card
  const renderCard = (record: AppliedRecommendation) => (
    <Card
      key={record.id}
      className="group hover:shadow-lg transition-all duration-300 hover:border-primary/30 overflow-hidden"
    >
      <CardContent className="p-0">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-5">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-gray-900 line-clamp-1 capitalize">
                {record.recommendation_details.crop_name}
              </h3>
              <p className="text-sm text-gray-600 mt-1 capitalize">
                {record.recommendation_details.farmer_name} •{" "}
                {record.recommendation_details.field_name}
              </p>
            </div>
            <Badge className={getEffectivenessColor(record.effectiveness)}>
              <div className="flex items-center gap-1">
                {getEffectivenessIcon(record.effectiveness)}
                {record.effectiveness_display}
              </div>
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="space-y-4">
            {/* Key Information Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Sowing Date</span>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {record.recommendation_details.sowing_date}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Wheat className="h-4 w-4" />
                    <span className="text-sm">Seed Variety</span>
                  </div>
                  <span className="font-medium text-sm text-right capitalize">
                    {record.recommendation_details.seed_variety.replace(
                      "_",
                      " "
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Treatment Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Package className="h-4 w-4" />
                  <span className="text-sm">Seed Treatment</span>
                </div>
                <Badge variant="outline" className="capitalize">
                  {record.recommendation_details.seed_treatment}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Leaf className="h-4 w-4" />
                  <span className="text-sm">Soil Conditioner</span>
                </div>
                <Badge variant="outline" className="capitalize">
                  {record.recommendation_details.soil_conditioner}
                </Badge>
              </div>
            </div>

            {/* Quick Status Indicators */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Basal Fertilizer
                  </span>
                  <span className="font-medium text-sm capitalize">
                    {record.recommendation_details.basal_fertilizer}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sowing Method</span>
                  <span className="font-medium text-sm capitalize">
                    {record.recommendation_details.sowing_method}
                  </span>
                </div>
              </div>
            </div>

            {/* Farmer Feedback Summary */}
            {record.farmer_feedback && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-800 mb-1 flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Farmer Feedback
                </h4>
                <p className="text-sm text-blue-700 line-clamp-2">
                  {record.farmer_feedback}
                </p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <Button
            onClick={() => {
              setSelectedRecord(record);
              setIsDetailModalOpen(true);
            }}
            variant="outline"
            className="w-full mt-4 gap-2 group-hover:border-primary"
          >
            <Eye className="h-4 w-4" />
            View Full Details
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Footer */}
        <CardFooter className="border-t pt-4 flex justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Applied: {formatDate(record.applied_date)}</span>
          </div>
        </CardFooter>
      </CardContent>
    </Card>
  );

  // Function to render detail modal content
  const renderDetailModal = () => {
    if (!selectedRecord) return null;

    const details = selectedRecord.recommendation_details;

    return (
      <>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-primary" />
                Applied Recommendation #{selectedRecord.id}
              </DialogTitle>
              <DialogDescription className="capitalize">
                {details.farmer_name} • {details.field_name}
              </DialogDescription>
            </div>
            <Badge
              className={getEffectivenessColor(selectedRecord.effectiveness)}
            >
              <div className="flex items-center gap-1">
                {getEffectivenessIcon(selectedRecord.effectiveness)}
                {selectedRecord.effectiveness_display}
              </div>
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sprout className="h-5 w-5 text-green-600" />
                  Crop & Sowing Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Crop Name
                    </Label>
                    <p className="font-medium capitalize">
                      {details.crop_name}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Farmer
                    </Label>
                    <p className="font-medium capitalize">
                      {details.farmer_name}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Farm Name
                    </Label>
                    <p className="font-medium capitalize">
                      {details.field_name}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Sowing Date
                    </Label>
                    <Badge
                      className={`capitalize ${getSowingDateColor(
                        details.sowing_date
                      )}`}
                    >
                      {details.sowing_date}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Sowing Method
                    </Label>
                    <p className="font-medium capitalize">
                      {details.sowing_method}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm text-muted-foreground mb-2">
                    Seed Details
                  </Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">Variety</span>
                      <span className="font-medium capitalize">
                        {details.seed_variety.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">Treatment</span>
                      <span className="font-medium capitalize">
                        {details.seed_treatment}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-amber-600" />
                  Soil & Fertilizer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="font-medium text-gray-700 mb-2">
                    Soil Conditioner
                  </Label>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="font-medium capitalize">
                      {details.soil_conditioner}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="font-medium text-gray-700 mb-2">
                    Basal Fertilizer
                  </Label>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="font-medium capitalize">
                      {details.basal_fertilizer}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="font-medium text-gray-700 mb-2">
                    Pre-emergent Weedicide
                  </Label>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="font-medium capitalize">
                      {details.pre_emergent_weedicide}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Irrigation & Application */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplet className="h-5 w-5 text-blue-600" />
                Irrigation & Application Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="font-medium text-gray-700 mb-2">
                      First Irrigation
                    </Label>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium capitalize">
                          {details.first_irrigation}
                        </span>
                        <Badge
                          variant={
                            details.first_irrigation === "yes"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {details.first_irrigation === "yes"
                            ? "Applied"
                            : "Not Applied"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="font-medium text-gray-700 mb-2">
                      Applied Date
                    </Label>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {formatDate(selectedRecord.applied_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="font-medium text-gray-700 mb-2">
                      Visit Details
                    </Label>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">
                          Visit #{selectedRecord.visit}
                        </span>
                        <Badge variant="outline">
                          {selectedRecord.visit_details}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="font-medium text-gray-700 mb-2">
                      Effectiveness
                    </Label>
                    <div
                      className={`p-3 rounded-lg ${getEffectivenessColor(
                        selectedRecord.effectiveness
                      )}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getEffectivenessIcon(selectedRecord.effectiveness)}
                          <span className="font-bold">
                            {selectedRecord.effectiveness_display}
                          </span>
                        </div>
                        <Badge variant="outline" className="bg-white">
                          {selectedRecord.effectiveness}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Farmer Feedback */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-purple-600" />
                Farmer Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <User className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium text-blue-800 mb-1">
                      Feedback from Farmer
                    </p>
                    <p className="text-gray-700">
                      {selectedRecord.farmer_feedback}
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                      Recorded on {formatDate(selectedRecord.applied_date)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendation Created Date */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-600" />
                Timeline Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium text-gray-700 mb-2">
                    Recommendation Created
                  </Label>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{formatDate(details.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="font-medium text-gray-700 mb-2">
                    Recommendation ID
                  </Label>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">#{details.id}</span>
                      <Badge variant="outline">Original</Badge>
                    </div>
                  </div>
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
            <Button>Export Report</Button>
          </DialogFooter>
        </div>
      </>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto">
            <div className="p-6 md:p-8 max-w-7xl mx-auto">
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
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto">
            <div className="p-6 md:p-8 max-w-7xl mx-auto">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-red-500">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                    <p className="text-lg font-semibold">Error Loading Data</p>
                    <p className="text-sm mt-2">{error}</p>
                    <Button onClick={fetchRecommendations} className="mt-4">
                      Retry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="space-y-8">
              {/* Header Section */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Applied Recommendations
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Track and review recommendations applied to farms with
                    effectiveness feedback
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button size="sm" onClick={fetchRecommendations}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-700">
                          Total Applied
                        </p>
                        <h3 className="text-2xl font-bold text-purple-900 mt-2">
                          {totalRecords}
                        </h3>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-purple-200 flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-purple-700" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-700">
                          Good Effectiveness
                        </p>
                        <h3 className="text-2xl font-bold text-green-900 mt-2">
                          {goodEffectiveness}
                        </h3>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-green-200 flex items-center justify-center">
                        <ThumbsUp className="h-6 w-6 text-green-700" />
                      </div>
                    </div>
                    <p className="text-xs text-green-600 mt-2">
                      {totalRecords > 0
                        ? ((goodEffectiveness / totalRecords) * 100).toFixed(1)
                        : 0}
                      % of total
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-yellow-700">
                          Fair Effectiveness
                        </p>
                        <h3 className="text-2xl font-bold text-yellow-900 mt-2">
                          {fairEffectiveness}
                        </h3>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-yellow-200 flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-yellow-700" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-700">
                          Poor Effectiveness
                        </p>
                        <h3 className="text-2xl font-bold text-red-900 mt-2">
                          {poorEffectiveness}
                        </h3>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-red-200 flex items-center justify-center">
                        <ThumbsDown className="h-6 w-6 text-red-700" />
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
                          placeholder="Search by crop name, seed variety, or treatment..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 w-full lg:w-[400px]"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <Select
                          value={filterField}
                          onValueChange={setFilterField}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by farm name" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Fields</SelectItem>
                            {uniqueFields.map((field) => (
                              <SelectItem
                                key={field.id}
                                value={field.id}
                                className="capitalize"
                              >
                                {field.name}
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
                          <TabsTrigger value="all">All</TabsTrigger>
                          <TabsTrigger value="good">Good</TabsTrigger>
                          <TabsTrigger value="fair">Fair</TabsTrigger>
                          <TabsTrigger value="poor">Poor</TabsTrigger>
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
                    Applied Recommendations
                    <span className="text-muted-foreground font-normal ml-2">
                      ({filteredData.length}{" "}
                      {filteredData.length === 1 ? "record" : "records"})
                    </span>
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Sorted by latest applied date
                  </p>
                </div>

                {filteredData.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        No applied recommendations found
                      </h3>
                      <p className="text-gray-500 max-w-sm mx-auto">
                        {searchQuery
                          ? "No records match your search criteria. Try different keywords."
                          : "No recommendations have been applied yet."}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredData.map(renderCard)}
                  </div>
                )}
              </div>

              {/* Detail Modal */}
              <Dialog
                open={isDetailModalOpen}
                onOpenChange={setIsDetailModalOpen}
              >
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  {renderDetailModal()}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
