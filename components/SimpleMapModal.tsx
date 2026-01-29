"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Maximize2, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface SimpleMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  latitude: string;
  longitude: string;
  locationName: string;
  cropName?: string;
  farmerName?: string;
  visitDate?: string;
}

const SimpleMapModal = ({ 
  isOpen, 
  onClose, 
  latitude, 
  longitude, 
  locationName,
  cropName = "",
  farmerName = "",
  visitDate = ""
}: SimpleMapModalProps) => {
  const [copied, setCopied] = useState(false);

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  
  const isValidLocation = !isNaN(lat) && !isNaN(lng);
  
  // Google Maps embed URL
  const googleMapsEmbedUrl = isValidLocation 
    ? `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`
    : `https://maps.google.com/maps?q=India&z=6&output=embed`;
  
  // OpenStreetMap embed URL
  const openStreetMapUrl = isValidLocation
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01},${lat-0.01},${lng+0.01},${lat+0.01}&layer=mapnik&marker=${lat},${lng}`
    : `https://www.openstreetmap.org/export/embed.html?bbox=68.1,7.9,97.4,35.5&layer=mapnik`;

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, "_blank");
  };

  const openInOpenStreetMap = () => {
    const url = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`;
    window.open(url, "_blank");
  };

  const getDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(url, "_blank");
  };

  const copyCoordinates = () => {
    navigator.clipboard.writeText(`${latitude}, ${longitude}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <div className="flex flex-col h-[85vh]">
          {/* Header */}
          <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-xl flex items-center gap-2 text-gray-900">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Field Location Map
                </DialogTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {locationName} {farmerName && `• ${farmerName}'s field`}
                </p>
              </div>
              <Badge variant={isValidLocation ? "default" : "secondary"}>
                {isValidLocation ? "📍 GPS Location" : "📍 Approximate Location"}
              </Badge>
            </div>
          </DialogHeader>

          {/* Map Container */}
          <div className="flex-1 relative bg-gray-50">
            {isValidLocation ? (
              <>
                {/* Map Frame */}
                <div className="h-full w-full relative">
                  <iframe
                    src={googleMapsEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Field Location Map"
                    className="absolute inset-0"
                  />
                  
                  {/* Map Controls Overlay */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="gap-2 bg-white/90 backdrop-blur-sm hover:bg-white"
                      onClick={getDirections}
                    >
                      <Navigation className="h-4 w-4" />
                      Directions
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="gap-2 bg-white/90 backdrop-blur-sm hover:bg-white"
                      onClick={openInGoogleMaps}
                    >
                      <Maximize2 className="h-4 w-4" />
                      Open Full Map
                    </Button>
                  </div>
                  
                  {/* Coordinates Overlay */}
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        GPS Coordinates
                      </h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={copyCoordinates}
                        className="h-7 px-2"
                      >
                        {copied ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Latitude</p>
                        <p className="font-mono font-medium">{latitude}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Longitude</p>
                        <p className="font-mono font-medium">{longitude}</p>
                      </div>
                    </div>
                    {farmerName && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-gray-500">Field Information</p>
                        <p className="text-sm font-medium">{farmerName}</p>
                        {cropName && (
                          <p className="text-xs text-gray-600">Crop: {cropName}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <div className="mx-auto w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                    <MapPin className="h-10 w-10 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Location Data Unavailable
                  </h3>
                  <p className="text-gray-600 mb-6">
                    GPS coordinates for this field visit are not available or invalid.
                    You can still navigate to the general area.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" onClick={openInGoogleMaps}>
                      Open India Map
                    </Button>
                    <Button variant="outline" onClick={openInOpenStreetMap}>
                      Open OSM Map
                    </Button>
                  </div>
                  
                  <div className="mt-6 p-4 bg-gray-100 rounded-lg text-left">
                    <p className="text-sm font-medium mb-2">Provided Coordinates:</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Latitude</p>
                        <p className="text-sm">{latitude || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Longitude</p>
                        <p className="text-sm">{longitude || "Not provided"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t bg-white flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {isValidLocation ? (
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  Live location loaded
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  Showing approximate location
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={openInOpenStreetMap}>
                OpenStreetMap
              </Button>
              <Button variant="outline" size="sm" onClick={openInGoogleMaps}>
                Google Maps
              </Button>
              <Button size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleMapModal;