"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  CloudRain,
  Thermometer,
  Droplets,
  Upload,
  FileSpreadsheet,
  ChevronRight,
  Users,
  Calendar,
  ArrowUpRight,
  Phone,
  X,
  Search,
  Filter,
  Download,
  Printer,
  AlertCircle,
  Sprout,
  Sun,
  Wind,
  Cloud,
  Navigation,
  BarChart3,
  Crop,
  TreePine,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API_KEY = "76020ba6211341f98f960025252111";

type Farm = {
  id: number;
  name: string;
  location: string;
  area: string;
  lat: number;
  lng: number;
  status: string;
  currentCrop: string;
  stage: string;
  image: string;
  farmersCount?: number;
  weather?: {
    temp: number;
    humidity: number;
    rainfall: number;
    condition: string;
    icon: string;
    wind_speed: number;
    feels_like: number;
    wind_direction: string;
    pressure: number;
  };
};

type Farmer = {
  serial: number;
  zone: string;
  name: string;
  name_of_contractor: string;
  cnic: string;
  contact: string;
  totalLand: number;
  wheat: number;
  raya: number;
  remarks?: string;
};

export function FarmOverview() {
  const [farms, setFarms] = useState<Farm[]>([
    {
      id: 1,
      name: "Zone-1",
      location: "Chapu",
      area: "1370 acres",
      lat: 29.0970993,
      lng: 72.23509979,
      status: "Active",
      currentCrop: "Wheat",
      stage: "Growth & Tillering",
      image: "/green-farm-field.jpg",
      farmersCount: 16,
    },
    {
      id: 2,
      name: "Zone-2",
      location: "Moujgarh",
      lat: 29.15530014,
      lng: 72.12719727,
      area: "4415 acres",
      status: "Active",
      currentCrop: "Wheat",
      stage: "Pre-Sowing",
      image: "/agricultural-field-maize.jpg",
      farmersCount: 15,
    },
    {
      id: 3,
      name: "Zone-3",
      location: "Moujgarh",
      lat: 29.13689995,
      lng: 72.1135025,
      area: "3074 acres",
      status: "Active",
      currentCrop: "Wheat",
      stage: "Pre-Sowing",
      image: "/agricultural-field-maize.jpg",
      farmersCount: 26,
    },
    {
      id: 4,
      name: "Zone-4",
      location: "Moujgarh",
      area: "3339 acres",
      lat: 29.0984001,
      lng: 72.05619812,
      status: "Active",
      currentCrop: "Wheat / Raya",
      stage: "Pre-Sowing",
      image: "/agricultural-field-maize.jpg",
      farmersCount: 16,
    },
    {
      id: 5,
      name: "Zone-5",
      location: "Moujgarh",
      area: "5622 acres",
      lat: 29.07119942,
      lng: 72.0970993,
      status: "Active",
      currentCrop: "Wheat",
      stage: "Pre-Sowing",
      image: "/agricultural-field-maize.jpg",
      farmersCount: 22,
    },
    {
      id: 6,
      name: "Zone-6",
      location: "Moujgarh",
      area: "5622 acres",
      lat: 29.08320045,
      lng: 72.13790131,
      status: "Active",
      currentCrop: "Wheat",
      stage: "Pre-Sowing",
      image: "/agricultural-field-maize.jpg",
      farmersCount: 21,
    },
  ]);

  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [excelData, setExcelData] = useState<Farmer[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false);

  // Load initial data from localStorage if available
  useEffect(() => {
    const savedData = localStorage.getItem("/farmexcel");
    if (savedData) {
      try {
        setExcelData(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to parse saved data:", e);
      }
    }
  }, []);

  // Fetch weather data for all farms
  useEffect(() => {
    const fetchWeatherForAllFarms = async () => {
      setWeatherLoading(true);
      try {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const dateStr = yesterday.toISOString().split("T")[0];

        const updatedFarms = await Promise.all(
          farms.map(async (farm) => {
            try {
              const url = `https://api.weatherapi.com/v1/history.json?key=${API_KEY}&q=${farm.lat},${farm.lng}&dt=${dateStr}`;
              const res = await fetch(url);

              if (!res.ok)
                throw new Error(`Weather API failed for ${farm.name}`);

              const data = await res.json();
              const day = data?.forecast?.forecastday?.[0]?.day;
              const hourData = data?.forecast?.forecastday?.[0]?.hour?.[12];

              return {
                ...farm,
                weather: {
                  temp: day?.avgtemp_c ?? 20.1,
                  humidity: day?.avghumidity ?? 18,
                  rainfall: day?.totalprecip_mm ?? 0,
                  condition: day?.condition?.text ?? "Overcast",
                  icon: day?.condition?.icon ?? "",
                  wind_speed: hourData?.wind_kph ?? 9,
                  feels_like: hourData?.feelslike_c ?? 23.7,
                  wind_direction: hourData?.wind_dir ?? "NE",
                  pressure: hourData?.pressure_mb ?? 1013,
                },
              };
            } catch (error) {
              console.error(
                `Weather fetch failed for farm ${farm.name}:`,
                error
              );
              return {
                ...farm,
                weather: {
                  temp: 20.1,
                  humidity: 18,
                  rainfall: 0,
                  condition: "Overcast",
                  icon: "//cdn.weatherapi.com/weather/64x64/day/122.png",
                  wind_speed: 9,
                  feels_like: 23.7,
                  wind_direction: "NE",
                  pressure: 1013,
                },
              };
            }
          })
        );

        setFarms(updatedFarms);
      } catch (error) {
        console.error("Failed to fetch weather data:", error);
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeatherForAllFarms();

    const interval = setInterval(fetchWeatherForAllFarms, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFile(file);
    setError(null);
    setIsLoading(true);

    try {
      const XLSX = await import("xlsx");
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          const processedData: Farmer[] = [];

          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i] as any[];
            if (row.length >= 8) {
              processedData.push({
                serial: parseInt(row[0]) || i,
                zone: String(row[1] || "").trim(),
                name: String(row[2] || "").trim(),
                name_of_contractor: String(row[3] || "").trim(),
                cnic: String(row[4] || "").trim(),
                contact: String(row[5] || "").trim(),
                totalLand: parseInt(row[6]) || 0,
                wheat: parseInt(row[7]) || 0,
                raya: parseInt(row[8]) || 0,
                remarks: row[9] ? String(row[9]).trim() : undefined,
              });
            }
          }

          setExcelData(processedData);
          localStorage.setItem(
            "farmerExcelData",
            JSON.stringify(processedData)
          );
          setError(null);
        } catch (parseError) {
          console.error("Parse error:", parseError);
          setError("Failed to parse Excel file. Please check the format.");
        }
      };

      reader.onerror = () => {
        setError("Failed to read file");
      };

      reader.readAsBinaryString(file);
    } catch (error) {
      console.error("Error loading XLSX library:", error);
      setError("Failed to load Excel parser. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (zone: string) => {
    setSelectedZone(zone);

    if (excelData.length > 0) {
      const zoneFarmers = excelData.filter((farmer) =>
        farmer.zone.toLowerCase().includes(zone.toLowerCase())
      );
      setFarmers(zoneFarmers);
    } else {
      setFarmers(getSampleDataByZone(zone));
    }

    setIsModalOpen(true);
  };

  const getSampleDataByZone = (zone: string): Farmer[] => {
    const allSampleData: Farmer[] = [
      {
        serial: 1,
        zone: "Zone-1",
        name: "Chapu",
        name_of_contractor: "Adnan Sarwar s/o M. Sarwar",
        cnic: "31103-3182733-7",
        contact: "349-9635315",
        totalLand: 130,
        wheat: 126,
        raya: 4,
        remarks: "Regular irrigation",
      },
      {
        serial: 2,
        zone: "Zone-1",
        name: "Chapu",
        name_of_contractor: "M Irfan s/o M. Boota",
        cnic: "31103-9439964-5",
        contact: "305-7994353",
        totalLand: 195,
        wheat: 165,
        raya: 30,
        remarks: "Pest control needed",
      },
      {
        serial: 3,
        zone: "Zone-1",
        name: "Chapu",
        name_of_contractor: "M Sajid s/o M Shareef",
        cnic: "31103-1143833-7",
        contact: "346-2588337",
        totalLand: 75,
        wheat: 60,
        raya: 15,
        remarks: "Soil testing complete",
      },
      {
        serial: 4,
        zone: "Zone-1",
        name: "Chapu",
        name_of_contractor: "Brig Mukhtar Bhatti",
        cnic: "37405-0441099-5",
        contact: "300-8545959",
        totalLand: 270,
        wheat: 270,
        raya: 0,
        remarks: "Advanced irrigation system",
      },
      {
        serial: 5,
        zone: "Zone-1",
        name: "Chapu",
        name_of_contractor: "Maj Gen Tahir Masood Bhutta",
        cnic: "61101-9134689-3",
        contact: "343-9826497",
        totalLand: 300,
        wheat: 250,
        raya: 50,
        remarks: "Organic farming",
      },
      {
        serial: 6,
        zone: "Zone-1",
        name: "Chapu",
        name_of_contractor: "Muhammad Ehsan s/o Ghulam Qadir",
        cnic: "31205-1253635-3",
        contact: "300-9624774",
        totalLand: 340,
        wheat: 340,
        raya: 0,
        remarks: "High yield expected",
      },
      {
        serial: 7,
        zone: "Zone-1",
        name: "Chapu",
        name_of_contractor: "Muhammad Kashif s/o Sabir Ali",
        cnic: "31103-8853422-3",
        contact: "347-8291965",
        totalLand: 200,
        wheat: 200,
        raya: 0,
        remarks: "Regular monitoring",
      },
      {
        serial: 8,
        zone: "Zone-1",
        name: "Chapu",
        name_of_contractor: "Rahnawaz s/o Allah Rakha",
        cnic: "33103-0316452-5",
        contact: "345-6854337",
        totalLand: 100,
        wheat: 100,
        raya: 0,
        remarks: "New irrigation installed",
      },
    ];

    return allSampleData.filter((farmer) =>
      farmer.zone.toLowerCase().includes(zone.toLowerCase())
    );
  };

  const calculateTotals = (farmersList: Farmer[]) => {
    return farmersList.reduce(
      (acc, farmer) => ({
        totalLand: acc.totalLand + farmer.totalLand,
        totalWheat: acc.totalWheat + farmer.wheat,
        totalRaya: acc.totalRaya + farmer.raya,
        farmerCount: acc.farmerCount + 1,
      }),
      { totalLand: 0, totalWheat: 0, totalRaya: 0, farmerCount: 0 }
    );
  };

  const zoneTotals = calculateTotals(farmers);

  const filteredFarmers = farmers.filter((farmer) => {
    const matchesSearch =
      farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.name_of_contractor
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      farmer.cnic.includes(searchTerm) ||
      farmer.contact.includes(searchTerm);

    let matchesFilter = true;
    if (statusFilter === "wheat") matchesFilter = farmer.wheat > 0;
    if (statusFilter === "raya") matchesFilter = farmer.raya > 0;
    if (statusFilter === "both")
      matchesFilter = farmer.wheat > 0 && farmer.raya > 0;

    return matchesSearch && matchesFilter;
  });

  return (
    <>
      <div className="space-y-6">
        {error && (
          <Alert
            variant="destructive"
            className="animate-in fade-in duration-300"
          >
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Farm Zones Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Farm Zones Overview
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time monitoring of agricultural zones
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="space-y-2">
                <Label htmlFor="excel-upload" className="text-sm font-medium">
                  Upload Farmer Data
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      document.getElementById("excel-upload")?.click()
                    }
                    className="gap-2"
                  >
                    <Upload size={16} />
                    {file ? "Change File" : "Upload Excel"}
                  </Button>
                  {file && (
                    <Badge variant="secondary" className="gap-1">
                      <FileSpreadsheet size={12} />
                      {file.name}
                    </Badge>
                  )}
                </div>
                <Input
                  id="excel-upload"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
            <Badge className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5">
              {farms.length} Active Zones
            </Badge>
          </div>

          {/* Farm Cards */}
          <div className="space-y-4">
            {farms.map((farm) => (
              <Card
                key={farm.id}
                className="overflow-hidden border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="md:flex">
                  {/* Left Section - Farm Info */}
                  <div className="md:w-2/5 p-6 bg-gradient-to-br from-gray-50 to-white border-r border-gray-100">
                    <div className="space-y-4">
                      {/* Zone Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold">
                                {farm.name.split("-")[1]}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">
                                {farm.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className="bg-green-500 hover:bg-green-600 text-white">
                                  <div className="w-2 h-2 rounded-full bg-white mr-1.5"></div>
                                  {farm.status}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {farm.farmersCount || 8} Farmers
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Farm Details */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin size={14} className="text-gray-400" />
                            <span className="font-medium">{farm.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Crop size={14} className="text-gray-400" />
                            <span className="font-medium">
                              {farm.currentCrop}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar size={14} className="text-gray-400" />
                            <span className="font-medium">{farm.stage}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <BarChart3 size={14} className="text-gray-400" />
                            <span className="font-medium">{farm.area}</span>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="pt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">
                            Zone Utilization
                          </span>
                          <span className="font-medium text-gray-900">85%</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>

                      {/* Action Button */}
                      <Button
                        className="w-full mt-6 gap-3 py-5 text-base font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                        onClick={() => handleViewDetails(farm.name)}
                        disabled={isLoading}
                      >
                        <span>View Farmer Details</span>
                        <ChevronRight size={20} />
                      </Button>
                    </div>
                  </div>

                  {/* Right Section - Weather */}
                  <Card className="border border-gray-200 bg-white">
                    <CardContent className="p-5 space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {farm.weather?.icon && (
                            <img
                              src={farm.weather.icon}
                              alt=""
                              className="w-8 h-8"
                            />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {farm.weather?.condition}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Updated{" "}
                              {new Date().toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-semibold text-gray-900">
                            {farm.weather?.temp}°C
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Feels like {farm.weather?.feels_like}°C
                          </p>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t" />

                      {/* Weather Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Humidity
                          </p>
                          <p className="font-medium">
                            {farm.weather?.humidity}%
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">
                            Rainfall
                          </p>
                          <p className="font-medium">
                            {farm.weather?.rainfall} mm
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">Wind</p>
                          <p className="font-medium">
                            {farm.weather?.wind_speed} km/h (
                            {farm.weather?.wind_direction})
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">
                            Pressure
                          </p>
                          <p className="font-medium">
                            {farm.weather?.pressure} mb
                          </p>
                        </div>
                      </div>

                      {/* Advisory */}
                      <div className="bg-gray-50 border rounded-md p-3 text-xs text-gray-600">
                        Weather conditions are suitable for{" "}
                        <strong>{farm.currentCrop}</strong>.
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Modal - Remains the same */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Content */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full h-full max-h-[95vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="border-b p-6 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                      <MapPin className="text-primary" size={24} />
                      {selectedZone} - Farm Management Dashboard
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      {farmers.length} farmers • {zoneTotals.totalLand} total
                      acres • Updated in real-time
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        const element = document.createElement("a");
                        const data = filteredFarmers.map((f) => ({
                          Serial: f.serial,
                          Zone: f.zone,
                          Location: f.name,
                          Contractor: f.name_of_contractor,
                          CNIC: f.cnic,
                          Contact: f.contact,
                          "Total Land (acres)": f.totalLand,
                          "Wheat (acres)": f.wheat,
                          "Raya (acres)": f.raya,
                          Remarks: f.remarks || "",
                        }));
                        const csv =
                          Object.keys(data[0]).join(",") +
                          "\n" +
                          data
                            .map((row) => Object.values(row).join(","))
                            .join("\n");
                        const blob = new Blob([csv], { type: "text/csv" });
                        const url = window.URL.createObjectURL(blob);
                        element.href = url;
                        element.download = `${selectedZone}_farmers_data.csv`;
                        document.body.appendChild(element);
                        element.click();
                        document.body.removeChild(element);
                      }}
                    >
                      <Download size={16} />
                      Export CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => window.print()}
                    >
                      <Printer size={16} />
                      Print
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsModalOpen(false)}
                      className="rounded-full hover:bg-gray-100"
                    >
                      <X size={20} />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 overflow-auto p-6">
                {farmers.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                      <AlertCircle
                        size={32}
                        className="text-muted-foreground"
                      />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      No Data Available
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      No farmer data found for {selectedZone}
                    </p>
                    <Button
                      onClick={() =>
                        document.getElementById("excel-upload")?.click()
                      }
                      className="gap-2"
                    >
                      <Upload size={16} />
                      Upload Excel File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card className="bg-gradient-to-br from-blue-50 to-blue-25 border-blue-200">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-700">
                                Total Land
                              </p>
                              <p className="text-2xl font-bold mt-2">
                                {zoneTotals.totalLand.toLocaleString()} acres
                              </p>
                              <p className="text-xs text-blue-600 mt-1">
                                Overall cultivable area
                              </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                              <MapPin className="text-blue-600" size={20} />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-green-50 to-green-25 border-green-200">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-green-700">
                                Wheat Area
                              </p>
                              <p className="text-2xl font-bold mt-2">
                                {zoneTotals.totalWheat.toLocaleString()} acres
                              </p>
                              <div className="mt-2">
                                <Progress
                                  value={
                                    (zoneTotals.totalWheat /
                                      zoneTotals.totalLand) *
                                    100
                                  }
                                  className="h-2"
                                />
                                <p className="text-xs text-green-600 mt-1">
                                  {Math.round(
                                    (zoneTotals.totalWheat /
                                      zoneTotals.totalLand) *
                                      100
                                  )}
                                  % coverage
                                </p>
                              </div>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                              <span className="text-green-700 text-sm font-bold">
                                {Math.round(
                                  (zoneTotals.totalWheat /
                                    zoneTotals.totalLand) *
                                    100
                                )}
                                %
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-amber-50 to-amber-25 border-amber-200">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-amber-700">
                                Raya Area
                              </p>
                              <p className="text-2xl font-bold mt-2">
                                {zoneTotals.totalRaya.toLocaleString()} acres
                              </p>
                              <div className="mt-2">
                                <Progress
                                  value={
                                    (zoneTotals.totalRaya /
                                      zoneTotals.totalLand) *
                                    100
                                  }
                                  className="h-2"
                                />
                                <p className="text-xs text-amber-600 mt-1">
                                  {Math.round(
                                    (zoneTotals.totalRaya /
                                      zoneTotals.totalLand) *
                                      100
                                  )}
                                  % coverage
                                </p>
                              </div>
                            </div>
                            <div className="p-3 bg-amber-100 rounded-full">
                              <span className="text-amber-700 text-sm font-bold">
                                {Math.round(
                                  (zoneTotals.totalRaya /
                                    zoneTotals.totalLand) *
                                    100
                                )}
                                %
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-purple-50 to-purple-25 border-purple-200">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-purple-700">
                                Total Farmers
                              </p>
                              <p className="text-2xl font-bold mt-2">
                                {zoneTotals.farmerCount}
                              </p>
                              <p className="text-xs text-purple-600 mt-1">
                                Avg.{" "}
                                {Math.round(
                                  zoneTotals.totalLand / zoneTotals.farmerCount
                                )}{" "}
                                acres/farmer
                              </p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                              <Users className="text-purple-600" size={20} />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="flex-1">
                        <div className="relative">
                          <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={18}
                          />
                          <Input
                            placeholder="Search by name, contractor, CNIC, or contact..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-white"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Filter size={16} className="text-gray-500" />
                          <Select
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                          >
                            <SelectTrigger className="w-48 bg-white">
                              <SelectValue placeholder="Filter by crop" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Farmers</SelectItem>
                              <SelectItem value="wheat">Wheat Only</SelectItem>
                              <SelectItem value="raya">Raya Only</SelectItem>
                              <SelectItem value="both">Both Crops</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Badge variant="secondary" className="px-3 py-1">
                          {filteredFarmers.length} results
                        </Badge>
                      </div>
                    </div>

                    {/* Data Table */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[1200px]">
                          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                            <tr>
                              <th className="text-left p-4 font-semibold text-gray-700 w-20">
                                Sr #
                              </th>
                              <th className="text-left p-4 font-semibold text-gray-700 w-32">
                                Zone
                              </th>
                              <th className="text-left p-4 font-semibold text-gray-700 w-40">
                                Location
                              </th>
                              <th className="text-left p-4 font-semibold text-gray-700 min-w-[280px]">
                                Contractor Details
                              </th>
                              <th className="text-left p-4 font-semibold text-gray-700 w-48">
                                CNIC
                              </th>
                              <th className="text-left p-4 font-semibold text-gray-700 w-40">
                                Contact Info
                              </th>
                              <th className="text-left p-4 font-semibold text-gray-700 w-36">
                                Total Land
                              </th>
                              <th className="text-left p-4 font-semibold text-gray-700 w-36">
                                Wheat Area
                              </th>
                              <th className="text-left p-4 font-semibold text-gray-700 w-36">
                                Raya Area
                              </th>
                              <th className="text-left p-4 font-semibold text-gray-700 w-44">
                                Remarks & Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredFarmers.map((farmer) => (
                              <tr
                                key={farmer.serial}
                                className="border-t hover:bg-blue-50/30 transition-colors"
                              >
                                <td className="p-4">
                                  <div className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-700 rounded-lg font-bold">
                                    {farmer.serial}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <Badge
                                    variant="outline"
                                    className="text-xs font-medium"
                                  >
                                    {farmer.zone}
                                  </Badge>
                                </td>
                                <td className="p-4 font-medium text-gray-800">
                                  {farmer.name}
                                </td>
                                <td className="p-4">
                                  <div className="font-semibold text-gray-900">
                                    {farmer.name_of_contractor}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Contractor ID: CTR-
                                    {farmer.serial.toString().padStart(3, "0")}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="font-mono text-sm bg-gray-50 p-2 rounded">
                                    {farmer.cnic}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-2 text-gray-700">
                                    <Phone
                                      size={14}
                                      className="text-gray-400"
                                    />
                                    {farmer.contact}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="text-lg font-bold text-gray-900">
                                    {farmer.totalLand.toLocaleString()} acres
                                  </div>
                                  <Progress
                                    value={100}
                                    className="h-1.5 mt-1 bg-gray-200"
                                  />
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className="font-bold text-green-700">
                                      {farmer.wheat.toLocaleString()} acres
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {Math.round(
                                      (farmer.wheat / farmer.totalLand) * 100
                                    )}
                                    % of land
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                    <span className="font-bold text-amber-700">
                                      {farmer.raya.toLocaleString()} acres
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {Math.round(
                                      (farmer.raya / farmer.totalLand) * 100
                                    )}
                                    % of land
                                  </div>
                                </td>
                                <td className="p-4">
                                  {farmer.remarks ? (
                                    <Badge
                                      variant="secondary"
                                      className={`text-xs font-normal ${
                                        farmer.remarks
                                          .toLowerCase()
                                          .includes("urgent")
                                          ? "bg-red-100 text-red-700 hover:bg-red-100"
                                          : ""
                                      }`}
                                    >
                                      {farmer.remarks}
                                    </Badge>
                                  ) : (
                                    <span className="text-sm text-gray-400">
                                      - No remarks -
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Summary Footer */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <h3 className="font-semibold text-gray-700 mb-3">
                            Zone Performance Summary
                          </h3>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                Wheat Coverage
                              </span>
                              <span className="font-medium text-green-700">
                                {Math.round(
                                  (zoneTotals.totalWheat /
                                    zoneTotals.totalLand) *
                                    100
                                )}
                                %
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                Raya Coverage
                              </span>
                              <span className="font-medium text-amber-700">
                                {Math.round(
                                  (zoneTotals.totalRaya /
                                    zoneTotals.totalLand) *
                                    100
                                )}
                                %
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                Average Land per Farmer
                              </span>
                              <span className="font-medium text-blue-700">
                                {Math.round(
                                  zoneTotals.totalLand / zoneTotals.farmerCount
                                )}{" "}
                                acres
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-700 mb-3">
                            Crop Distribution
                          </h3>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded bg-green-500"></div>
                              <span className="text-sm">
                                Wheat: {zoneTotals.totalWheat.toLocaleString()}{" "}
                                acres
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded bg-amber-500"></div>
                              <span className="text-sm">
                                Raya: {zoneTotals.totalRaya.toLocaleString()}{" "}
                                acres
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <Calendar
                              className="text-amber-600 mt-0.5"
                              size={18}
                            />
                            <div>
                              <p className="text-sm font-medium text-amber-800">
                                Growth Stage: CH & TILLERING
                              </p>
                              <p className="text-xs text-amber-600 mt-1">
                                Active monitoring required. Regular irrigation
                                recommended.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t p-4 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Data last updated: {new Date().toLocaleString()}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Close
                    </Button>
                    <Button onClick={() => window.print()}>
                      <Printer className="mr-2" size={16} />
                      Print Report
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
