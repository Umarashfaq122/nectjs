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
  Leaf,
  Bug,
  AlertCircle,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  ChevronRight,
  Eye,
  Filter,
  Search,
  Download,
  BarChart3,
  Calendar,
  Wheat,
  Droplet,
  Thermometer,
  Package,
  Sprout,
  Tractor,
  Beaker,
  CloudRain,
  Droplets as DropletsIcon,
  Shield,
  CircleAlert,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface DrillSowingData {
  drill_sowing?: boolean;
  drill_done?: boolean;
  irrigation_within_week?: boolean;
  [key: string]: any;
}

interface FertilizerRecommendation {
  product?: string;
  name?: string;
  fertilizer_name?: string;
  type?: string;
  dosage?: string;
  [key: string]: any;
}

interface BioStimulant {
  [key: string]: any;
}

interface ReasonItem {
  label: string;
  value: string;
}

interface GerminationData {
  percentage: string;
  reason: ReasonItem[];
}

interface WeedMonitoringData {
  id: number;
  crop_name: string;
  crop_health: string;
  farm: number | null;
  leave_observations: boolean;
  other_issues_text: string | null;
  post_emergent_weedicide_applied: string | null;
  weed_cover_percentage: string;
  weed_cover_percentage_display: string;
  weed_photo: string | null;
  weed_type: string;
  weedicide_product: string;
  weeds_present: boolean;
  yellowing_cause: string[];
  yellowing_cause_display: string[];
  yellowing_sub_cause?: {
    // Make this optional
    water_stress?: string[];
    nutrient_deficiency?: string[];
    [key: string]: any;
  };
  yellowing_sub_cause_display: string[];
  farm_name: string;

  // New fields from your data
  germination_per: string;
  drill_sowing: DrillSowingData | DrillSowingData[] | boolean | null;
  fer_rec: FertilizerRecommendation[];
  bio_stimulant: BioStimulant[];
}

export function EmergenceForm() {
  const [weedData, setWeedData] = useState<WeedMonitoringData[]>([]);
  const [filteredData, setFilteredData] = useState<WeedMonitoringData[]>([]);
  const [selectedRecord, setSelectedRecord] =
    useState<WeedMonitoringData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterField, setFilterField] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");

  const API_BASE_URL = "https://rda.ngrok.app";

  // Parse germination percentage - MOVED BEFORE USE
  // Parse germination percentage - FIXED VERSION
  const parseGerminationPercentage = (
    germinationData: any,
  ): GerminationData => {
    try {
      if (!germinationData) {
        return { percentage: "N/A", reason: [] };
      }

      // Handle object format with value property
      if (typeof germinationData === "object" && germinationData !== null) {
        if (germinationData.value) {
          const valueStr = germinationData.value;
          const parts = valueStr.split("-");
          if (parts.length >= 2) {
            // Extract just the percentage range (e.g., "85-95%")
            const percentageRange = parts[0] + "-" + parts[1];
            const quality = parts.slice(2).join("-"); // Get quality part if exists

            return {
              percentage: percentageRange,
              reason: [
                {
                  label: "Germination Quality",
                  value: quality || "Good",
                },
              ],
            };
          }
        }

        // If it's an object but doesn't have value property, try to stringify
        if (germinationData.percentage) {
          return {
            percentage: germinationData.percentage,
            reason: germinationData.reason || [],
          };
        }
      }

      // Handle string format
      if (typeof germinationData === "string") {
        const cleanedString = germinationData.replace(/\\"/g, '"');

        // Check if it's a JSON string
        if (
          cleanedString.trim().startsWith("{") ||
          cleanedString.trim().startsWith("[")
        ) {
          try {
            const parsedData = JSON.parse(cleanedString);
            return {
              percentage: parsedData.percentage || parsedData.value || "N/A",
              reason: Array.isArray(parsedData.reason) ? parsedData.reason : [],
            };
          } catch (e) {
            // If JSON parsing fails, treat as direct percentage string
            return { percentage: cleanedString, reason: [] };
          }
        }

        // Handle the format "85-95%-Good"
        const match = cleanedString.match(/(\d+-\d+%)-?(.*)/);
        if (match) {
          return {
            percentage: match[1],
            reason: match[2]
              ? [
                  {
                    label: "Germination Quality",
                    value: match[2],
                  },
                ]
              : [],
          };
        }

        return { percentage: cleanedString, reason: [] };
      }

      console.log("Unhandled germination data format:", germinationData);
      return { percentage: "N/A", reason: [] };
    } catch (e) {
      console.error("Error parsing germination data:", e, germinationData);
      return { percentage: "N/A", reason: [] };
    }
  };

  // Also update the parse call in stats calculation to handle the object format
  const germinationStats = weedData.reduce(
    (stats, record) => {
      try {
        const germData = parseGerminationPercentage(record.germination_per);
        if (germData.percentage && germData.percentage !== "N/A") {
          // Extract numbers from percentage string like "85-95%"
          const match = germData.percentage.match(/(\d+)-(\d+)/);
          if (match) {
            const avg = (parseInt(match[1]) + parseInt(match[2])) / 2;
            stats.total += avg;
            stats.count++;
          }
        }
      } catch (e) {
        console.error(
          "Error processing germination data:",
          e,
          record.germination_per,
        );
      }
      return stats;
    },
    { total: 0, count: 0 },
  );

  // Get germination quality color
  // Get germination quality color - UPDATED
  const getGerminationQualityColor = (percentage: string) => {
    if (percentage === "N/A") return "text-gray-500";

    // Remove % symbol if present
    const cleanPercentage = percentage.replace("%", "");
    const rangeMatch = cleanPercentage.match(/(\d+)-(\d+)/);
    if (rangeMatch) {
      const avg = (parseInt(rangeMatch[1]) + parseInt(rangeMatch[2])) / 2;
      if (avg >= 80) return "text-green-600";
      if (avg >= 60) return "text-amber-600";
      return "text-red-600";
    }
    return "text-gray-500";
  };

  // Get germination quality badge
  const getGerminationQualityBadge = (percentage: string) => {
    if (percentage === "N/A") return null;

    const rangeMatch = percentage.match(/(\d+)-(\d+)/);
    if (rangeMatch) {
      const avg = (parseInt(rangeMatch[1]) + parseInt(rangeMatch[2])) / 2;
      if (avg >= 80) {
        return (
          <Badge className="bg-green-100 text-green-800 text-xs">
            Excellent
          </Badge>
        );
      } else if (avg >= 60) {
        return (
          <Badge className="bg-amber-100 text-amber-800 text-xs">
            Moderate
          </Badge>
        );
      } else {
        return <Badge className="bg-red-100 text-red-800 text-xs">Poor</Badge>;
      }
    }
    return null;
  };

  // Calculate germination progress value - UPDATED
  const calculateGerminationProgress = (percentage: string): number => {
    if (percentage === "N/A") return 0;

    // Remove % symbol if present
    const cleanPercentage = percentage.replace("%", "");
    const rangeMatch = cleanPercentage.match(/(\d+)-(\d+)/);
    if (rangeMatch) {
      const avg = (parseInt(rangeMatch[1]) + parseInt(rangeMatch[2])) / 2;
      return avg;
    }

    // Try to parse as single number
    const singleNumber = parseInt(cleanPercentage);
    if (!isNaN(singleNumber)) {
      return singleNumber;
    }

    return 0;
  };

  // Stats calculation - including new fields
  const totalRecords = weedData.length;
  // Update the stats calculation:
  const healthyCrops = weedData.filter(
    (record) => record.crop_health?.toLowerCase() === "healthy",
  ).length;
  const weedsPresentCount = weedData.filter(
    (record) => record.weeds_present,
  ).length;
  const yellowingIssuesCount = weedData.filter(
    (record) => record.yellowing_cause && record.yellowing_cause.length > 0,
  ).length;

  // Fix drill sowing count
  const drillSowingDoneCount = weedData.filter((record) => {
    if (!record.drill_sowing) return false;

    // Handle object case {drill_sowing: true}
    if (
      typeof record.drill_sowing === "object" &&
      record.drill_sowing !== null
    ) {
      if (Array.isArray(record.drill_sowing)) {
        // Array case
        return (
          record.drill_sowing[0]?.drill_done === true ||
          record.drill_sowing[0]?.drill_sowing === true
        );
      } else {
        // Object case
        return (
          record.drill_sowing.drill_sowing === true ||
          record.drill_sowing.drill_done === true
        );
      }
    }

    // Handle boolean case
    if (typeof record.drill_sowing === "boolean") {
      return record.drill_sowing === true;
    }

    return false;
  }).length;

  // Fix irrigation count
  const irrigationWithinWeekCount = weedData.filter((record) => {
    if (!record.drill_sowing) return false;

    if (
      typeof record.drill_sowing === "object" &&
      record.drill_sowing !== null
    ) {
      if (Array.isArray(record.drill_sowing)) {
        return record.drill_sowing[0]?.irrigation_within_week === true;
      } else {
        return record.drill_sowing.irrigation_within_week === true;
      }
    }

    return false;
  }).length;

  const averageGermination =
    germinationStats.count > 0
      ? germinationStats.total / germinationStats.count
      : 0;

  // Calculate germination quality distribution
  const germinationDistribution = weedData.reduce(
    (dist, record) => {
      try {
        const germData = parseGerminationPercentage(record.germination_per);
        if (germData.percentage) {
          const rangeMatch = germData.percentage.match(/(\d+)-(\d+)/);
          if (rangeMatch) {
            const avg = (parseInt(rangeMatch[1]) + parseInt(rangeMatch[2])) / 2;
            if (avg >= 80) dist.high++;
            else if (avg >= 60) dist.medium++;
            else dist.low++;
          }
        }
      } catch (e) {
        // Skip invalid data
      }
      return dist;
    },
    { high: 0, medium: 0, low: 0 },
  );

  // Unique fields
  const uniqueFields: string[] = Array.from(
    new Set(weedData.map((record) => record.farm_name || "Unknown Farm")),
  );

  useEffect(() => {
    fetchWeedData();
  }, []);

  // Filter data based on search and filter
  useEffect(() => {
    let results = [...weedData];

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (record) =>
          (record.crop_name?.toLowerCase() || "").includes(query) ||
          (record.crop_health?.toLowerCase() || "").includes(query) ||
          (record.weed_type?.toLowerCase() || "").includes(query) ||
          (record.farm_name?.toLowerCase() || "").includes(query),
      );
    }

    // Apply field filter
    if (filterField !== "all") {
      results = results.filter((record) => record.farm_name === filterField);
    }

    // Apply tab filter
    if (activeTab === "issues") {
      results = results.filter(
        (record) =>
          (record.yellowing_cause && record.yellowing_cause.length > 0) ||
          record.weeds_present,
      );
    } else if (activeTab === "healthy") {
      results = results.filter((record) => record.crop_health === "healthy");
    } else if (activeTab === "weeds") {
      results = results.filter((record) => record.weeds_present);
    }

    setFilteredData(results);
  }, [searchQuery, filterField, activeTab, weedData]);

  const fetchWeedData = async () => {
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
        "https://rda.ngrok.app/api/weed-monitoring/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched weed monitoring data:", data);
      console.log("Fertilizer data sample:", data.results?.[0]?.fer_rec);

      // Transform the data to include farm_name from farm field if needed
      const transformedData = (data.results || []).map((record: any) => ({
        ...record,
        farm_name: record.farm_name || `Farm #${record.farm || record.id}`,
      }));

      setWeedData(transformedData);
      setFilteredData(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      console.error("Error fetching weed monitoring data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fix image URLs
  const getFullImageUrl = (imagePath: string | null) => {
    if (!imagePath) return null;
    // Check if it's already a full URL
    if (imagePath.startsWith("http")) return imagePath;
    // Handle both absolute and relative paths
    if (imagePath.startsWith("/")) {
      return `${API_BASE_URL}${imagePath}`;
    }
    return `${API_BASE_URL}/${imagePath}`;
  };

  const getCropHealthColor = (health: string) => {
    const healthLower = health?.toLowerCase();
    switch (healthLower) {
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

  const getWeedCoverColor = (percentage: string) => {
    const numericValue = parseInt(percentage.split("-")[0]) || 0;
    if (numericValue < 10) return "text-green-600";
    if (numericValue < 30) return "text-amber-600";
    return "text-red-600";
  };

  const getYellowingCauseBadges = (causes: string[]) => {
    if (!causes || !Array.isArray(causes)) return null;

    return causes.map((cause, index) => {
      let colorClass = "bg-gray-100 text-gray-800";
      let displayText = cause.replace(/_/g, " ");

      switch (cause) {
        case "nutrient_deficiency":
          colorClass = "bg-red-100 text-red-800";
          displayText = "Nutrient Deficiency";
          break;
        case "water_stress":
          colorClass = "bg-blue-100 text-blue-800";
          displayText = "Water Stress";
          break;
        case "disease":
          colorClass = "bg-purple-100 text-purple-800";
          displayText = "Disease";
          break;
        case "pest_damage":
          colorClass = "bg-orange-100 text-orange-800";
          displayText = "Pest Damage";
          break;
      }

      return (
        <Badge key={index} className={`text-xs ${colorClass}`}>
          {displayText}
        </Badge>
      );
    });
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

// Helper to render drill sowing info - UPDATED
const renderDrillSowingInfo = (drillSowing: any) => {
  if (!drillSowing) return null;

  // Handle object case {drill_sowing: true}
  if (typeof drillSowing === 'object' && drillSowing !== null) {
    if (Array.isArray(drillSowing) && drillSowing.length > 0) {
      // Array case
      const data = drillSowing[0];
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Drill Sowing Done</span>
            {renderBooleanStatus(data.drill_done || data.drill_sowing || false)}
          </div>
          {data.irrigation_within_week !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Irrigation Within Week</span>
              {renderBooleanStatus(data.irrigation_within_week)}
            </div>
          )}
        </div>
      );
    } else {
      // Single object case
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Drill Sowing Done</span>
            {renderBooleanStatus(drillSowing.drill_sowing || drillSowing.drill_done || false)}
          </div>
          {drillSowing.irrigation_within_week !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Irrigation Within Week</span>
              {renderBooleanStatus(drillSowing.irrigation_within_week)}
            </div>
          )}
        </div>
      );
    }
  }

  // Handle boolean case
  if (typeof drillSowing === 'boolean') {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Drill Sowing Done</span>
          {renderBooleanStatus(drillSowing)}
        </div>
      </div>
    );
  }

  return null;
};
  // Helper to render fertilizer recommendations - FIXED VERSION
  const renderFertilizerRecommendations = (
    ferRec: FertilizerRecommendation[],
  ) => {
    if (!ferRec || ferRec.length === 0) return null;

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 mb-1">
          Fertilizer Recommendations
        </Label>
        <div className="space-y-2">
          {ferRec.map((fertilizer, index) => {
            // Try different possible property names
            const fertilizerName =
              fertilizer.product ||
              fertilizer.name ||
              fertilizer.fertilizer_name ||
              `Fertilizer ${index + 1}`;

            const fertilizerType = fertilizer.type || "N/A";
            const dosage = fertilizer.dosage || "Standard dosage";

            return (
              <div
                key={index}
                className="bg-amber-50 p-3 rounded-lg border border-amber-200"
              >
                <div className="flex items-start gap-2">
                  <Beaker className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-amber-900 text-sm">
                          {fertilizerName}
                        </h4>
                        {fertilizerType !== "N/A" && (
                          <p className="text-xs text-amber-700 mt-0.5">
                            Type: {fertilizerType}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-amber-100 text-amber-800 text-xs"
                      >
                        Recommended
                      </Badge>
                    </div>
                    <p className="text-xs text-amber-600 mt-1">{dosage}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Helper to render bio stimulants
  const renderBioStimulants = (bioStimulant: BioStimulant[]) => {
    if (!bioStimulant || bioStimulant.length === 0) return null;

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 mb-1">
          Bio Stimulants
        </Label>
        <div className="space-y-2">
          {bioStimulant.map((stimulant, index) => (
            <div
              key={index}
              className="bg-green-50 p-3 rounded-lg border border-green-200"
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Bio Stimulant Applied
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render germination reasons
  const renderGerminationReasons = (reasons: ReasonItem[]) => {
    if (!reasons || reasons.length === 0) return null;

    return (
      <div className="mt-2 space-y-1">
        <p className="text-xs font-medium text-gray-700">Reasons:</p>
        <div className="flex flex-wrap gap-1">
          {reasons.map((reason, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {reason.label}
            </Badge>
          ))}
        </div>
      </div>
    );
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
            <Button onClick={fetchWeedData} className="mt-4">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Function to render each card
  const renderCard = (record: WeedMonitoringData) => {
    const weedImageUrl = getFullImageUrl(record.weed_photo);
    const germinationData = parseGerminationPercentage(record.germination_per);
    const germinationProgress = calculateGerminationProgress(
      germinationData.percentage,
    );
    const germinationQualityBadge = getGerminationQualityBadge(
      germinationData.percentage,
    );

    return (
      <Card
        key={record.id}
        className="group hover:shadow-lg transition-all duration-300 hover:border-primary/30 overflow-hidden"
      >
        <CardContent className="p-0">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-900 line-clamp-1 capitalize">
                  {record.crop_name || "Unknown Crop"}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Record #{record.id} • {record.farm_name || "Unknown Farm"}
                </p>
              </div>
              <Badge className={getCropHealthColor(record.crop_health)}>
                {record.crop_health || "Unknown"}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <div className="space-y-4">
              {/* Germination Percentage */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="text-sm font-medium">Germination</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold ${getGerminationQualityColor(germinationData.percentage)}`}
                    >
                      {germinationData.percentage}
                    </span>
                    {germinationQualityBadge}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0%</span>
                    <span>Germination</span>
                    <span>100%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        germinationProgress >= 80
                          ? "bg-green-500"
                          : germinationProgress >= 60
                            ? "bg-amber-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${germinationProgress}%` }}
                    />
                  </div>
                </div>

                {/* Reasons */}
                {renderGerminationReasons(germinationData.reason)}
              </div>

              {/* Drill Sowing Info */}
              {record.drill_sowing && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Tractor className="h-4 w-4" />
                    <span className="text-sm font-medium">Drill Sowing</span>
                  </div>
                  {renderDrillSowingInfo(record.drill_sowing)}
                </div>
              )}

              {/* Fertilizer Recommendations */}
              {record.fer_rec && record.fer_rec.length > 0 && (
                <div className="space-y-2">
                  {renderFertilizerRecommendations(record.fer_rec)}
                </div>
              )}

              {/* Bio Stimulants */}
              {record.bio_stimulant && record.bio_stimulant.length > 0 && (
                <div className="space-y-2">
                  {renderBioStimulants(record.bio_stimulant)}
                </div>
              )}

              {/* Yellowing Causes */}
              {record.yellowing_cause && record.yellowing_cause.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2">
                    Yellowing Causes
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {getYellowingCauseBadges(record.yellowing_cause)}
                  </div>
                </div>
              )}

              {/* Weed Information */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Leaf className="h-4 w-4" />
                    <span className="text-sm">Weed Presence</span>
                  </div>
                  {renderBooleanStatus(record.weeds_present)}
                </div>

                {record.weeds_present && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Weed Type</span>
                      <Badge variant="outline" className="capitalize">
                        {record.weed_type || "Unknown"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Cover Percentage
                      </span>
                      <span
                        className={`font-bold ${getWeedCoverColor(
                          record.weed_cover_percentage,
                        )}`}
                      >
                        {record.weed_cover_percentage_display || "N/A"}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Weedicide Application */}
              {record.post_emergent_weedicide_applied && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-800 mb-1 flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    Weedicide Applied
                  </h4>
                  <p className="text-sm">{record.weedicide_product || "N/A"}</p>
                </div>
              )}

              {/* Weed Photo Preview - FIXED IMAGE DISPLAY */}
              {weedImageUrl && (
                <div className="mt-4">
                  <Label className="text-sm font-medium text-gray-700 mb-2">
                    Weed Photo
                  </Label>
                  <div className="relative h-32 rounded-lg overflow-hidden bg-gray-100 border">
                    <img
                      src={weedImageUrl}
                      alt={`Weed photo for ${record.crop_name}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-full flex flex-col items-center justify-center">
                              <ImageIcon class="h-8 w-8 text-gray-300 mb-2" />
                              <p class="text-xs text-gray-400">Image unavailable</p>
                            </div>
                          `;
                        }
                      }}
                    />
                  </div>
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
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  record.crop_health === "healthy"
                    ? "bg-green-500"
                    : record.crop_health === "stressed"
                      ? "bg-red-500"
                      : "bg-gray-500"
                }`}
              ></div>
              <span>{record.farm_name || "Unknown Farm"}</span>
            </div>
            <div className="flex items-center gap-1">
              <span
                className={`text-xs ${getGerminationQualityColor(germinationData.percentage)}`}
              >
                {germinationData.percentage}
              </span>
            </div>
          </CardFooter>
        </CardContent>
      </Card>
    );
  };

  // Function to render detail modal content
  const renderDetailModal = () => {
    if (!selectedRecord) return null;

    const selectedWeedImageUrl = getFullImageUrl(selectedRecord.weed_photo);
    const germinationData = parseGerminationPercentage(
      selectedRecord.germination_per,
    );
    const germinationProgress = calculateGerminationProgress(
      germinationData.percentage,
    );

    return (
      <>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Wheat className="h-6 w-6 text-primary" />
                {selectedRecord.crop_name || "Unknown Crop"} —{" "}
                {selectedRecord.farm_name || "Unknown Farm"}
              </DialogTitle>
              <DialogDescription>
                Complete weed monitoring data • Record #{selectedRecord.id}
              </DialogDescription>
            </div>
            <Badge className={getCropHealthColor(selectedRecord.crop_health)}>
              {selectedRecord.crop_health || "Unknown"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Germination & Planting Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Germination Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Germination Percentage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-lg font-semibold text-gray-900">
                    Germination Percentage
                  </Label>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-2xl font-bold ${getGerminationQualityColor(germinationData.percentage)}`}
                    >
                      {germinationData.percentage}
                    </span>
                    {getGerminationQualityBadge(germinationData.percentage)}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>0%</span>
                    <span className="font-medium">Germination Progress</span>
                    <span>100%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        germinationProgress >= 80
                          ? "bg-green-500"
                          : germinationProgress >= 60
                            ? "bg-amber-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${germinationProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Reasons for Germination Level */}
              {germinationData.reason.length > 0 && (
                <div>
                  <Label className="font-medium text-gray-700 mb-3">
                    Factors Affecting Germination
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {germinationData.reason.map((reason, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-2">
                          <CircleAlert className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-gray-800">
                            {reason.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {reason.value === "seed"
                            ? "Issues related to seed quality, viability, or treatment"
                            : "Issues related to sowing depth, timing, or method"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Drill Sowing Details */}
              {selectedRecord.drill_sowing && (
                <div>
                  <Label className="font-medium text-gray-700 mb-3">
                    Drill Sowing Information
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Tractor className="h-5 w-5 text-blue-600" />
                          <span className="font-medium text-gray-800">
                            Drill Sowing Done
                          </span>
                        </div>
                        {(() => {
                          const ds = selectedRecord.drill_sowing;
                          if (typeof ds === "object" && ds !== null) {
                            if (Array.isArray(ds)) {
                              return renderBooleanStatus(
                                ds[0]?.drill_sowing ||
                                  ds[0]?.drill_done ||
                                  false,
                              );
                            } else {
                              return renderBooleanStatus(
                                ds.drill_sowing || ds.drill_done || false,
                              );
                            }
                          }
                          if (typeof ds === "boolean") {
                            return renderBooleanStatus(ds);
                          }
                          return renderBooleanStatus(false);
                        })()}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Drill sowing ensures uniform seed placement at optimal
                        depth for consistent germination.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inputs & Treatments Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fertilizer Recommendations - UPDATED */}
            {selectedRecord.fer_rec && selectedRecord.fer_rec.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Beaker className="h-5 w-5 text-amber-600" />
                    Fertilizer Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedRecord.fer_rec.map((fertilizer, index) => {
                      // Try different possible property names
                      const fertilizerName =
                        fertilizer.product ||
                        fertilizer.name ||
                        fertilizer.fertilizer_name ||
                        `Fertilizer ${index + 1}`;

                      const fertilizerType = fertilizer.type || "N/A";
                      const dosage = fertilizer.dosage || "Standard dosage";

                      return (
                        <div
                          key={index}
                          className="bg-amber-50 p-4 rounded-lg border border-amber-200"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-amber-100 rounded-lg">
                              <Beaker className="h-6 w-6 text-amber-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-amber-900">
                                  {fertilizerName}
                                </h4>
                                <Badge className="bg-amber-100 text-amber-800">
                                  Recommended
                                </Badge>
                              </div>
                              {fertilizerType !== "N/A" && (
                                <p className="text-sm text-amber-700 mb-2">
                                  Type:{" "}
                                  <span className="font-medium">
                                    {fertilizerType}
                                  </span>
                                </p>
                              )}
                              <p className="text-sm text-amber-600">
                                <span className="font-medium">Dosage:</span>{" "}
                                {dosage}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bio Stimulants */}
            {selectedRecord.bio_stimulant &&
              selectedRecord.bio_stimulant.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      Bio Stimulants
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Shield className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-green-900">
                            Bio Stimulant Applied
                          </h4>
                          <p className="text-sm text-green-700 mt-1">
                            Bio stimulants enhance plant growth, stress
                            resistance, and nutrient uptake
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>

          {/* Plant Health & Issues */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Yellowing Issues */}
            {/* Yellowing Issues */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  Yellowing Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedRecord.yellowing_cause &&
                selectedRecord.yellowing_cause.length > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="font-medium text-gray-700 mb-2">
                        Main Causes
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {getYellowingCauseBadges(
                          selectedRecord.yellowing_cause,
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No yellowing issues reported
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Weed Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="h-5 w-5 text-red-600" />
                  Weed Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Weed Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="font-medium text-gray-700 mb-2">
                          Weed Type
                        </Label>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <span className="font-medium capitalize">
                            {selectedRecord.weed_type || "Not specified"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <Label className="font-medium text-gray-700 mb-2">
                          Weed Cover
                        </Label>
                        <div
                          className={`p-3 rounded-lg font-bold text-sm text-center ${getWeedCoverColor(
                            selectedRecord.weed_cover_percentage,
                          )}`}
                        >
                          {selectedRecord.weed_cover_percentage_display ||
                            "N/A"}
                        </div>
                      </div>
                    </div>

                    {/* Weed Photo - FIXED */}
                    {selectedWeedImageUrl && (
                      <div>
                        <Label className="font-medium text-gray-700 mb-2">
                          Weed Photo
                        </Label>
                        <div className="rounded-lg overflow-hidden border">
                          <img
                            src={selectedWeedImageUrl}
                            alt={`Weed photo for ${selectedRecord.crop_name}`}
                            className="w-full h-48 object-cover"
                            onError={(e) => {
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="w-full h-48 flex flex-col items-center justify-center bg-gray-100">
                                    <ImageIcon class="h-12 w-12 text-gray-300 mb-2" />
                                    <p class="text-sm text-gray-400">Image not available</p>
                                  </div>
                                `;
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Weedicide Application */}
                  {selectedRecord.post_emergent_weedicide_applied && (
                    <div className="mt-4">
                      <Label className="font-medium text-gray-700 mb-2">
                        Weedicide Application
                      </Label>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Product Applied</p>
                            <p className="text-lg font-bold text-blue-700">
                              {selectedRecord.weedicide_product || "N/A"}
                            </p>
                          </div>
                          <Badge variant="default">Applied</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          Post-emergent weedicide:{" "}
                          {selectedRecord.post_emergent_weedicide_applied}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Other Issues */}
          {selectedRecord.other_issues_text && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-purple-600" />
                  Other Issues & Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">
                    {selectedRecord.other_issues_text}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailModalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </div>
      </>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Crop Emergence & Monitoring
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor germination, field practices, crop health issues, and weed
            presence
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={fetchWeedData}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-700">
                  Total Records
                </p>
                <h3 className="text-xl font-bold text-green-900 mt-1">
                  {totalRecords}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-200 flex items-center justify-center">
                <Leaf className="h-5 w-5 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-700">
                  Healthy Crops
                </p>
                <h3 className="text-xl font-bold text-blue-900 mt-1">
                  {healthyCrops}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-red-700">
                  Weeds Present
                </p>
                <h3 className="text-xl font-bold text-red-900 mt-1">
                  {weedsPresentCount}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-200 flex items-center justify-center">
                <Bug className="h-5 w-5 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-700">
                  Drill Sowing
                </p>
                <h3 className="text-xl font-bold text-amber-900 mt-1">
                  {drillSowingDoneCount}
                </h3>
                <p className="text-xs text-amber-600 mt-1">
                  {irrigationWithinWeekCount} irrigated
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-200 flex items-center justify-center">
                <Tractor className="h-5 w-5 text-amber-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-cyan-700">
                  Yellowing Issues
                </p>
                <h3 className="text-xl font-bold text-cyan-900 mt-1">
                  {yellowingIssuesCount}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-cyan-200 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-cyan-700" />
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
                  placeholder="Search by crop name, health status, or weed type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full lg:w-[400px]"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterField} onValueChange={setFilterField}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Fields</SelectItem>
                    {uniqueFields.map((farmName) => (
                      <SelectItem key={farmName} value={farmName}>
                        {farmName}
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
                  <TabsTrigger value="issues">With Issues</TabsTrigger>
                  <TabsTrigger value="healthy">Healthy Only</TabsTrigger>
                  <TabsTrigger value="weeds">Weeds Present</TabsTrigger>
                  <TabsTrigger value="germination">
                    Germination{" "}
                    <Badge className="ml-1">{weedData.length}</Badge>
                  </TabsTrigger>
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
            Crop Emergence Records
            <span className="text-muted-foreground font-normal ml-2">
              ({filteredData.length}{" "}
              {filteredData.length === 1 ? "record" : "records"})
            </span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Showing germination percentages, field practices, and crop health
            data
          </p>
        </div>

        {filteredData.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No crop emergence data found
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                {searchQuery
                  ? "No records match your search criteria. Try different keywords."
                  : "No crop emergence data has been recorded yet."}
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
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {renderDetailModal()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
