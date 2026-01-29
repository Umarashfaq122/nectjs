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
  Sprout,
  Leaf,
  Package,
  Droplet,
  Bug,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronRight,
  Eye,
  Filter,
  Search,
  Download,
  BarChart3,
  Calendar,
  Wheat,
  Thermometer,
  TrendingUp,
  User,
  MapPin,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// Define interface for fertilizer type object - FIXED to match API structure
interface FertilizerType {
  bag_amount: string | null;
  fertilizer_type: string | null;
}

// UPDATED interface with correct field names matching API response
interface GrowthData {
  id: number;
  crop_name: string | null;
  weeds_present: boolean | null;
  weed_cover_percentage: string | null; // Added missing field
  weed_type: string | null; // Added missing field
  post_emergent_applied: boolean | null;
  post_emergent_product: string | null;
  post_emergent_other_text: string | null;
  fertilizers_applied_2nd_irrigation: string | null;
  fertilizer_type: FertilizerType[] | null; // Now matches API array structure
  zn_applied: string | null;
  zn_product: string | null;
  bio_stimulant_applied: string | null;
  bio_stimulant_product: string | null;
  yellowing_observed: string | null;
  yellowing_bio_stimulant: string | null;
  crop_health: string | null;
  crop_height: string | null;
  irrigation_3rd_fertilizers: string | null;
  plant_growth_regulator: string | null;
  rust_management: string | null;
  aphid_control: string | null;
  created_at: string;
  farm: number | null;
  farm_name: string | null;
  farmer_name: string | null;

  // Additional fields from API that weren't in original interface
  disease_observed?: string | null;
  disease_product?: string | null;
  dpesticides_applied?: boolean | null; // Note: API has "dpesticides_applied" not "depesticides_applied"
  pest_observed?: string | null;
  pest_product?: string | null;
  pesticides_applied?: boolean | null;
  tillers?: string | null; // Added missing field
  fertilizer_applied?: boolean | null;
  fertilizer_recomendattion?: string | null; // Note: API has "recomendattion" with double t
  irrigation_days?: string | null;
  irrigation_done?: boolean | null; // Added missing field
  irrigation_nbr?: string | null; // Added missing field
  management?: string | null; // Added from API - Note: "ust management" might be a typo
  zone_ids?: string[]; // Added from API
}

export function GrowthForm() {
  const [growthData, setGrowthData] = useState<GrowthData[]>([]);
  const [filteredData, setFilteredData] = useState<GrowthData[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<GrowthData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFarmer, setFilterFarmer] = useState<string>("all");
  const [filterZone, setFilterZone] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");

  // Safe stats calculation with null checks
  const totalRecords = growthData.length;
  const healthyCrops = growthData.filter(
    (record) =>
      record.crop_health &&
      (record.crop_health === "Healthy" || record.crop_health === "healthy"),
  ).length;
  const weedsPresentCount = growthData.filter(
    (record) => record.weeds_present === true,
  ).length;
  const yellowingObservedCount = growthData.filter(
    (record) => record.yellowing_observed === "Yes",
  ).length;

  // Extract unique farmers and zones for filters
  const uniqueFarmers = Array.from(
    new Set(
      growthData
        .map((record) => record.farmer_name || "Unknown")
        .filter(Boolean),
    ),
  )
    .sort()
    .map((farmerName) => ({ id: farmerName, name: farmerName }));

  // Extract unique zones from all records
  const allZones = growthData
    .flatMap((record) => record.zone_ids || [])
    .filter(Boolean) as string[];

  const uniqueZones = Array.from(new Set(allZones))
    .sort()
    .map((zone) => ({ id: zone, name: zone }));

  useEffect(() => {
    fetchGrowthData();
  }, []);

  // Filter data based on search and filters
  useEffect(() => {
    let results = [...growthData];

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      results = results.filter((record) => {
        // Check farmer name
        if (record.farmer_name?.toLowerCase().includes(query)) return true;

        // Check farm name
        if (record.farm_name?.toLowerCase().includes(query)) return true;

        // Check crop name
        if (record.crop_name?.toLowerCase().includes(query)) return true;

        // Check zone IDs
        if (record.zone_ids?.some((zone) => zone.toLowerCase().includes(query)))
          return true;

        // Check fertilizer types
        if (record.fertilizer_type && Array.isArray(record.fertilizer_type)) {
          const hasMatchingFertilizer = record.fertilizer_type.some((ft) =>
            ft.fertilizer_type?.toLowerCase().includes(query),
          );
          if (hasMatchingFertilizer) return true;
        }

        return false;
      });
    }

    // Apply farmer filter
    if (filterFarmer !== "all") {
      results = results.filter((record) => record.farmer_name === filterFarmer);
    }

    // Apply zone filter
    if (filterZone !== "all") {
      results = results.filter(
        (record) =>
          record.zone_ids && record.zone_ids.includes(filterZone),
      );
    }

    // Apply tab filter
    if (activeTab === "issues") {
      results = results.filter(
        (record) => record.yellowing_observed === "Yes" || record.weeds_present,
      );
    } else if (activeTab === "healthy") {
      results = results.filter(
        (record) =>
          record.crop_health &&
          (record.crop_health === "Healthy" ||
            record.crop_health === "healthy"),
      );
    } else if (activeTab === "yellowing") {
      results = results.filter((record) => record.yellowing_observed === "Yes");
    }

    setFilteredData(results);
  }, [searchQuery, filterFarmer, filterZone, activeTab, growthData]);

  const fetchGrowthData = async () => {
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
        "https://rda.ngrok.app/api/growth-tillering/",
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
      console.log("Fetched growth & tillering data:", data);

      // Process data to match our interface - FIXED
      const processedData = Array.isArray(data)
        ? data.map((item) => ({
            ...item,
            // Ensure fertilizer_type is properly handled as array
            fertilizer_type:
              item.fertilizer_type && Array.isArray(item.fertilizer_type)
                ? item.fertilizer_type
                : item.fertilizer_type
                  ? [item.fertilizer_type]
                  : [],
            // Handle "ust management" field (likely a typo for "rust management")
            rust_management: item.management || item.rust_management || null,
            // Handle weed fields
            weed_cover_percentage: item.weed_cover_percentage || null,
            weed_type: item.weed_type || null,
            // Handle tillers
            tillers: item.tillers || null,
            // Handle irrigation fields
            irrigation_days: item.irrigation_days || null,
            irrigation_done: item.irrigation_done || false,
            irrigation_nbr: item.irrigation_nbr || null,
            // Handle pest fields
            pest_observed: item.pest_observed || null,
            pest_product: item.pest_product || null,
            pesticides_applied: item.pesticides_applied || false,
            // Handle disease fields
            disease_observed: item.disease_observed || null,
            disease_product: item.disease_product || null,
            dpesticides_applied: item.dpesticides_applied || false,
          }))
        : [];

      setGrowthData(processedData);
      setFilteredData(processedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      console.error("Error fetching growth & tillering data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format fertilizer type for display
  const formatFertilizerType = (fertilizerType: FertilizerType[] | null) => {
    if (
      !fertilizerType ||
      !Array.isArray(fertilizerType) ||
      fertilizerType.length === 0
    ) {
      return "Not specified";
    }

    // Filter out null entries
    const validFertilizers = fertilizerType.filter(
      (ft) => ft && ft.fertilizer_type,
    );

    if (validFertilizers.length === 0) {
      return "Not specified";
    }

    // Display first fertilizer type, show count if more than one
    const firstFertilizer = validFertilizers[0];
    let displayText = firstFertilizer.fertilizer_type || "Unknown";

    if (firstFertilizer.bag_amount) {
      displayText += ` (${firstFertilizer.bag_amount} bags)`;
    }

    if (validFertilizers.length > 1) {
      displayText += ` +${validFertilizers.length - 1} more`;
    }

    return displayText;
  };

  // Helper to get all fertilizer types as string
  const getAllFertilizerTypes = (fertilizerType: FertilizerType[] | null) => {
    if (!fertilizerType || !Array.isArray(fertilizerType)) return [];

    // Filter out null entries
    return fertilizerType
      .filter((ft) => ft && ft.fertilizer_type)
      .map((ft) => ({
        type: ft.fertilizer_type || "Unknown",
        amount: ft.bag_amount || "Not specified",
      }));
  };

  const getCropHealthColor = (health: string | null) => {
    if (!health) return "bg-gray-100 text-gray-800";

    const healthLower = health.toLowerCase();
    switch (healthLower) {
      case "healthy":
        return "bg-green-100 text-green-800";
      case "fair":
      case "moderate":
        return "bg-yellow-100 text-yellow-800";
      case "stressed":
      case "poor":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCropHeightColor = (height: string | null) => {
    if (!height) return "text-gray-600";

    const heightLower = height.toLowerCase();
    if (heightLower.includes("<") || heightLower.includes("less")) {
      return "text-blue-600";
    } else if (
      heightLower.includes("6-12") ||
      heightLower.includes("6_to_10")
    ) {
      return "text-green-600";
    } else if (
      heightLower.includes("10-14") ||
      heightLower.includes("10_to_14")
    ) {
      return "text-green-600";
    } else if (
      heightLower.includes("14-18") ||
      heightLower.includes("14_to_18")
    ) {
      return "text-amber-600";
    } else if (heightLower.includes(">") || heightLower.includes("greater")) {
      return "text-amber-600";
    } else {
      return "text-gray-600";
    }
  };

  const formatHeight = (height: string | null) => {
    if (!height) return "Not specified";

    const heightLower = height.toLowerCase();
    if (heightLower.includes("less_than_6_inches") || heightLower === "<6") {
      return "Less than 6 inches";
    } else if (
      heightLower.includes("6_to_10_inches") ||
      heightLower.includes("6-10")
    ) {
      return "6 to 10 inches";
    } else if (
      heightLower.includes("10_to_14_inches") ||
      heightLower.includes("10-14")
    ) {
      return "10 to 14 inches";
    } else if (
      heightLower.includes("14_to_18_inches") ||
      heightLower.includes("14-18")
    ) {
      return "14 to 18 inches";
    } else if (
      heightLower.includes("greater_than_18_inches") ||
      heightLower.includes(">18")
    ) {
      return "Greater than 18 inches";
    }
    return height.replace(/_/g, " ");
  };

  const getYellowingStatusColor = (status: string | null) => {
    return status === "Yes"
      ? "bg-red-100 text-red-800"
      : "bg-green-100 text-green-800";
  };

  const getBioStimulantStatusColor = (status: string | null) => {
    return status === "Yes"
      ? "bg-blue-100 text-blue-800"
      : "bg-gray-100 text-gray-800";
  };

  const renderYesNoStatus = (value: string | null) => {
    if (value === null || value === undefined) {
      return (
        <div className="flex items-center gap-1">
          <XCircle className="h-4 w-4 text-gray-400" />
          <span className="text-gray-500">Not specified</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1">
        {value === "Yes" ? (
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
  };

  const renderBooleanStatus = (value: boolean | null) => {
    if (value === null || value === undefined) {
      return (
        <div className="flex items-center gap-1">
          <XCircle className="h-4 w-4 text-gray-400" />
          <span className="text-gray-500">Not specified</span>
        </div>
      );
    }

    return (
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
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  // Function to render each card
  const renderCard = (record: GrowthData) => {
    const cropName = record.crop_name || "Unknown Crop";
    const cropHealth = record.crop_health || "Not specified";
    const cropHeight = record.crop_height || "";
    const yellowingObserved = record.yellowing_observed || "No";
    const bioStimulantApplied = record.bio_stimulant_applied || "No";
    const bioStimulantProduct = record.bio_stimulant_product || "Not specified";
    const znApplied = record.zn_applied || "No";
    const znProduct = record.zn_product || "Not specified";
    const fertilizers2ndIrrigation =
      record.fertilizers_applied_2nd_irrigation || "No";
    const yellowingBioStimulant = record.yellowing_bio_stimulant;
    const aphidControl = record.aphid_control;
    const rustManagement = record.rust_management;
    const farmId = record.farm;
    const farmName = record.farm_name;
    const farmer_name = record.farmer_name;

    return (
      <Card
        key={record.id}
        className="group hover:shadow-lg transition-all duration-300 hover:border-primary/30 overflow-hidden"
      >
        <CardContent className="p-0">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                  {cropName}
                </h3>
                <div>
                  <p className="text-sm text-gray-600 mt-1">
                    {farmer_name} {farmName && `• ${farmName}`}{" "}
                    {farmId && `• Farm ${farmId}`}
                  </p>
                </div>
              </div>
              <Badge className={getCropHealthColor(cropHealth)}>
                {cropHealth}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <div className="space-y-4">
              {/* Key Information */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Package className="h-4 w-4" />
                  <span className="text-sm">Fertilizer</span>
                </div>
                <Badge
                  variant="outline"
                  className="capitalize truncate max-w-[150px] px-3"
                >
                  <div className="flex items-center gap-2">
                    <Package className="h-3 w-3" />
                    <span>{formatFertilizerType(record.fertilizer_type)}</span>
                  </div>
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Leaf className="h-4 w-4" />
                    <span className="text-sm">Yellowing</span>
                  </div>
                  <Badge className={getYellowingStatusColor(yellowingObserved)}>
                    {yellowingObserved}
                  </Badge>
                </div>
              </div>
              {/* Show Yellowing Bio Stimulant when Yellowing is Yes */}
              {yellowingObserved === "Yes" && yellowingBioStimulant && (
                <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="text-sm font-medium text-red-800 mb-1 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Yellowing Treatment
                  </h4>
                  <p className="text-sm text-red-700">
                    {yellowingBioStimulant}
                  </p>
                </div>
              )}

              {/* Bio Stimulant */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2">
                  Bio Stimulant
                </Label>
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div>
                    <span className="font-medium">{bioStimulantProduct}</span>
                    <p className="text-xs text-gray-500 mt-1">
                      Applied: {bioStimulantApplied}
                    </p>
                  </div>
                  <Badge
                    className={getBioStimulantStatusColor(bioStimulantApplied)}
                  >
                    {bioStimulantApplied}
                  </Badge>
                </div>
              </div>

              {/* Quick Status Indicators */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Weeds Present</span>
                    {renderBooleanStatus(record.weeds_present)}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Crop Height</span>
                    <span
                      className={`font-bold ${getCropHeightColor(cropHeight)}`}
                    >
                      {formatHeight(cropHeight)}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Zn Applied</span>
                    {renderYesNoStatus(znApplied)}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      2nd Irrigation
                    </span>
                    {renderYesNoStatus(fertilizers2ndIrrigation)}
                  </div>
                </div>
              </div>

              {/* Weed Information */}
              {record.weed_type && (
                <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="text-sm font-medium text-green-800 mb-1 flex items-center gap-1">
                    <Leaf className="h-4 w-4" />
                    Weed Information
                  </h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{record.weed_type}</span>
                  </div>
                  {record.weed_cover_percentage && (
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-600">Coverage:</span>
                      <span className="font-medium">
                        {record.weed_cover_percentage}%
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Zone Information */}
              {record.zone_ids && record.zone_ids.length > 0 && (
                <div className="mt-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="text-sm font-medium text-purple-800 mb-1 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Zones
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {record.zone_ids.map((zone, index) => (
                      <Badge key={index} variant="outline" className="bg-white">
                        {zone}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Pest Control Summary */}
              {(aphidControl || rustManagement) && (
                <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <h4 className="text-sm font-medium text-amber-800 mb-2 flex items-center gap-1">
                    <Bug className="h-4 w-4" />
                    Pest Control
                  </h4>
                  <div className="space-y-1">
                    {aphidControl && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Aphid Control:</span>
                        <span className="font-medium">{aphidControl}</span>
                      </div>
                    )}
                    {rustManagement && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Rust Management:</span>
                        <span className="font-medium">{rustManagement}</span>
                      </div>
                    )}
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
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(record.created_at)}</span>
            </div>
            {record.zone_ids && record.zone_ids.length > 0 && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-gray-400" />
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {record.zone_ids.length} zone(s)
                </span>
              </div>
            )}
          </CardFooter>
        </CardContent>
      </Card>
    );
  };

  // Function to render detail modal content
  const renderDetailModal = () => {
    if (!selectedRecord) return null;

    const fertilizerTypes = getAllFertilizerTypes(
      selectedRecord.fertilizer_type,
    );
    const cropName = selectedRecord.crop_name || "Unknown Crop";
    const cropHealth = selectedRecord.crop_health || "Not specified";
    const cropHeight = selectedRecord.crop_height || "";
    const yellowingObserved = selectedRecord.yellowing_observed || "No";
    const bioStimulantProduct =
      selectedRecord.bio_stimulant_product || "Not specified";
    const bioStimulantApplied = selectedRecord.bio_stimulant_applied || "No";
    const yellowingBioStimulant = selectedRecord.yellowing_bio_stimulant;
    const znProduct = selectedRecord.zn_product || "Not specified";
    const znApplied = selectedRecord.zn_applied || "No";
    const aphidControl = selectedRecord.aphid_control;
    const rustManagement = selectedRecord.rust_management;
    const plantGrowthRegulator = selectedRecord.plant_growth_regulator;
    const irrigation3rdFertilizers = selectedRecord.irrigation_3rd_fertilizers;
    const postEmergentApplied = selectedRecord.post_emergent_applied;
    const postEmergentProduct = selectedRecord.post_emergent_product;
    const postEmergentOtherText = selectedRecord.post_emergent_other_text;
    const farmId = selectedRecord.farm;
    const farmerName = selectedRecord.farmer_name;
    const farmName = selectedRecord.farm_name;

    return (
      <>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Sprout className="h-6 w-6 text-primary" />
                {cropName} - Record #{selectedRecord.id}
              </DialogTitle>
              <DialogDescription asChild>
                <div className="mt-1">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{farmerName || "Unknown Farmer"}</span>
                    </div>
                    {farmName && (
                      <>
                        <span>•</span>
                        <span>{farmName}</span>
                      </>
                    )}
                    {farmId && (
                      <>
                        <span>•</span>
                        <span>Farm {farmId}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>Created: {formatDate(selectedRecord.created_at)}</span>
                    {selectedRecord.zone_ids &&
                      selectedRecord.zone_ids.length > 0 && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {selectedRecord.zone_ids.length} zone(s)
                            </span>
                          </div>
                        </>
                      )}
                  </div>
                </div>
              </DialogDescription>
            </div>
            <Badge className={getCropHealthColor(cropHealth)}>
              {cropHealth}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wheat className="h-5 w-5 text-green-600" />
                  Crop Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Crop Name
                    </Label>
                    <p className="font-medium">{cropName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Crop Health
                    </Label>
                    <Badge className={getCropHealthColor(cropHealth)}>
                      {cropHealth}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Crop Height
                    </Label>
                    <p
                      className={`font-bold ${getCropHeightColor(cropHeight)}`}
                    >
                      {formatHeight(cropHeight)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Yellowing Observed
                    </Label>
                    <Badge
                      className={getYellowingStatusColor(yellowingObserved)}
                    >
                      {yellowingObserved}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Weeds Present</span>
                    {renderBooleanStatus(selectedRecord.weeds_present)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Post Emergent Applied</span>
                    {renderBooleanStatus(postEmergentApplied)}
                  </div>
                  {/* Display tillers if available */}
                  {selectedRecord.tillers && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tillers</span>
                      <span className="font-medium">
                        {selectedRecord.tillers}
                      </span>
                    </div>
                  )}
                  {/* Display weed information if available */}
                  {selectedRecord.weed_type && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Weed Type</span>
                      <span className="font-medium">
                        {selectedRecord.weed_type}
                        {selectedRecord.weed_cover_percentage &&
                          ` (${selectedRecord.weed_cover_percentage}% coverage)`}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-amber-600" />
                  Fertilizers & Stimulants
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Fertilizer Types */}
                <div>
                  <Label className="font-medium text-gray-700 mb-2">
                    Fertilizer Type(s)
                  </Label>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    {fertilizerTypes.length > 0 ? (
                      <div className="space-y-2">
                        {fertilizerTypes.map((ft, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center"
                          >
                            <span className="font-medium capitalize">
                              {ft.type}
                            </span>
                            {ft.amount && ft.amount !== "Not specified" && (
                              <Badge variant="outline">{ft.amount} bags</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No fertilizer specified</p>
                    )}
                    <div className="mt-2 pt-2 border-t">
                      <Badge variant="outline">
                        2nd Irrigation:{" "}
                        {selectedRecord.fertilizers_applied_2nd_irrigation ||
                          "Not specified"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Zinc Application */}
                <div>
                  <Label className="font-medium text-gray-700 mb-2">
                    Zinc Application
                  </Label>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{znProduct}</span>
                      <Badge className={getBioStimulantStatusColor(znApplied)}>
                        {znApplied}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Bio Stimulant */}
                <div>
                  <Label className="font-medium text-gray-700 mb-2">
                    Bio Stimulant
                  </Label>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <span className="font-medium block">
                          {bioStimulantProduct}
                        </span>
                        <p className="text-xs text-gray-600 mt-1">
                          Applied: {bioStimulantApplied}
                        </p>
                        {/* Show Yellowing Bio Stimulant if yellowing is observed and has value */}
                        {yellowingObserved === "Yes" &&
                          yellowingBioStimulant && (
                            <div className="mt-2 p-2 bg-red-100 rounded border border-red-200">
                              <p className="text-sm font-medium text-red-700">
                                Yellowing Treatment:
                              </p>
                              <p className="text-sm text-red-600 mt-1">
                                {yellowingBioStimulant}
                              </p>
                            </div>
                          )}
                      </div>
                      <Badge
                        className={getBioStimulantStatusColor(
                          bioStimulantApplied,
                        )}
                      >
                        {bioStimulantApplied}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Management & Control */}
          {(aphidControl ||
            rustManagement ||
            plantGrowthRegulator ||
            irrigation3rdFertilizers) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="h-5 w-5 text-red-600" />
                  Management & Control
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plantGrowthRegulator && (
                      <div>
                        <Label className="font-medium text-gray-700 mb-2">
                          Plant Growth Regulator
                        </Label>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <p className="font-medium">{plantGrowthRegulator}</p>
                        </div>
                      </div>
                    )}
                    {irrigation3rdFertilizers && (
                      <div>
                        <Label className="font-medium text-gray-700 mb-2">
                          Irrigation & Fertilizers
                        </Label>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="font-medium">
                            {irrigation3rdFertilizers}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rustManagement && (
                      <div>
                        <Label className="font-medium text-gray-700 mb-2">
                          Rust Management
                        </Label>
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <p className="font-medium capitalize">
                            {rustManagement}
                          </p>
                        </div>
                      </div>
                    )}
                    {aphidControl && (
                      <div>
                        <Label className="font-medium text-gray-700 mb-2">
                          Aphid Control
                        </Label>
                        <div className="bg-red-50 p-3 rounded-lg">
                          <p className="font-medium">{aphidControl}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Post Emergent Details */}
          {postEmergentApplied && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  Post Emergent Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {postEmergentProduct && (
                    <div>
                      <Label className="font-medium text-gray-700 mb-2">
                        Product
                      </Label>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="font-medium">{postEmergentProduct}</p>
                      </div>
                    </div>
                  )}
                  {postEmergentOtherText && (
                    <div>
                      <Label className="font-medium text-gray-700 mb-2">
                        Additional Notes
                      </Label>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-gray-700">{postEmergentOtherText}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Zone Information */}
          {selectedRecord.zone_ids && selectedRecord.zone_ids.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-purple-600" />
                  Zone Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {selectedRecord.zone_ids.map((zone, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-white border-purple-300 text-purple-700"
                      >
                        {zone}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-purple-600 mt-3">
                    Total: {selectedRecord.zone_ids.length} zone(s)
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Fields Section - Show other data from API */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-gray-600" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Disease Information */}
                {selectedRecord.disease_observed &&
                  selectedRecord.disease_observed !== "none" && (
                    <div>
                      <Label className="font-medium text-gray-700 mb-2">
                        Disease Observed
                      </Label>
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <p className="font-medium capitalize">
                          {selectedRecord.disease_observed}
                        </p>
                        {selectedRecord.disease_product && (
                          <p className="text-sm text-gray-600 mt-1">
                            Product: {selectedRecord.disease_product}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                {/* Pest Information */}
                {selectedRecord.pest_observed &&
                  selectedRecord.pest_observed !== "none" && (
                    <div>
                      <Label className="font-medium text-gray-700 mb-2">
                        Pest Observed
                      </Label>
                      <div className="bg-red-50 p-3 rounded-lg">
                        <p className="font-medium capitalize">
                          {selectedRecord.pest_observed}
                        </p>
                        {selectedRecord.pest_product && (
                          <p className="text-sm text-gray-600 mt-1">
                            Product: {selectedRecord.pest_product}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                {/* Pesticide Information */}
                {selectedRecord.pesticides_applied !== undefined && (
                  <div>
                    <Label className="font-medium text-gray-700 mb-2">
                      Pesticides Applied
                    </Label>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      {renderBooleanStatus(selectedRecord.pesticides_applied)}
                    </div>
                  </div>
                )}

                {/* Dpesticides Information */}
                {selectedRecord.dpesticides_applied !== undefined && (
                  <div>
                    <Label className="font-medium text-gray-700 mb-2">
                      Dpesticides Applied
                    </Label>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      {renderBooleanStatus(selectedRecord.dpesticides_applied)}
                    </div>
                  </div>
                )}

                {/* Fertilizer Recommendation */}
                {selectedRecord.fertilizer_recomendattion && (
                  <div>
                    <Label className="font-medium text-gray-700 mb-2">
                      Fertilizer Recommendation
                    </Label>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="font-medium">
                        {selectedRecord.fertilizer_recomendattion}
                      </p>
                    </div>
                  </div>
                )}

                {/* Irrigation Information */}
                {(selectedRecord.irrigation_days ||
                  selectedRecord.irrigation_done !== undefined) && (
                  <div>
                    <Label className="font-medium text-gray-700 mb-2">
                      Irrigation Status
                    </Label>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      {selectedRecord.irrigation_done ? (
                        <>
                          <p className="font-medium text-green-600">
                            Irrigation Done
                          </p>
                          {selectedRecord.irrigation_days && (
                            <p className="text-sm text-gray-600 mt-1">
                              Days: {selectedRecord.irrigation_days}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="font-medium text-amber-600">
                          Irrigation Pending
                        </p>
                      )}
                    </div>
                  </div>
                )}
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
          </DialogFooter>
        </div>
      </>
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
            <Button onClick={fetchGrowthData} className="mt-4">
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
            Growth & Tillering Stage
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor crop development, fertilizer applications, and pest
            management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={fetchGrowthData}>
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
                <Sprout className="h-6 w-6 text-green-700" />
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
                  Weeds Present
                </p>
                <h3 className="text-2xl font-bold text-red-900 mt-2">
                  {weedsPresentCount}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-200 flex items-center justify-center">
                <Leaf className="h-6 w-6 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700">
                  Yellowing Observed
                </p>
                <h3 className="text-2xl font-bold text-amber-900 mt-2">
                  {yellowingObservedCount}
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
                  placeholder="Search by farmer name, farm name, crop, zone, or fertilizer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full lg:w-[400px]"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Farmer Filter */}
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <Select value={filterFarmer} onValueChange={setFilterFarmer}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by farmer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Farmers</SelectItem>
                    {uniqueFarmers.map((farmer) => (
                      <SelectItem key={farmer.id} value={farmer.id}>
                        {farmer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Zone Filter */}
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <Select value={filterZone} onValueChange={setFilterZone}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Zones</SelectItem>
                    {uniqueZones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-auto"
              >
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="issues">With Issues</TabsTrigger>
                  <TabsTrigger value="healthy">Healthy Only</TabsTrigger>
                  <TabsTrigger value="yellowing">
                    Yellowing Observed
                  </TabsTrigger>
                </TabsList>
              </Tabs> */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Growth & Tillering Records
            <span className="text-muted-foreground font-normal ml-2">
              ({filteredData.length}{" "}
              {filteredData.length === 1 ? "record" : "records"})
            </span>
          </h2>
          <p className="text-sm text-muted-foreground">Sorted by latest date</p>
        </div>

        {filteredData.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Sprout className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No growth & tillering data found
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                {searchQuery || filterFarmer !== "all" || filterZone !== "all"
                  ? "No records match your filter criteria. Try different filters."
                  : "No growth & tillering data has been recorded yet."}
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