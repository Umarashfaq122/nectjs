"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Leaf,
  ChevronRight,
  Search,
  Filter,
  Download,
  CalendarDays,
  Crop,
  BarChart3,
  Eye,
  X,
  Image as ImageIcon,
  AlertCircle,
  FileText,
  Navigation,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import SimpleMapModal from "@/components/SimpleMapModal";

// Define the Photo type
type Photo = {
  id: number;
  photo: string;
  description: string;
  photo_type: string;
  uploaded_at: string;
  visit: number;
};

type Visit = {
  id: number;
  field_name: string;
  farmer_name: string;
  conducted_by_name: string;
  crop_stage_display: string;
  photos: Photo[]; // Changed from string[] to Photo[]
  visit_date: string;
  visit_time: string;
  latitude: string;
  longitude: string;
  crop: string;
  crop_stage: string;
  photos_of_field_visit: string | null;
  created_at: string;
  field: number;
  conducted_by: number;
  description: string | null;
  farm_photo: string | null;
  // Add other fields from your data if needed
};

export default function VisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [filtered, setFiltered] = useState<Visit[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: string;
    longitude: string;
    name: string;
    cropName: string;
    farmerName: string;
  } | null>(null);

  // Update API URL - make sure it's correct
  const API_URL = "https://rda.ngrok.app/api/visits/";
  const BASE_URL = "https://rda.ngrok.app"; // Add base URL for images

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const res = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      console.log("Fetched visits data:", data);

      if (data.results) {
        // Transform photo URLs to full URLs
        const visitsWithFullPhotoUrls = data.results.map((visit: any) => ({
          ...visit,
          photos: visit.photos?.map((photo: Photo) => ({
            ...photo,
            photo: photo.photo ? `${BASE_URL}${photo.photo}` : photo.photo
          })) || []
        }));
        
        setVisits(visitsWithFullPhotoUrls as Visit[]);
        setFiltered(visitsWithFullPhotoUrls as Visit[]);
      } else {
        console.warn('No "results" key in response');
        setVisits([]);
        setFiltered([]);
      }
    } catch (error) {
      console.error("Error fetching visits:", error);
      setVisits([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  // Filter and sort logic
  useEffect(() => {
    let results = [...visits];

    // Tab filtering
    if (activeTab !== "all") {
      results = results.filter((visit) => {
        if (activeTab === "recent") {
          const visitDate = new Date(visit.visit_date);
          const today = new Date();
          const diffTime = Math.abs(today.getTime() - visitDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 7; // Last 7 days
        }
        if (activeTab === "withPhotos") {
          return visit.photos?.length > 0;
        }
        return true;
      });
    }

    // Search filtering
    if (search.trim() !== "") {
      const searchLower = search.toLowerCase();
      results = results.filter((item) =>
        `${item.farmer_name} ${item.field_name} ${item.crop} ${item.crop_stage_display} ${item.conducted_by_name}`
          .toLowerCase()
          .includes(searchLower)
      );
    }

    // Sorting
    results.sort((a, b) =>
      sortOrder === "newest"
        ? new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime()
        : new Date(a.visit_date).getTime() - new Date(b.visit_date).getTime()
    );

    setFiltered(results);
  }, [search, sortOrder, visits, activeTab]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCropStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      sowing_emergence: "bg-blue-100 text-blue-800",
      vegetative: "bg-green-100 text-green-800",
      flowering: "bg-purple-100 text-purple-800",
      harvesting: "bg-amber-100 text-amber-800",
      "post-harvest": "bg-gray-100 text-gray-800",
      planting: "bg-blue-100 text-blue-800",
    };
    return colors[stage.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  // Helper function to get first photo URL
  const getFirstPhotoUrl = (visit: Visit) => {
    if (visit.photos?.length > 0 && visit.photos[0].photo) {
      return visit.photos[0].photo;
    }
    return null;
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Field Visits</h1>
                <p className="text-gray-600 mt-2">
                  Track and monitor all farm officer activities and field inspections
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={fetchVisits} className="gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700">Total Visits</p>
                      <p className="text-3xl font-bold text-blue-900 mt-2">{visits.length}</p>
                    </div>
                    <BarChart3 className="h-10 w-10 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700">Farmers Visited</p>
                      <p className="text-3xl font-bold text-green-900 mt-2">
                        {[...new Set(visits.map((v) => v.farmer_name))].length}
                      </p>
                    </div>
                    <User className="h-10 w-10 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-700">Photos Taken</p>
                      <p className="text-3xl font-bold text-amber-900 mt-2">
                        {visits.reduce((acc, visit) => acc + (visit.photos?.length || 0), 0)}
                      </p>
                    </div>
                    <ImageIcon className="h-10 w-10 text-amber-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-700">Active Fields</p>
                      <p className="text-3xl font-bold text-purple-900 mt-2">
                        {[...new Set(visits.map((v) => v.field_name))].length}
                      </p>
                    </div>
                    <Navigation className="h-10 w-10 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Controls Section */}
            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-center">
                  <div className="flex-1 w-full lg:w-auto">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search visits by farmer, field, crop, or stage..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 w-full lg:w-[400px]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Tabs defaultValue="all" className="w-full lg:w-auto" onValueChange={setActiveTab}>
                      <TabsList>
                        <TabsTrigger value="all">All Visits</TabsTrigger>
                        <TabsTrigger value="recent">Recent</TabsTrigger>
                        <TabsTrigger value="withPhotos">With Photos</TabsTrigger>
                      </TabsList>
                    </Tabs>

                    <Button
                      variant="outline"
                      onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
                      className="gap-2"
                    >
                      <Filter className="h-4 w-4" />
                      {sortOrder === "newest" ? "Newest First" : "Oldest First"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading field visits...</p>
                </div>
              </div>
            )}

            {/* Results Grid */}
            {!loading && (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {filtered.length} {filtered.length === 1 ? "Visit" : "Visits"} Found
                  </h2>
                  <p className="text-sm text-gray-500">
                    Sorted by {sortOrder === "newest" ? "most recent" : "oldest first"}
                  </p>
                </div>

                {filtered.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="p-12 text-center">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">No visits found</h3>
                      <p className="text-gray-500">
                        {search ? "Try adjusting your search terms" : "No field visits have been recorded yet"}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((visit) => {
                      const firstPhotoUrl = getFirstPhotoUrl(visit);
                      return (
                        <Card
                          key={visit.id}
                          className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-primary/30 overflow-hidden"
                          onClick={() => setSelectedVisit(visit)}
                        >
                          <CardContent className="p-0">
                            {/* Image Section */}
                            <div className="relative h-48 overflow-hidden bg-gray-100">
                              {firstPhotoUrl ? (
                                <img
                                  src={firstPhotoUrl}
                                  alt={visit.field_name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                  <ImageIcon className="h-12 w-12 text-gray-400" />
                                </div>
                              )}
                              <Badge className="absolute top-3 right-3 bg-white/90 text-gray-800 hover:bg-white">
                                {visit.photos?.length || 0} photos
                              </Badge>
                            </div>

                            {/* Content Section */}
                            <div className="p-5">
                              <div className="flex justify-between items-start mb-3">
                                <Badge className={getCropStageColor(visit.crop_stage)}>
                                  {visit.crop_stage_display}
                                </Badge>
                                <span className="text-xs text-gray-500 font-medium">
                                  {formatDate(visit.visit_date)}
                                </span>
                              </div>

                              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                                {visit.farmer_name}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">{visit.field_name}</p>

                              <Separator className="my-4" />

                              <div className="space-y-3">
                                <div className="flex items-center text-sm text-gray-600">
                                  <Crop className="h-4 w-4 mr-2 text-gray-400" />
                                  <span className="font-medium">Crop:</span>
                                  <span className="ml-2 capitalize">{visit.crop}</span>
                                </div>

                                <div className="flex items-center text-sm text-gray-600">
                                  <User className="h-4 w-4 mr-2 text-gray-400" />
                                  <span className="font-medium">Officer:</span>
                                  <span className="ml-2 line-clamp-1">{visit.conducted_by_name}</span>
                                </div>

                                {visit.description && (
                                  <div className="flex items-start text-sm text-gray-600">
                                    <FileText className="h-4 w-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <span className="line-clamp-2">{visit.description}</span>
                                  </div>
                                )}

                                <div className="flex items-center justify-between pt-3">
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {visit.visit_time}
                                  </div>
                                  <Button variant="ghost" size="sm" className="gap-1 text-primary">
                                    View Details
                                    <ChevronRight className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Visit Detail Modal */}
      <Dialog open={!!selectedVisit} onOpenChange={() => setSelectedVisit(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedVisit && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-2xl">Visit Details</DialogTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedVisit(null)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <DialogDescription>Complete field visit information</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Header Info */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{selectedVisit.farmer_name}</h3>
                      <p className="text-gray-700">{selectedVisit.field_name}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        className={`text-sm px-3 py-1 ${getCropStageColor(selectedVisit.crop_stage)}`}
                      >
                        {selectedVisit.crop_stage_display}
                      </Badge>
                      <Badge variant="outline" className="text-sm px-3 py-1">
                        ID: {selectedVisit.id}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        Visit Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-gray-500">Visit Date</label>
                            <p className="font-medium">{formatDate(selectedVisit.visit_date)}</p>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Visit Time</label>
                            <p className="font-medium">{selectedVisit.visit_time}</p>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Recorded On</label>
                            <p className="font-medium">{formatDateTime(selectedVisit.created_at)}</p>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Conducted By</label>
                            <p className="font-medium">{selectedVisit.conducted_by_name}</p>
                          </div>
                        </div>
                        
                        {selectedVisit.description && (
                          <div className="mt-4">
                            <label className="text-sm text-gray-500 block mb-2">Description</label>
                            <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{selectedVisit.description}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Leaf className="h-5 w-5 text-green-600" />
                        Field & Crop Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-gray-500">Crop Type</label>
                          <p className="font-medium capitalize">{selectedVisit.crop}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">Growth Stage</label>
                          <p className="font-medium">{selectedVisit.crop_stage_display}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">Field ID</label>
                          <p className="font-medium">{selectedVisit.field}</p>
                        </div>
                        {selectedVisit.latitude && selectedVisit.longitude && (
                          <div>
                            <label className="text-sm text-gray-500 block mb-2">Location</label>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">
                                {selectedVisit.latitude}, {selectedVisit.longitude}
                              </span>
                             
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Photos Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-amber-600" />
                      Field Photos ({selectedVisit.photos?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedVisit.photos?.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {selectedVisit.photos.map((photo, index) => (
                          <div key={photo.id || index} className="relative group">
                            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                              <img
                                src={photo.photo}
                                alt={`Field photo ${index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `https://via.placeholder.com/300x300?text=Photo+${index + 1}`;
                                }}
                              />
                            </div>
                            {photo.description && (
                              <p className="text-xs text-gray-600 mt-2 line-clamp-2">{photo.description}</p>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <Eye className="h-8 w-8 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed rounded-lg">
                        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No photos were taken during this visit</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setSelectedVisit(null)}>
                    Close
                  </Button>
                  <Button className="gap-2">
                    <Download className="h-4 w-4" />
                    Export Report
                  </Button>
                </DialogFooter>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}