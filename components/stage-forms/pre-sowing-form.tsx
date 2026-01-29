"use client";

import { useState, useEffect, useRef } from "react";
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
  MapPin,
  Calendar,
  Sprout,
  Leaf,
  CheckCircle,
  XCircle,
  ChevronRight,
  Eye,
  Filter,
  Search,
  Download,
  BarChart3,
  Wheat,
  AlertCircle,
  TrendingUp,
  Package,
  Clock,
  Users,
  Crop,
  LandPlot,
  ChevronDown,
  ChevronUp,
  Loader2,
  Grid,
  List,
  MoreVertical,
  ArrowUpDown,
  Activity,
  PieChart,
  Target,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface FarmActivityData {
  id: number;
  residue_management_display: string;
  field_name: string;
  crop_name: string;
  land_prepared: boolean;
  preparation_date: string | null;
  methods_used: string;
  organic_amendments_used: string;
  residue_management: string;
  expected_sowing_date: string | null;
  reason_not_prepared: string | null;
  created_at: string;
  field: number;
  activity_type?: string;
  status?: string;
  notes?: string;
  farmer_id?: number;
  farmer_name?: string;
  land_preparation_id?: number;
  average_yield?: number;
  cultivated_area_last_year?: number | null;
  planned_area_this_year?: number | null;
  variety_cultivated?: string;
  crop_history_id?: number;
  crop_rotation_pattern?: string;
}

export function PreSowingForm() {
  const [farmActivities, setFarmActivities] = useState<FarmActivityData[]>([]);
  const [filteredData, setFilteredData] = useState<FarmActivityData[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<FarmActivityData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterField, setFilterField] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");
  const [activityTypeFilter, setActivityTypeFilter] = useState("land_preparation");
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [isFiltered, setIsFiltered] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'created_at',
    direction: 'desc'
  });
  
  const fetchedPages = useRef<Set<number>>(new Set());
  const currentPage = useRef<number>(1);

  // Stats calculation
  const totalRecords = farmActivities.length;
  const landPreparedCount = farmActivities.filter(record => record.land_prepared).length;
  const landNotPreparedCount = farmActivities.filter(record => !record.land_prepared).length;
  const uniqueFieldsCount = [...new Set(farmActivities.map(record => record.field))].length;
  const uniqueFarmersCount = [...new Set(farmActivities.filter(record => record.farmer_id).map(record => record.farmer_id))].length;
  const totalPlannedArea = farmActivities.reduce((sum, record) => sum + (record.planned_area_this_year || 0), 0);
  const preparedPercentage = totalRecords > 0 ? (landPreparedCount / totalRecords) * 100 : 0;

  // Unique fields
  const uniqueFields = Array.from(
    new Map(
      farmActivities.map(record => [
        record.field,
        { id: record.field, field_name: record.field_name },
      ])
    ).values()
  );

  // Residue management breakdown
  const residueBreakdown = farmActivities.reduce((acc, record) => {
    const type = record.residue_management?.toLowerCase() || 'not_specified';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  useEffect(() => {
    fetchFarmActivities();
  }, []);

  // Filter and sort data
  useEffect(() => {
    let results = [...farmActivities];
    let filtered = false;

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        record =>
          record.crop_name?.toLowerCase().includes(query) ||
          record.field_name?.toLowerCase().includes(query) ||
          record.farmer_name?.toLowerCase().includes(query) ||
          record.variety_cultivated?.toLowerCase().includes(query)
      );
      filtered = true;
    }

    // Apply field filter
    if (filterField !== "all") {
      const fieldId = parseInt(filterField);
      results = results.filter(record => record.field === fieldId);
      filtered = true;
    }

    // Apply tab filter
    if (activeTab === "prepared") {
      results = results.filter(record => record.land_prepared);
      filtered = true;
    } else if (activeTab === "not-prepared") {
      results = results.filter(record => !record.land_prepared);
      filtered = true;
    } else if (activeTab === "burnt") {
      results = results.filter(record => record.residue_management?.toLowerCase() === "burnt");
      filtered = true;
    } else if (activeTab === "incorporated") {
      results = results.filter(record => record.residue_management?.toLowerCase() === "incorporated");
      filtered = true;
    }

    // Apply activity type filter
    if (activityTypeFilter !== "all") {
      results = results.filter(record => 
        record.activity_type === activityTypeFilter || 
        (!record.activity_type && activityTypeFilter === "land_preparation")
      );
      filtered = true;
    }

    // Apply sorting
    results.sort((a, b) => {
      const aValue = a[sortConfig.key as keyof FarmActivityData];
      const bValue = b[sortConfig.key as keyof FarmActivityData];
      
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

    setFilteredData(results);
    setIsFiltered(filtered);
  }, [searchQuery, filterField, activeTab, farmActivities, activityTypeFilter, sortConfig]);

  const fetchFarmActivities = async () => {
    try {
      setLoading(true);
      fetchedPages.current.clear();
      currentPage.current = 1;
      
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      const response = await fetch("https://rda.ngrok.app/api/farm-activities/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      const activities = data.results || [];
      fetchedPages.current.add(1);
      
      const transformedData = activities.map((activity: any) => ({
        id: activity.id || activity.land_preparation_id || activity.crop_history_id || 0,
        residue_management_display: activity.residue_management_display || "Not specified",
        field_name: activity.field_name || `Field ${activity.field}`,
        crop_name: activity.crop_name || "Not specified",
        land_prepared: activity.land_prepared || false,
        preparation_date: activity.preparation_date || activity.date || activity.created_at,
        methods_used: activity.methods_used || "Not specified",
        organic_amendments_used: activity.organic_amendments_used || "None",
        residue_management: activity.residue_management || "not_specified",
        expected_sowing_date: activity.expected_sowing_date || null,
        reason_not_prepared: activity.reason_not_prepared || null,
        created_at: activity.created_at || activity.date || new Date().toISOString(),
        field: activity.field || 0,
        activity_type: activity.activity_type || "land_preparation",
        status: activity.status || "completed",
        notes: activity.notes || "",
        farmer_id: activity.farmer_id,
        farmer_name: activity.farmer_name,
        land_preparation_id: activity.land_preparation_id,
        average_yield: activity.average_yield,
        cultivated_area_last_year: activity.cultivated_area_last_year,
        planned_area_this_year: activity.planned_area_this_year,
        variety_cultivated: activity.variety_cultivated,
        crop_history_id: activity.crop_history_id,
        crop_rotation_pattern: activity.crop_rotation_pattern,
      }));
      
      setFarmActivities(transformedData);
      setFilteredData(transformedData);
      setNextUrl(data.next || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      console.error("Error fetching farm activities data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreData = async () => {
    if (!nextUrl || isLoadingMore) return;
    
    try {
      setIsLoadingMore(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      if (!token) return;

      const response = await fetch(nextUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      const newActivities = data.results || [];
      
      if (newActivities.length === 0) {
        setNextUrl(null);
        setIsLoadingMore(false);
        return;
      }
      
      const transformedNewData = newActivities.map((activity: any) => ({
        id: activity.id || activity.land_preparation_id || activity.crop_history_id || 0,
        residue_management_display: activity.residue_management_display || "Not specified",
        field_name: activity.field_name || `Field ${activity.field}`,
        crop_name: activity.crop_name || "Not specified",
        land_prepared: activity.land_prepared || false,
        preparation_date: activity.preparation_date || activity.date || activity.created_at,
        methods_used: activity.methods_used || "Not specified",
        organic_amendments_used: activity.organic_amendments_used || "None",
        residue_management: activity.residue_management || "not_specified",
        expected_sowing_date: activity.expected_sowing_date || null,
        reason_not_prepared: activity.reason_not_prepared || null,
        created_at: activity.created_at || activity.date || new Date().toISOString(),
        field: activity.field || 0,
        activity_type: activity.activity_type || "land_preparation",
        status: activity.status || "completed",
        notes: activity.notes || "",
        farmer_id: activity.farmer_id,
        farmer_name: activity.farmer_name,
        land_preparation_id: activity.land_preparation_id,
        average_yield: activity.average_yield,
        cultivated_area_last_year: activity.cultivated_area_last_year,
        planned_area_this_year: activity.planned_area_this_year,
        variety_cultivated: activity.variety_cultivated,
        crop_history_id: activity.crop_history_id,
        crop_rotation_pattern: activity.crop_rotation_pattern,
      }));
      
      setFarmActivities(prev => [...prev, ...transformedNewData]);
      setNextUrl(data.next || null);
      
      if (data.next) {
        try {
          const url = new URL(data.next);
          const pageParam = url.searchParams.get("page");
          if (pageParam) {
            const pageNumber = parseInt(pageParam);
            if (!fetchedPages.current.has(pageNumber)) {
              fetchedPages.current.add(pageNumber);
              currentPage.current = pageNumber;
            }
          }
        } catch (e) {
          console.log("Could not parse page number from URL");
        }
      }
    } catch (err) {
      console.error("Error loading more data:", err);
      setError("Failed to load more data");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="h-3 w-3 ml-1" />;
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-3 w-3 ml-1" /> 
      : <ChevronDown className="h-3 w-3 ml-1" />;
  };

  const getLandPreparedColor = (prepared: boolean) => {
    return prepared 
      ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" 
      : "bg-rose-100 text-rose-800 hover:bg-rose-200";
  };

  const getResidueManagementColor = (management: string) => {
    switch (management?.toLowerCase()) {
      case "burnt": return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      case "incorporated": return "bg-emerald-100 text-emerald-800 hover:bg-emerald-200";
      case "removed": return "bg-sky-100 text-sky-800 hover:bg-sky-200";
      default: return "bg-slate-100 text-slate-800 hover:bg-slate-200";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not scheduled";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  const renderGridCard = (record: FarmActivityData) => {
    const methods = parseMethods(record.methods_used);
    const amendments = parseOrganicAmendments(record.organic_amendments_used);

    return (
      <Card key={`${record.id}-${record.field}`} className="group hover:shadow-lg transition-all duration-300 border border-slate-200 hover:border-primary/50 overflow-hidden">
        <CardContent className="p-0">
          {/* Header with gradient */}
          <div className={`p-4 ${record.land_prepared ? 'bg-gradient-to-r from-emerald-50 to-emerald-100' : 'bg-gradient-to-r from-rose-50 to-rose-100'}`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Wheat className="h-4 w-4 text-emerald-600" />
                  <h3 className="font-semibold text-slate-900 line-clamp-1 capitalize">
                    {record.crop_name}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <MapPin className="h-3 w-3" />
                  <span>{record.field_name}</span>
                  {record.farmer_name && (
                    <>
                      <span>•</span>
                      <span>{record.farmer_name}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <Badge 
                  className={`${getLandPreparedColor(record.land_prepared)} transition-colors`}
                >
                  {record.land_prepared ? "Prepared" : "Not Prepared"}
                </Badge>
                {record.activity_type && (
                  <Badge variant="outline" className="text-xs capitalize bg-white/50 backdrop-blur-sm">
                    {record.activity_type.replace('_', ' ')}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="space-y-3">
              {/* Key metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-lg p-2">
                  <p className="text-xs text-slate-500 mb-1">Variety</p>
                  <p className="text-sm font-medium capitalize">
                    {record.variety_cultivated || "N/A"}
                  </p>
                </div>
                {record.average_yield !== undefined && (
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-xs text-slate-500 mb-1">Avg Yield</p>
                    <p className="text-sm font-medium">
                      {record.average_yield} units
                    </p>
                  </div>
                )}
              </div>

              {/* Date */}
              <div className="flex items-center justify-between py-2 border-y border-slate-100">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Preparation</span>
                </div>
                <span className="font-medium text-sm">
                  {formatDate(record.preparation_date)}
                </span>
              </div>

              {/* Crop rotation */}
              {record.crop_rotation_pattern && (
                <div className="bg-blue-50 p-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Activity className="h-3 w-3 text-blue-600" />
                    <span className="text-xs font-medium text-blue-800">Rotation: </span>
                    <span className="text-xs text-blue-700">{record.crop_rotation_pattern}</span>
                  </div>
                </div>
              )}

              {/* Conditional content */}
              {record.land_prepared ? (
                <>
                  {/* Residue management */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Leaf className="h-4 w-4" />
                      <span className="text-sm">Residue</span>
                    </div>
                    <Badge 
                      className={getResidueManagementColor(record.residue_management)}
                    >
                      {record.residue_management_display || "Not specified"}
                    </Badge>
                  </div>

                  {/* Expected sowing */}
                  {record.expected_sowing_date && (
                    <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-blue-600" />
                        <span className="text-xs font-medium text-blue-800">Sowing: </span>
                        <span className="text-xs text-blue-700">{formatDate(record.expected_sowing_date)}</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-rose-50 p-2 rounded-lg border border-rose-100">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-3 w-3 text-rose-600" />
                    <span className="text-xs font-medium text-rose-800">Reason: </span>
                    <span className="text-xs text-rose-700 line-clamp-1">
                      {record.reason_not_prepared || "No reason provided"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* View button */}
            <Button
              onClick={() => {
                setSelectedRecord(record);
                setIsDetailModalOpen(true);
              }}
              variant="outline"
              className="w-full mt-4 gap-2 group-hover:border-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              size="sm"
            >
              <Eye className="h-4 w-4" />
              View Details
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Footer */}
          <CardFooter className="border-t border-slate-100 bg-slate-50/50 py-3 px-4 flex justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${record.land_prepared ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span>ID: {record.id}</span>
            </div>
            {record.status && (
              <Badge variant="outline" className="text-xs bg-white">
                {record.status}
              </Badge>
            )}
          </CardFooter>
        </CardContent>
      </Card>
    );
  };

  const renderListView = (record: FarmActivityData) => {
    return (
      <div 
        key={`${record.id}-${record.field}`}
        className="group hover:bg-slate-50 transition-colors rounded-lg border border-slate-200 p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className={`p-2 rounded-lg ${record.land_prepared ? 'bg-emerald-100' : 'bg-rose-100'}`}>
              {record.land_prepared ? (
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              ) : (
                <XCircle className="h-5 w-5 text-rose-600" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-semibold text-slate-900 capitalize truncate">
                  {record.crop_name}
                </h3>
                <Badge className={getLandPreparedColor(record.land_prepared)}>
                  {record.land_prepared ? "Prepared" : "Not Prepared"}
                </Badge>
                {record.activity_type && (
                  <Badge variant="outline" className="text-xs capitalize">
                    {record.activity_type.replace('_', ' ')}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {record.field_name}
                </span>
                {record.farmer_name && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {record.farmer_name}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(record.preparation_date)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900 capitalize">
                {record.variety_cultivated || "N/A"}
              </p>
              <p className="text-xs text-slate-500">Variety</p>
            </div>
            
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">
                {record.average_yield ? `${record.average_yield} units` : "N/A"}
              </p>
              <p className="text-xs text-slate-500">Yield</p>
            </div>

            <Button
              onClick={() => {
                setSelectedRecord(record);
                setIsDetailModalOpen(true);
              }}
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const parseMethods = (methods: string) => {
    if (!methods || methods.trim() === "") return ["No methods specified"];
    if (methods.includes("[object Object]")) return ["Various methods"];
    return methods.split(",").map(method => method.trim()).filter(Boolean);
  };

  const parseOrganicAmendments = (amendments: string) => {
    if (!amendments || amendments.trim() === "") return ["None"];
    if (amendments.includes("[object Object]")) return ["Various organic amendments"];
    return amendments.split(",").map(amendment => amendment.trim()).filter(Boolean);
  };

  const renderDetailModal = () => {
    if (!selectedRecord) return null;
    const methods = parseMethods(selectedRecord.methods_used);
    const amendments = parseOrganicAmendments(selectedRecord.organic_amendments_used);

    return (
      <>
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl flex items-center gap-2">
                <div className={`p-2 rounded-lg ${selectedRecord.land_prepared ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                  {selectedRecord.land_prepared ? (
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-rose-600" />
                  )}
                </div>
                <div>
                  <span className="text-2xl font-bold text-slate-900 capitalize">
                    {selectedRecord.crop_name}
                  </span>
                  <p className="text-sm text-slate-600 mt-1">
                    Field {selectedRecord.field} • {selectedRecord.field_name}
                  </p>
                </div>
              </DialogTitle>
            </div>
            <Badge className={getLandPreparedColor(selectedRecord.land_prepared)}>
              {selectedRecord.land_prepared ? "Prepared" : "Not Prepared"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Key Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-slate-500">Crop Variety</Label>
                    <p className="font-medium capitalize">{selectedRecord.variety_cultivated || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Farmer</Label>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-400" />
                      <p className="font-medium">{selectedRecord.farmer_name || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-slate-500">Preparation Date</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <p className="font-medium">{formatDate(selectedRecord.preparation_date)}</p>
                    </div>
                  </div>
                  {selectedRecord.expected_sowing_date && (
                    <div>
                      <Label className="text-xs text-slate-500">Expected Sowing</Label>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <p className="font-medium">{formatDate(selectedRecord.expected_sowing_date)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-slate-500">Residue Management</Label>
                    <Badge className={getResidueManagementColor(selectedRecord.residue_management)}>
                      {selectedRecord.residue_management_display || "N/A"}
                    </Badge>
                  </div>
                  {selectedRecord.crop_rotation_pattern && (
                    <div>
                      <Label className="text-xs text-slate-500">Rotation Pattern</Label>
                      <p className="font-medium">{selectedRecord.crop_rotation_pattern}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedRecord.land_prepared ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-amber-600" />
                      Preparation Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2">Methods Used</Label>
                      <div className="space-y-2">
                        {methods.map((method, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            {method}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium mb-2">Organic Amendments</Label>
                      <div className="space-y-2">
                        {amendments.map((amendment, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {amendment}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-rose-600" />
                    Reason Not Prepared
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-rose-50 p-4 rounded-lg border border-rose-200">
                    <p className="text-rose-800">{selectedRecord.reason_not_prepared || "No reason provided"}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                  Yield & Area
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedRecord.average_yield !== undefined && (
                  <div>
                    <Label className="text-sm font-medium mb-2">Average Yield</Label>
                    <div className="bg-indigo-50 p-3 rounded-lg">
                      <p className="text-xl font-bold text-indigo-700">{selectedRecord.average_yield} units</p>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  {selectedRecord.planned_area_this_year !== null && (
                    <div>
                      <Label className="text-sm font-medium mb-2">Planned Area</Label>
                      <div className="bg-emerald-50 p-3 rounded-lg">
                        <p className="text-lg font-bold text-emerald-700">{selectedRecord.planned_area_this_year} ha</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedRecord.cultivated_area_last_year !== null && (
                    <div>
                      <Label className="text-sm font-medium mb-2">Last Year</Label>
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-lg font-bold text-slate-700">{selectedRecord.cultivated_area_last_year} ha</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notes and Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-slate-600" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm text-slate-500 mb-2">Activity Type</Label>
                  <p className="font-medium capitalize">{selectedRecord.activity_type?.replace('_', ' ') || "Land Preparation"}</p>
                </div>
                
                <div>
                  <Label className="text-sm text-slate-500 mb-2">Status</Label>
                  <Badge variant="outline">{selectedRecord.status || "Completed"}</Badge>
                </div>
                
                <div>
                  <Label className="text-sm text-slate-500 mb-2">Record Created</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <p className="font-medium">{formatDate(selectedRecord.created_at)}</p>
                  </div>
                </div>
              </div>
              
              {selectedRecord.notes && (
                <div className="mt-4">
                  <Label className="text-sm text-slate-500 mb-2">Notes</Label>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-sm">{selectedRecord.notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
            Close
          </Button>
        </DialogFooter>
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
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Farm Activities Dashboard
          </h1>
          <p className="text-slate-600 mt-2">
            Monitor and analyze all farm preparation activities across fields
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchFarmActivities}
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-slate-200 hover:border-primary/50 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Activities</p>
                <h3 className="text-2xl font-bold text-slate-900">{totalRecords}</h3>
                <p className="text-xs text-slate-500 mt-1">{uniqueFieldsCount} fields</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Activity className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 hover:border-emerald-200 transition-colors">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Land Prepared</p>
                  <h3 className="text-2xl font-bold text-emerald-700">{landPreparedCount}</h3>
                </div>
                <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <Progress value={preparedPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 hover:border-rose-200 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Not Prepared</p>
                <h3 className="text-2xl font-bold text-rose-700">{landNotPreparedCount}</h3>
                <p className="text-xs text-rose-500 mt-1">Requires attention</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-rose-100 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 hover:border-blue-200 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Active Farmers</p>
                <h3 className="text-2xl font-bold text-blue-700">{uniqueFarmersCount}</h3>
                <p className="text-xs text-blue-500 mt-1">Managing fields</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 hover:border-purple-200 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Planned Area</p>
                <h3 className="text-2xl font-bold text-purple-700">{totalPlannedArea} ha</h3>
                <p className="text-xs text-purple-500 mt-1">This season</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls Section */}
      <Card className="border-slate-200">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search activities, crops, fields, or farmers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full max-w-md border-slate-300 focus:border-primary"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3">
                <Select value={filterField} onValueChange={setFilterField}>
                  <SelectTrigger className="w-[180px] border-slate-300">
                    <SelectValue placeholder="Filter by field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Fields</SelectItem>
                    {uniqueFields.map((field) => (
                      <SelectItem key={field.id} value={field.id.toString()}>
                        {field.field_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-1 border border-slate-300 rounded-lg p-1">
                  <Button
                    size="sm"
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    onClick={() => setViewMode("grid")}
                    className="h-8 w-8 p-0"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === "list" ? "default" : "ghost"}
                    onClick={() => setViewMode("list")}
                    className="h-8 w-8 p-0"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="prepared">Prepared</TabsTrigger>
                  <TabsTrigger value="not-prepared">Not Prepared</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Showing <span className="font-semibold">{filteredData.length}</span> of{" "}
              <span className="font-semibold">{farmActivities.length}</span> activities
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">Sort by:</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => requestSort("crop_name")}
                  className="gap-1"
                >
                  Crop {getSortIcon("crop_name")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => requestSort("preparation_date")}
                  className="gap-1"
                >
                  Date {getSortIcon("preparation_date")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => requestSort("land_prepared")}
                  className="gap-1"
                >
                  Status {getSortIcon("land_prepared")}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div>
        {filteredData.length === 0 ? (
          <Card className="border-dashed border-slate-300">
            <CardContent className="py-12 text-center">
              <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                No activities found
              </h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                {searchQuery
                  ? "No records match your search criteria. Try different keywords."
                  : "No farm activities have been recorded yet."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredData.map(renderGridCard)}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredData.map(renderListView)}
              </div>
            )}

            {/* Load More */}
            {nextUrl && !isFiltered && (
              <div className="mt-8 text-center">
                <Button
                  variant="outline"
                  onClick={loadMoreData}
                  disabled={isLoadingMore}
                  className="min-w-[200px] gap-2"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Load More Activities
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                        Page {currentPage.current + 1}
                      </span>
                    </>
                  )}
                </Button>
                <p className="text-sm text-slate-500 mt-2">
                  {farmActivities.length} records loaded
                </p>
              </div>
            )}

            {/* Status Messages */}
            {!nextUrl && !isFiltered && farmActivities.length > 0 && (
              <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg">
                  <CheckCircle className="h-4 w-4" />
                  <span>All activities loaded ({farmActivities.length} records)</span>
                </div>
              </div>
            )}

            {isFiltered && (
              <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
                  <Filter className="h-4 w-4" />
                  <span>Showing {filteredData.length} filtered records</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setFilterField("all");
                      setActiveTab("all");
                      setActivityTypeFilter("land_preparation");
                    }}
                    className="ml-2 text-xs"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {renderDetailModal()}
        </DialogContent>
      </Dialog>
    </div>
  );
}