"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, ChevronRight, X } from "lucide-react";

/* ================= TYPES ================= */

type Field = {
  id: number;
  zone_ids: string;
  field_name: string;
  location: string;
  farmer_name: string;
  total_area: number;
  cultivatable_area: number;
  ownership_type_display: string;
  subadmin_name: string;
};

type ZoneCard = {
  id: number;
  name: string;
  location: string;
  totalArea: number;
  farmsCount: number;
  fields: Field[];
};

/* ================= COMPONENT ================= */

export function FarmOverview() {
  const [zones, setZones] = useState<ZoneCard[]>([
    { id: 1, name: "Zone-1", location: "—", totalArea: 0, farmsCount: 0, fields: [] },
    { id: 2, name: "Zone-2", location: "—", totalArea: 0, farmsCount: 0, fields: [] },
    { id: 3, name: "Zone-3", location: "—", totalArea: 0, farmsCount: 0, fields: [] },
    { id: 4, name: "Zone-4", location: "—", totalArea: 0, farmsCount: 0, fields: [] },
    { id: 5, name: "Zone-5", location: "—", totalArea: 0, farmsCount: 0, fields: [] },
    { id: 6, name: "Zone-6", location: "—", totalArea: 0, farmsCount: 0, fields: [] },
  ]);

  const [loading, setLoading] = useState(false);
  const [selectedZone, setSelectedZone] = useState<ZoneCard | null>(null);

  /* ================= FETCH ALL FIELDS ================= */

  const fetchAllFields = async (): Promise<Field[]> => {
  const token = localStorage.getItem("authToken");

  let url: string | null = "https://rda.ngrok.app/api/fields/";
  let allFields: Field[] = [];

  try {
    while (url) {
      // 🔥 FORCE HTTPS (CORS FIX)
      const safeUrl:any = url.replace("http://", "https://");

      const res = await fetch(safeUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const json = await res.json();
      console.log("Fetched page farm zones:", safeUrl, json);
      
      allFields.push(...(json.data || []));

      // 🔥 Normalize next URL too
      url = json.next ? json.next.replace("http://", "https://") : null;
    }

    return allFields;
  } catch (error) {
    console.error("Error fetching all fields:", error);
    return [];
  }
};


  /* ================= GROUP DATA ================= */

  const groupByZone = (fields: Field[]) => {
    const map: Record<string, ZoneCard> = {};

    fields.forEach((f) => {
      const zone = f.zone_ids;

      if (!map[zone]) {
        map[zone] = {
          id: Number(zone.split("-")[1]),
          name: zone,
          location: f.location,
          totalArea: 0,
          farmsCount: 0,
          fields: [],
        };
      }

      map[zone].fields.push(f);
      map[zone].farmsCount += 1;
      map[zone].totalArea += Number(f.total_area || 0);
    });

    return map;
  };

  /* ================= LOAD ================= */

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const fields = await fetchAllFields();
      const zoneMap = groupByZone(fields);

      setZones((prev) =>
        prev.map((z) =>
          zoneMap[z.name]
            ? { ...z, ...zoneMap[z.name] }
            : z
        )
      );

      setLoading(false);
    };

    load();
  }, []);

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Farm Zones Overview</h2>

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}

      {/* ================= ZONE CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {zones.map((zone) => (
          <Card key={zone.id} className="hover:shadow-lg transition">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{zone.name}</span>
                <Badge>{zone.farmsCount} Farms</Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={14} />
                <span>{zone.location}</span>
              </div>

              <div className="text-sm font-medium">
                Total Area: {zone.totalArea} acres
              </div>

              <Button
                className="w-full mt-3"
                onClick={() => setSelectedZone(zone)}
                disabled={zone.farmsCount === 0}
              >
                View Farms
                <ChevronRight className="ml-2" size={16} />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ================= MODAL – VIEW FARMS ================= */}
      {selectedZone && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-bold">
                {selectedZone.name} – Farms
              </h3>
              <Button size="icon" variant="ghost" onClick={() => setSelectedZone(null)}>
                <X />
              </Button>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto max-h-[75vh]">
              {selectedZone.fields.map((f) => (
                <div
                  key={f.id}
                  className="border rounded-lg p-4 flex justify-between items-start"
                >
                  <div>
                    <p className="font-semibold">{f.field_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Farmer: {f.farmer_name}
                    </p>
                    <p className="text-sm">
                      Ownership: {f.ownership_type_display}
                    </p>
                    <p className="text-sm">
                      Cultivated Area: {f.cultivatable_area}
                    </p>
                  </div>

                  <div className="text-right font-medium">
                    {f.total_area} acres
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
