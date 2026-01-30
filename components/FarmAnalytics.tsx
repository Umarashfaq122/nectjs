"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  MapPin,
  Loader2,
  Globe,
  Layers,
  Wheat,
  Target,
  Sprout,
  Droplets,
  TreePine,
  Flower2,
  Filter,
  Calendar,
  BarChart,
  Drill,
  FlaskConical,
  Shield,
  Zap,
  Droplet,
} from "lucide-react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from "recharts";

/* ================= TYPES ================= */

interface FarmActivity {
  id?: number;
  crop_name: string;
  crop_rotation_pattern?: string | null;
  average_yield?: number | null;
  variety_cultivated?: string | null;
  farmer_name?: string | null;
  field_name?: string | null;
  zones?: string[] | null;
  [key: string]: any;
}

interface SowingData {
  seed_rate?: string | number | null;
  wheat_variety?: string | null;
  method_of_sowing?: string[] | null;
  basal_fertilizers_applied?: Array<{
    fertilizer: string;
    quantity: number;
  }> | null;
  variety?: string[] | null;
  zone_ids?: string[] | null;
  seed_treatment?: boolean;
  seed_treatment_product?: string | null;
  soil_conditioner?: boolean;
  soil_conditioner_product?: string | null;
  bio_stimulant?: string | null;
  [key: string]: any;
}

interface EmergenceData {
  crop_health?: string | null;
  germination_per?: { value?: string } | null;
  yellowing_cause?: string | null;
  zone_ids?: string[] | null;
  [key: string]: any;
}

interface TilleringData {
  fertilizers_applied?: any[] | null;
  fertilizer_type?: any[] | null;
  crop_height?: number | null;
  crop_health?: string | null;
  zone_ids?: string[] | null;
  [key: string]: any;
}

interface BootingData {
  // Add booting fields as needed
  zone_ids?: string[] | null;
  [key: string]: any;
}

interface ChartData {
  name: string;
  value: number;
  fullName?: string;
  [key: string]: any;
}

/* ================= COLORS ================= */

const COLORS = {
  primary: "#3B82F6",
  secondary: "#10B981",
  accent: "#8B5CF6",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#06B6D4",
  lightGray: "#F8FAFC",
  darkGray: "#1E293B",
};

const PIE_COLORS = [
  "#3B82F6",
  "#10B981",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
  "#84CC16",
  "#EC4899",
  "#14B8A6",
  "#F97316",
];

const ZONE_COLORS: Record<string, string> = {
  "Zone-1": "#3B82F6",
  "Zone-2": "#10B981",
  "Zone-3": "#8B5CF6",
  "Zone-4": "#F59E0B",
  "Zone-5": "#EF4444",
  "Zone-6": "#06B6D4",
};

const CROP_COLORS: Record<string, string> = {
  Wheat: "#F59E0B",
  Raya: "#10B981",
  Cotton: "#3B82F6",
  Other: "#6B7280",
};

/* ================= COMPONENT ================= */

export default function FarmAnalytics() {
  // State for filters
  const [selectedCrop, setSelectedCrop] = useState<string>("all");
  const [selectedStage, setSelectedStage] = useState<string>("pre-sowing");
  const [selectedZone, setSelectedZone] = useState<string>("all");

  // State for API data
  const [preSowingData, setPreSowingData] = useState<FarmActivity[]>([]);
  const [sowingData, setSowingData] = useState<SowingData[]>([]);
  const [emergenceData, setEmergenceData] = useState<EmergenceData[]>([]);
  const [tilleringData, setTilleringData] = useState<TilleringData[]>([]);
  const [bootingData, setBootingData] = useState<BootingData[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* -------- Available Options -------- */
  const crops = ["Wheat", "Raya", "Cotton"];
  const growthStages = [
    {
      value: "pre-sowing",
      label: "Pre-Sowing",
      icon: <Sprout className="h-4 w-4" />,
    },
    {
      value: "sowing",
      label: "Sowing",
      icon: <Droplets className="h-4 w-4" />,
    },
    {
      value: "emergence",
      label: "Emergence",
      icon: <Sprout className="h-4 w-4" />,
    },
    {
      value: "tillering",
      label: "Tillering",
      icon: <TreePine className="h-4 w-4" />,
    },
    {
      value: "booting",
      label: "Booting",
      icon: <Flower2 className="h-4 w-4" />,
    },
  ];

  const zones = ["Zone-1", "Zone-2", "Zone-3", "Zone-4", "Zone-5", "Zone-6"];

  /* -------- Fetch All APIs -------- */
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("authToken")
            : null;
        if (!token) {
          setError("No authentication token found");
          setLoading(false);
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        };

        // Fetch Pre-Sowing Data
        const preSowingResponse = await fetch(
          "https://rda.ngrok.app/api/farm-activities/",
          { headers },
        );
        if (!preSowingResponse.ok)
          throw new Error("Failed to fetch pre-sowing data");
        const preSowingJson = await preSowingResponse.json();
        const preSowingList = Array.isArray(preSowingJson)
          ? preSowingJson
          : preSowingJson?.data || preSowingJson?.results || [];
        console.log("Filtered Pre-Sowing Data:", preSowingList);
        setPreSowingData(
          preSowingList.filter((item: any) => item && item.crop_name),
        );

        // Fetch Sowing Data
        const sowingResponse = await fetch(
          "https://rda.ngrok.app/api/sowing-emergence-stageView/",
          { headers },
        );
        if (sowingResponse.ok) {
          const sowingJson = await sowingResponse.json();
          const sowingList = Array.isArray(sowingJson)
            ? sowingJson
            : sowingJson?.data || sowingJson?.results || [];
          console.log("Filtered Sowing Data:", sowingList);
          setSowingData(sowingList);
        }

        // Fetch Emergence Data
        const emergenceResponse = await fetch(
          "https://rda.ngrok.app/api/weed-monitoring/",
          { headers },
        );
        if (emergenceResponse.ok) {
          const emergenceJson = await emergenceResponse.json();
          const emergenceList = Array.isArray(emergenceJson)
            ? emergenceJson
            : emergenceJson?.data || emergenceJson?.results || [];
          console.log("Filtered Emergence Data:", emergenceList);
          setEmergenceData(emergenceList);
        }

        // Fetch Tillering Data
        const tilleringResponse = await fetch(
          "https://rda.ngrok.app/api/growth-tillering/",
          { headers },
        );
        if (tilleringResponse.ok) {
          const tilleringJson = await tilleringResponse.json();
          const tilleringList = Array.isArray(tilleringJson)
            ? tilleringJson
            : tilleringJson?.data || tilleringJson?.results || [];
          console.log("Filtered Tillering Data:", tilleringList);
          setTilleringData(tilleringList);
        }

        // Fetch Booting Data
        const bootingResponse = await fetch(
          "https://rda.ngrok.app/api/booting/",
          { headers },
        );
        if (bootingResponse.ok) {
          const bootingJson = await bootingResponse.json();
          const bootingList = Array.isArray(bootingJson)
            ? bootingJson
            : bootingJson?.data || bootingJson?.results || [];
          setBootingData(bootingList);
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load farm analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  /* -------- Filter Data Based on Selections -------- */
  const filteredData = useMemo(() => {
    let data: any[] = [];

    // Select data based on growth stage
    switch (selectedStage) {
      case "pre-sowing":
        data = preSowingData;
        break;
      case "sowing":
        data = sowingData;
        break;
      case "emergence":
        data = emergenceData;
        break;
      case "tillering":
        data = tilleringData;
        console.log("tillering Data", data);
        break;
      case "booting":
        data = bootingData;
        break;
      default:
        data = preSowingData;
    }

    // Filter by crop (only for pre-sowing)
    if (selectedCrop !== "all" && selectedStage === "pre-sowing") {
      data = data.filter((item: any) => item.crop_name === selectedCrop);
    }

    // Filter by zone
    if (selectedZone !== "all") {
      data = data.filter((item: any) => {
        const itemZones = item.zones || item.zone_ids || [];
        return Array.isArray(itemZones) && itemZones.includes(selectedZone);
      });
    }

    return data;
  }, [
    selectedStage,
    selectedCrop,
    selectedZone,
    preSowingData,
    sowingData,
    emergenceData,
    tilleringData,
    bootingData,
  ]);

  /* -------- PRE-SOWING: Crop Rotation Patterns (by zone) -------- */
  const cropRotationByZoneData = useMemo(() => {
    if (selectedStage !== "pre-sowing") return [];

    console.log("Processing crop rotation patterns...");

    const zonePatternMap: Record<string, Record<string, number>> = {};

    // Initialize all zones
    zones.forEach((zone) => {
      zonePatternMap[zone] = {};
    });

    // Count crop rotation patterns per zone
    filteredData.forEach((item) => {
      const itemZones = item.zones || item.zone_ids || [];
      if (itemZones.length > 0 && item.crop_rotation_pattern) {
        const zone = itemZones[0];
        const pattern = item.crop_rotation_pattern;

        if (zonePatternMap[zone]) {
          zonePatternMap[zone][pattern] =
            (zonePatternMap[zone][pattern] || 0) + 1;
        }
      }
    });

    // Get all unique crop rotation patterns
    const allPatterns = new Set<string>();
    Object.values(zonePatternMap).forEach((patterns) => {
      Object.keys(patterns).forEach((pattern) => {
        allPatterns.add(pattern);
      });
    });

    // Take top 5 most common patterns across all zones
    const patternCounts: Record<string, number> = {};
    Object.values(zonePatternMap).forEach((patterns) => {
      Object.entries(patterns).forEach(([pattern, count]) => {
        patternCounts[pattern] = (patternCounts[pattern] || 0) + count;
      });
    });

    const topPatterns = Object.entries(patternCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([pattern]) => pattern);

    console.log("Top crop rotation patterns:", topPatterns);
    console.log("Zone pattern map:", zonePatternMap);

    // Format for stacked bar chart
    return zones.map((zone) => {
      const zoneData = zonePatternMap[zone];
      const total = Object.values(zoneData).reduce(
        (sum, count) => sum + count,
        0,
      );

      const result: any = { zone };

      topPatterns.forEach((pattern) => {
        const count = zoneData[pattern] || 0;
        result[pattern] = total > 0 ? Math.round((count / total) * 100) : 0;
      });

      return result;
    });
  }, [selectedStage, filteredData, zones]);

  /* -------- PRE-SOWING: Average Yield by Zone -------- */
  const averageYieldByZoneData = useMemo(() => {
    if (selectedStage !== "pre-sowing") return [];

    const zoneYieldMap: Record<string, { total: number; count: number }> = {};

    // Initialize all zones
    zones.forEach((zone) => {
      zoneYieldMap[zone] = { total: 0, count: 0 };
    });

    // Calculate yield per zone
    filteredData.forEach((item) => {
      const itemZones = item.zones || item.zone_ids || [];
      if (itemZones.length > 0 && typeof item.average_yield === "number") {
        const zone = itemZones[0];
        if (zoneYieldMap[zone]) {
          zoneYieldMap[zone].total += item.average_yield;
          zoneYieldMap[zone].count += 1;
        }
      }
    });

    // Format for pie chart
    return zones.map((zone) => {
      const data = zoneYieldMap[zone];
      const avgYield = data.count > 0 ? Math.round(data.total / data.count) : 0;

      return {
        name: zone,
        value: avgYield,
        color: ZONE_COLORS[zone] || COLORS.primary,
        displayValue: `${avgYield} mounds/acre`,
      };
    });
  }, [selectedStage, filteredData]);

  /* ================= SOWING STAGE ADDITIONS ================= */

  /* -------- SOWING: Seed Rate by Zone -------- */
  const seedRateByZoneData = useMemo(() => {
    if (selectedStage !== "sowing") return [];

    const zoneSeedMap: Record<string, { total: number; count: number }> = {};

    zones.forEach((zone) => {
      zoneSeedMap[zone] = { total: 0, count: 0 };
    });

    filteredData.forEach((item: any) => {
      const itemZones = item.zone_ids || [];
      if (itemZones.length > 0 && item.seed_rate) {
        const zone = itemZones[0];
        const seedRate = parseFloat(item.seed_rate);
        if (!isNaN(seedRate) && zoneSeedMap[zone]) {
          zoneSeedMap[zone].total += seedRate;
          zoneSeedMap[zone].count += 1;
        }
      }
    });

    return zones.map((zone) => {
      const data = zoneSeedMap[zone];
      const avgSeedRate =
        data.count > 0 ? Number((data.total / data.count).toFixed(1)) : 0;

      return {
        name: zone,
        value: avgSeedRate,
        color: ZONE_COLORS[zone],
      };
    });
  }, [selectedStage, filteredData]);

  /* -------- SOWING: Wheat Variety Distribution -------- */
  const wheatVarietyData = useMemo(() => {
    if (selectedStage !== "sowing") return [];

    const varietyMap: Record<string, number> = {};

    filteredData.forEach((item: any) => {
      if (item.variety && Array.isArray(item.variety)) {
        item.variety.forEach((variety: string) => {
          if (variety && typeof variety === "string") {
            const cleanVariety = variety.trim();
            if (cleanVariety) {
              varietyMap[cleanVariety] = (varietyMap[cleanVariety] || 0) + 1;
            }
          }
        });
      }
    });

    return Object.entries(varietyMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value], index) => ({
        name: name.length > 10 ? name.substring(0, 10) + "..." : name,
        value,
        color: PIE_COLORS[index % PIE_COLORS.length],
        fullName: name,
      }));
  }, [selectedStage, filteredData]);

  /* -------- SOWING: Fertilizer Types Distribution -------- */
  const sowingFertilizerData = useMemo(() => {
    if (selectedStage !== "sowing") return [];

    const fertilizerMap: Record<string, number> = {};

    filteredData.forEach((item: any) => {
      if (
        item.basal_fertilizers_applied &&
        Array.isArray(item.basal_fertilizers_applied)
      ) {
        item.basal_fertilizers_applied.forEach((fert: any) => {
          if (
            fert &&
            typeof fert === 'object' &&
            fert.fertilizer &&
            fert.fertilizer.toString().trim() !== ""
          ) {
            const fertilizerName = fert.fertilizer.toString().trim();
            fertilizerMap[fertilizerName] = (fertilizerMap[fertilizerName] || 0) + 1;
          }
        });
      }
    });

    console.log("Fertilizer Map:", fertilizerMap);

    return Object.entries(fertilizerMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value], index) => ({
        name: name.length > 12 ? name.substring(0, 12) + "..." : name,
        value,
        color: PIE_COLORS[index % PIE_COLORS.length],
        fullName: name,
      }));
  }, [selectedStage, filteredData]);

  /* -------- SOWING: Sowing Methods Distribution -------- */
  const sowingMethodsData = useMemo(() => {
    if (selectedStage !== "sowing") return [];

    const methodMap: Record<string, number> = {};

    filteredData.forEach((item: any) => {
      if (item.method_of_sowing && Array.isArray(item.method_of_sowing)) {
        item.method_of_sowing.forEach((method: any) => {
          if (method && typeof method === "string") {
            const cleanMethod = method.trim();
            if (cleanMethod) {
              methodMap[cleanMethod] = (methodMap[cleanMethod] || 0) + 1;
            }
          }
        });
      }
    });

    console.log("Sowing Methods Map:", methodMap);

    return Object.entries(methodMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], index) => ({
        name,
        value,
        color: PIE_COLORS[index % PIE_COLORS.length],
      }));
  }, [selectedStage, filteredData]);

  /* -------- SOWING: Seed Treatment Stats -------- */
  const seedTreatmentData = useMemo(() => {
    if (selectedStage !== "sowing") return null;

    let treated = 0;
    let untreated = 0;
    const productMap: Record<string, number> = {};

    filteredData.forEach((item: any) => {
      // Boolean value from API
      if (item.seed_treatment === true) {
        treated++;
        if (item.seed_treatment_product && item.seed_treatment_product.toString().trim() !== "") {
          const product = item.seed_treatment_product.toString().trim();
          productMap[product] = (productMap[product] || 0) + 1;
        }
      } else {
        untreated++;
      }
    });

    const total = treated + untreated;

    return {
      treated,
      untreated,
      total,
      treatedPercentage: total > 0 ? Math.round((treated / total) * 100) : 0,
      untreatedPercentage: total > 0 ? Math.round((untreated / total) * 100) : 0,
      products: Object.entries(productMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count })),
    };
  }, [selectedStage, filteredData]);

  /* -------- SOWING: Soil Conditioner Stats -------- */
  const soilConditionerData = useMemo(() => {
    if (selectedStage !== "sowing") return null;

    let applied = 0;
    let notApplied = 0;
    const productMap: Record<string, number> = {};

    filteredData.forEach((item: any) => {
      // Boolean value from API
      if (item.soil_conditioner === true) {
        applied++;
        if (item.soil_conditioner_product && item.soil_conditioner_product.toString().trim() !== "") {
          const product = item.soil_conditioner_product.toString().trim();
          productMap[product] = (productMap[product] || 0) + 1;
        }
      } else {
        notApplied++;
      }
    });

    const total = applied + notApplied;

    return {
      applied,
      notApplied,
      total,
      appliedPercentage: total > 0 ? Math.round((applied / total) * 100) : 0,
      notAppliedPercentage: total > 0 ? Math.round((notApplied / total) * 100) : 0,
      products: Object.entries(productMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count })),
    };
  }, [selectedStage, filteredData]);

  /* -------- SOWING: Bio-Stimulant Stats -------- */
  const bioStimulantData = useMemo(() => {
    if (selectedStage !== "sowing") return [];

    const stimulantMap: Record<string, number> = {};

    filteredData.forEach((item: any) => {
      if (item.bio_stimulant && item.bio_stimulant.toString().trim() !== "") {
        const stimulant = item.bio_stimulant.toString().trim();
        stimulantMap[stimulant] = (stimulantMap[stimulant] || 0) + 1;
      }
    });

    return Object.entries(stimulantMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value], index) => ({
        name: name.length > 15 ? name.substring(0, 15) + "..." : name,
        value,
        color: PIE_COLORS[index % PIE_COLORS.length],
        fullName: name,
      }));
  }, [selectedStage, filteredData]);

  /* -------- EMERGENCE: Germination Percentage by Zone -------- */
  const germinationByZoneData = useMemo(() => {
    if (selectedStage !== "emergence") return [];

    const zoneGermMap: Record<string, { total: number; count: number }> = {};

    zones.forEach((zone) => {
      zoneGermMap[zone] = { total: 0, count: 0 };
    });

    filteredData.forEach((item: any) => {
      const itemZones = item.zone_ids || [];
      if (itemZones.length > 0 && item.germination_per) {
        const zone = itemZones[0];
        const germValue = item.germination_per.value;
        if (germValue && typeof germValue === "string") {
          // Extract first number from string like "70-85%-Average"
          const match = germValue.match(/\d+/);
          if (match) {
            const germPercent = parseFloat(match[0]);
            if (!isNaN(germPercent) && zoneGermMap[zone]) {
              zoneGermMap[zone].total += germPercent;
              zoneGermMap[zone].count += 1;
            }
          }
        }
      }
    });

    return zones.map((zone) => {
      const data = zoneGermMap[zone];
      const avgGermination =
        data.count > 0 ? Number((data.total / data.count).toFixed(1)) : 0;

      return {
        name: zone,
        value: avgGermination,
        color: ZONE_COLORS[zone],
      };
    });
  }, [selectedStage, filteredData]);

  /* -------- EMERGENCE: Crop Health Distribution -------- */
  const cropHealthData = useMemo(() => {
    if (selectedStage !== "emergence") return [];

    const healthMap: Record<string, number> = {};

    filteredData.forEach((item: any) => {
      const health = item.crop_health;
      if (health && typeof health === "string") {
        healthMap[health] = (healthMap[health] || 0) + 1;
      }
    });

    return Object.entries(healthMap).map(([name, value], index) => ({
      name,
      value,
      color:
        name === "Healthy"
          ? "#10B981"
          : name === "Moderate"
            ? "#F59E0B"
            : name === "Poor"
              ? "#EF4444"
              : PIE_COLORS[index % PIE_COLORS.length],
    }));
  }, [selectedStage, filteredData]);

  /* -------- TILLERING: Crop Health Distribution -------- */
  const tilleringCropHealthData = useMemo(() => {
    if (selectedStage !== "tillering") return [];

    const healthMap: Record<string, number> = {
      Healthy: 0,
      Fair: 0,
    };

    filteredData.forEach((item: any) => {
      const health = item.crop_health;
      if (health && typeof health === "string") {
        const normalizedHealth = health.trim().toLowerCase();

        // Map various possible values to our standard categories
        if (
          normalizedHealth === "healthy" ||
          normalizedHealth === "good" ||
          normalizedHealth === "excellent"
        ) {
          healthMap["Healthy"] += 1;
        } else if (
          normalizedHealth === "fair" ||
          normalizedHealth === "moderate" ||
          normalizedHealth === "average"
        ) {
          healthMap["Fair"] += 1;
        } else if (normalizedHealth.includes("healthy")) {
          healthMap["Healthy"] += 1;
        } else if (normalizedHealth.includes("fair")) {
          healthMap["Fair"] += 1;
        }
      }
    });

    // Convert to array format, filter out zero counts, and sort
    return Object.entries(healthMap)
      .filter(([_, count]) => count > 0)
      .map(([health, count]) => ({
        health,
        count,
      }))
      .sort((a, b) => {
        // Sort: Healthy first, then Fair
        if (a.health === "Healthy") return -1;
        if (b.health === "Healthy") return 1;
        return 0;
      });
  }, [selectedStage, filteredData]);

  /* -------- TILLERING: Fertilizer Types Distribution -------- */
  const fertilizerTypeData = useMemo(() => {
    if (selectedStage !== "tillering") return [];

    const fertilizerMap: Record<string, number> = {};

    filteredData.forEach((item: any) => {
      if (item.fertilizer_type && Array.isArray(item.fertilizer_type)) {
        item.fertilizer_type.forEach((fert: any) => {
          if (
            fert &&
            typeof fert.fertilizer_type === "string" &&
            fert.fertilizer_type !== "No"
          ) {
            fertilizerMap[fert.fertilizer_type] =
              (fertilizerMap[fert.fertilizer_type] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(fertilizerMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value], index) => ({
        name: name.length > 12 ? name.substring(0, 12) + "..." : name,
        value,
        color: PIE_COLORS[index % PIE_COLORS.length],
        fullName: name,
      }));
  }, [selectedStage, filteredData]);

  /* -------- Calculate Stats -------- */
  const stats = useMemo(() => {
    const totalFields = filteredData.length;
    const activeZones = new Set(
      filteredData
        .map((item: any) => (item.zones || item.zone_ids || [])[0])
        .filter(Boolean),
    ).size;

    return {
      totalFields,
      activeZones,
    };
  }, [filteredData]);

  /* ================= UI STATES ================= */

  if (loading) {
    return (
      <div className="w-full min-h-[600px] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-4 border-t-blue-500 border-slate-200 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
          </div>
        </div>
        <p className="mt-6 text-lg font-medium text-slate-700">
          Loading farm analytics...
        </p>
        <p className="text-sm text-slate-500 mt-2">
          Fetching data from all crop stages
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[600px] flex flex-col items-center justify-center">
        <div className="p-4 rounded-full bg-red-50 mb-4">
          <div className="p-3 rounded-full bg-red-100">
            <div className="h-8 w-8 text-red-500">⚠️</div>
          </div>
        </div>
        <p className="text-lg font-medium text-red-600 mb-2">
          Error Loading Data
        </p>
        <p className="text-slate-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  /* ================= RENDER ================= */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Crop Analytics Dashboard
          </h1>
          <p className="text-slate-600 mt-1">
            Analyze crop performance across different growth stages and zones
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="border border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Crop Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Wheat className="h-4 w-4" />
                Crop
              </label>
              <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select crop" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Crops</SelectItem>
                  {crops.map((crop) => (
                    <SelectItem key={crop} value={crop}>
                      {crop}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Growth Stage Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Growth Stage
              </label>
              <Select value={selectedStage} onValueChange={setSelectedStage}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {growthStages.map((stage) => (
                    <SelectItem key={stage.value} value={stage.value}>
                      <div className="flex items-center gap-2">
                        {stage.icon}
                        {stage.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Zone Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Zone
              </label>
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Zones</SelectItem>
                  {zones.map((zone) => (
                    <SelectItem key={zone} value={zone}>
                      {zone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Total Fields
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.totalFields}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Currently viewing: {selectedStage.replace("-", " ")} stage
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-50">
                <Layers className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Active Zones
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.activeZones}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedZone === "all"
                    ? "Across all zones"
                    : `Zone: ${selectedZone}`}
                </p>
              </div>
              <div className="p-3 rounded-full bg-emerald-50">
                <Globe className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Area - Two Graphs Side by Side */}
      <div>
        {/* Stage Title */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            {growthStages.find((s) => s.value === selectedStage)?.icon}
            {growthStages.find((s) => s.value === selectedStage)?.label}{" "}
            Analytics
            {selectedCrop !== "all" && ` - ${selectedCrop}`}
          </h2>
        </div>

        {/* PRE-SOWING: Two Graphs */}
        {selectedStage === "pre-sowing" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Crop Rotation Patterns */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Crop Rotation Patterns
                </CardTitle>
                <CardDescription className="mt-1">
                  Distribution of crop rotation patterns across zones
                  (Percentage)
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[400px]">
                  {cropRotationByZoneData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={cropRotationByZoneData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="zone"
                          fontSize={12}
                          tickLine={false}
                          axisLine={{ stroke: "#e2e8f0" }}
                        />
                        <YAxis
                          fontSize={12}
                          tickLine={false}
                          axisLine={{ stroke: "#e2e8f0" }}
                          label={{
                            value: "Percentage (%)",
                            angle: -90,
                            position: "insideLeft",
                            offset: 10,
                            fontSize: 12,
                          }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                          formatter={(value, name) => [`${value}%`, name]}
                          labelFormatter={(label) => `Zone: ${label}`}
                        />
                        <Legend />
                        {(() => {
                          // Get all keys except 'zone' to create bars dynamically
                          const dataKeys = Object.keys(
                            cropRotationByZoneData[0] || {},
                          ).filter((key) => key !== "zone");
                          return dataKeys.map((pattern, index) => (
                            <Bar
                              key={pattern}
                              dataKey={pattern}
                              name={pattern}
                              stackId="a"
                              fill={PIE_COLORS[index % PIE_COLORS.length]}
                              radius={[4, 4, 0, 0]}
                            />
                          ));
                        })()}
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500">
                      <BarChart3 className="h-12 w-12 mb-3 text-slate-300" />
                      <p>No crop rotation pattern data available</p>
                      <p className="text-sm mt-1">
                        Crop rotation data will appear as it's recorded
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Average Yield */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <PieIcon className="h-5 w-5 text-emerald-500" />
                  Average Yield Last Year
                </CardTitle>
                <CardDescription className="mt-1">
                  Yield distribution across zones (Mounds/Acre)
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[400px]">
                  {averageYieldByZoneData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={averageYieldByZoneData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          label={(entry) => `${entry.name}: ${entry.value}`}
                        >
                          {averageYieldByZoneData.map((entry, index) => (
                            <Cell
                              key={index}
                              fill={entry.color}
                              stroke="#ffffff"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                          formatter={(value) => [
                            `${value} mounds/acre`,
                            "Average Yield",
                          ]}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500">
                      <PieIcon className="h-12 w-12 mb-3 text-slate-300" />
                      <p>No yield data available</p>
                      <p className="text-sm mt-1">
                        Yield data will appear as it's recorded
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* SOWING: Four Graphs in 2x2 Grid */}
        {selectedStage === "sowing" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Seed Rate by Zone */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Seed Rate by Zone
                </CardTitle>
                <CardDescription className="mt-1">
                  Average seed rate across zones (kg/acre)
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[300px]">
                  {seedRateByZoneData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={seedRateByZoneData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="name"
                          fontSize={12}
                          tickLine={false}
                          axisLine={{ stroke: "#e2e8f0" }}
                        />
                        <YAxis
                          fontSize={12}
                          tickLine={false}
                          axisLine={{ stroke: "#e2e8f0" }}
                          label={{
                            value: "Seed Rate (kg/acre)",
                            angle: -90,
                            position: "insideLeft",
                            offset: 10,
                            fontSize: 12,
                          }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                          formatter={(value) => [`${value} kg/acre`, "Seed Rate"]}
                        />
                        <Bar
                          dataKey="value"
                          name="Seed Rate"
                          radius={[8, 8, 0, 0]}
                          fill={COLORS.secondary}
                        />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500">
                      <BarChart3 className="h-12 w-12 mb-3 text-slate-300" />
                      <p>No seed rate data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Wheat Variety Distribution */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <PieIcon className="h-5 w-5 text-emerald-500" />
                  Wheat Variety Distribution
                </CardTitle>
                <CardDescription className="mt-1">
                  Most commonly used wheat varieties
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[300px]">
                  {wheatVarietyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={wheatVarietyData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          label={(entry) => `${entry.name}: ${entry.value}`}
                        >
                          {wheatVarietyData.map((entry, index) => (
                            <Cell
                              key={index}
                              fill={entry.color}
                              stroke="#ffffff"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                          formatter={(value, name) => [`${value} fields`, name]}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500">
                      <PieIcon className="h-12 w-12 mb-3 text-slate-300" />
                      <p>No variety data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sowing Methods */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Drill className="h-5 w-5 text-purple-500" />
                  Sowing Methods
                </CardTitle>
                <CardDescription className="mt-1">
                  Distribution of sowing methods used
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[300px]">
                  {sowingMethodsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={sowingMethodsData}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          type="number"
                          fontSize={12}
                          tickLine={false}
                          axisLine={{ stroke: "#e2e8f0" }}
                          label={{
                            value: "Number of Fields",
                            position: "insideBottom",
                            offset: -5,
                            fontSize: 12,
                          }}
                        />
                        <YAxis
                          dataKey="name"
                          type="category"
                          fontSize={12}
                          tickLine={false}
                          axisLine={{ stroke: "#e2e8f0" }}
                          width={100}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                          formatter={(value) => [`${value} fields`, "Count"]}
                        />
                        <Bar
                          dataKey="value"
                          name="Fields"
                          radius={[0, 8, 8, 0]}
                        >
                          {sowingMethodsData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                            />
                          ))}
                        </Bar>
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500">
                      <Drill className="h-12 w-12 mb-3 text-slate-300" />
                      <p>No sowing method data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Fertilizer Types */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <FlaskConical className="h-5 w-5 text-amber-500" />
                  Basal Fertilizers Used
                </CardTitle>
                <CardDescription className="mt-1">
                  Most commonly used basal fertilizers
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[300px]">
                  {sowingFertilizerData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sowingFertilizerData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          label={(entry) => `${entry.name}: ${entry.value}`}
                        >
                          {sowingFertilizerData.map((entry, index) => (
                            <Cell
                              key={index}
                              fill={entry.color}
                              stroke="#ffffff"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                          formatter={(value, name) => [`${value} fields`, name]}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500">
                      <FlaskConical className="h-12 w-12 mb-3 text-slate-300" />
                      <p>No fertilizer data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Treatment Statistics */}
            <Card className="border border-slate-200 shadow-sm lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Shield className="h-5 w-5 text-blue-500" />
                  Seed & Soil Treatment Statistics
                </CardTitle>
                <CardDescription className="mt-1">
                  Seed treatment, soil conditioner, and bio-stimulant usage
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[300px]">
                  {/* Seed Treatment */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-emerald-500" />
                      <h4 className="font-medium">Seed Treatment</h4>
                    </div>
                    {seedTreatmentData ? (
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Treated:</span>
                            <span className="font-medium">
                              {seedTreatmentData.treated} fields
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-600">
                              Not Treated:
                            </span>
                            <span className="font-medium">
                              {seedTreatmentData.untreated} fields
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                            <div
                              className="bg-emerald-500 h-2 rounded-full"
                              style={{
                                width: `${seedTreatmentData.treatedPercentage}%`,
                              }}
                            />
                          </div>
                          <div className="text-center text-sm text-slate-600">
                            {seedTreatmentData.treatedPercentage}% treated
                          </div>
                        </div>
                        {seedTreatmentData.products.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-medium mb-2">
                              Top Products:
                            </p>
                            <div className="space-y-1">
                              {seedTreatmentData.products.map((product, idx) => (
                                <div
                                  key={idx}
                                  className="flex justify-between text-sm"
                                >
                                  <span className="text-slate-600 truncate">
                                    {product.name}
                                  </span>
                                  <span className="font-medium">
                                    {product.count} fields
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center text-slate-400 py-4">
                        No seed treatment data
                      </div>
                    )}
                  </div>

                  {/* Soil Conditioner */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-orange-500" />
                      <h4 className="font-medium">Soil Conditioner</h4>
                    </div>
                    {soilConditionerData ? (
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Applied:</span>
                            <span className="font-medium">
                              {soilConditionerData.applied} fields
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-600">
                              Not Applied:
                            </span>
                            <span className="font-medium">
                              {soilConditionerData.notApplied} fields
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                            <div
                              className="bg-orange-500 h-2 rounded-full"
                              style={{
                                width: `${soilConditionerData.appliedPercentage}%`,
                              }}
                            />
                          </div>
                          <div className="text-center text-sm text-slate-600">
                            {soilConditionerData.appliedPercentage}% applied
                          </div>
                        </div>
                        {soilConditionerData.products.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-medium mb-2">
                              Top Products:
                            </p>
                            <div className="space-y-1">
                              {soilConditionerData.products.map((product, idx) => (
                                <div
                                  key={idx}
                                  className="flex justify-between text-sm"
                                >
                                  <span className="text-slate-600 truncate">
                                    {product.name}
                                  </span>
                                  <span className="font-medium">
                                    {product.count} fields
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center text-slate-400 py-4">
                        No soil conditioner data
                      </div>
                    )}
                  </div>

                  {/* Bio-Stimulant */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Droplet className="h-5 w-5 text-purple-500" />
                      <h4 className="font-medium">Bio-Stimulant</h4>
                    </div>
                    <div className="h-[180px]">
                      {bioStimulantData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={bioStimulantData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={30}
                              outerRadius={60}
                              paddingAngle={2}
                            >
                              {bioStimulantData.map((entry, index) => (
                                <Cell
                                  key={index}
                                  fill={entry.color}
                                  stroke="#ffffff"
                                  strokeWidth={2}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "white",
                                border: "1px solid #e2e8f0",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                              }}
                              formatter={(value, name) => [
                                `${value} fields`,
                                name,
                              ]}
                            />
                            <Legend verticalAlign="bottom" height={36} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500">
                          <Droplet className="h-10 w-10 mb-2 text-slate-300" />
                          <p className="text-sm">No bio-stimulant data</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* EMERGENCE: Two Graphs */}
        {selectedStage === "emergence" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Germination Percentage by Zone */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <AreaChart className="h-5 w-5 text-purple-500" />
                  Germination Percentage by Zone
                </CardTitle>
                <CardDescription className="mt-1">
                  Average germination rates across zones (%)
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={germinationByZoneData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        fontSize={12}
                        tickLine={false}
                        axisLine={{ stroke: "#e2e8f0" }}
                      />
                      <YAxis
                        fontSize={12}
                        tickLine={false}
                        axisLine={{ stroke: "#e2e8f0" }}
                        domain={[0, 100]}
                        label={{
                          value: "Germination (%)",
                          angle: -90,
                          position: "insideLeft",
                          offset: 10,
                          fontSize: 12,
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                        formatter={(value) => [`${value}%`, "Germination"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        name="Germination %"
                        stroke={COLORS.accent}
                        fill={COLORS.accent}
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Crop Health Distribution */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <PieIcon className="h-5 w-5 text-emerald-500" />
                  Crop Health Distribution
                </CardTitle>
                <CardDescription className="mt-1">
                  Health status of crops across fields
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={cropHealthData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                      >
                        {cropHealthData.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={entry.color}
                            stroke="#ffffff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                        formatter={(value, name) => [`${value} fields`, name]}
                      />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TILLERING: Two Graphs */}
        {selectedStage === "tillering" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fertilizer Types Distribution */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <PieIcon className="h-5 w-5 text-emerald-500" />
                  Fertilizer Types Used
                </CardTitle>
                <CardDescription className="mt-1">
                  Most commonly used fertilizer types
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={fertilizerTypeData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                      >
                        {fertilizerTypeData.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={entry.color}
                            stroke="#ffffff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                        formatter={(value, name) => [`${value} fields`, name]}
                      />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Crop Health Distribution */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <BarChart3 className="h-5 w-5 text-amber-500" />
                  Crop Health Distribution
                </CardTitle>
                <CardDescription className="mt-1">
                  Health status: Healthy vs Fair
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[400px]">
                  {tilleringCropHealthData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={tilleringCropHealthData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="health"
                          fontSize={12}
                          tickLine={false}
                          axisLine={{ stroke: "#e2e8f0" }}
                        />
                        <YAxis
                          fontSize={12}
                          tickLine={false}
                          axisLine={{ stroke: "#e2e8f0" }}
                          allowDecimals={false}
                          label={{
                            value: "Number of Fields",
                            angle: -90,
                            position: "insideLeft",
                            offset: 10,
                            fontSize: 12,
                          }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                          formatter={(value) => [`${value} fields`, "Count"]}
                          labelFormatter={(label) => `Health Status: ${label}`}
                        />
                        <Bar
                          dataKey="count"
                          name="Fields"
                          radius={[8, 8, 0, 0]}
                        >
                          {tilleringCropHealthData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                entry.health === "Healthy"
                                  ? "#10B981"
                                  : entry.health === "Fair"
                                    ? "#F59E0B"
                                    : COLORS.info
                              }
                            />
                          ))}
                        </Bar>
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500">
                      <TreePine className="h-12 w-12 mb-3 text-slate-300" />
                      <p>No crop health data available for tillering stage</p>
                      <p className="text-sm mt-1">
                        Health data will appear as it's recorded
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* BOOTING: Placeholder (no data yet) */}
        {selectedStage === "booting" && (
          <div className="h-[400px] flex flex-col items-center justify-center text-slate-500">
            <Flower2 className="h-16 w-16 mb-4 text-slate-300" />
            <p className="text-lg font-medium">Booting Stage Analytics</p>
            <p className="text-sm mt-2">
              Booting stage data will be available soon
            </p>
          </div>
        )}
      </div>
    </div>
  );
}