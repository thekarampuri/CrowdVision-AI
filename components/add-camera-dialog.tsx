"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import type { LatLngExpression } from "leaflet";

// Dynamic imports to avoid SSR issues with Leaflet
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);

interface AddCameraDialogProps {
  onAdd: (cameraData: any) => void;
  onClose: () => void;
}

function LocationPicker({
  position,
  setPosition,
  markerIcon,
}: {
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
  markerIcon?: any;
}) {
  const { useMapEvents } = require("react-leaflet");

  useMapEvents({
    click(e: any) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} icon={markerIcon} /> : null;
}

export function AddCameraDialog({ onAdd, onClose }: AddCameraDialogProps) {
  const [isClient, setIsClient] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [customIcon, setCustomIcon] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    latitude: 17.6599,
    longitude: 75.9064,
    radius: 50,
    alertThreshold: 200,
    resolution: "1920x1080",
    fps: 30,
  });

  useEffect(() => {
    setIsClient(true);

    // Create custom marker icon for better visibility
    if (typeof window !== "undefined") {
      const L = require("leaflet");

      // Fix default marker icon issue
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Create custom colored icon
      const icon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="position: relative;">
            <svg width="32" height="45" viewBox="0 0 32 45" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 29 16 29s16-17 16-29c0-8.837-7.163-16-16-16z" fill="#3b82f6"/>
              <circle cx="16" cy="16" r="6" fill="white"/>
            </svg>
          </div>
        `,
        iconSize: [32, 45],
        iconAnchor: [16, 45],
        popupAnchor: [0, -45],
      });

      setCustomIcon(icon);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
  };

  const handleMapPositionChange = (pos: [number, number]) => {
    setFormData({
      ...formData,
      latitude: pos[0],
      longitude: pos[1],
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-strong rounded-3xl p-6 border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Add New Camera</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-200 text-sm">
                Camera Name *
              </Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Main Entrance"
                className="glass border-white/20 bg-white/5 text-white placeholder:text-slate-500 h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-slate-200 text-sm">
                Location *
              </Label>
              <Input
                id="location"
                required
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="e.g., Building A - Ground Floor"
                className="glass border-white/20 bg-white/5 text-white placeholder:text-slate-500 h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="latitude" className="text-slate-200 text-sm">
                Latitude *
              </Label>
              <Input
                id="latitude"
                type="number"
                step="0.0001"
                required
                value={formData.latitude}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    latitude: Number.parseFloat(e.target.value),
                  })
                }
                className="glass border-white/20 bg-white/5 text-white h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude" className="text-slate-200 text-sm">
                Longitude *
              </Label>
              <Input
                id="longitude"
                type="number"
                step="0.0001"
                required
                value={formData.longitude}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    longitude: Number.parseFloat(e.target.value),
                  })
                }
                className="glass border-white/20 bg-white/5 text-white h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="radius" className="text-slate-200 text-sm">
                Coverage Radius (meters) *
              </Label>
              <Input
                id="radius"
                type="number"
                required
                value={formData.radius}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    radius: Number.parseInt(e.target.value),
                  })
                }
                className="glass border-white/20 bg-white/5 text-white h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="threshold" className="text-slate-200 text-sm">
                Alert Threshold (people) *
              </Label>
              <Input
                id="threshold"
                type="number"
                required
                value={formData.alertThreshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    alertThreshold: Number.parseInt(e.target.value),
                  })
                }
                className="glass border-white/20 bg-white/5 text-white h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resolution" className="text-slate-200 text-sm">
                Resolution
              </Label>
              <select
                id="resolution"
                value={formData.resolution}
                onChange={(e) =>
                  setFormData({ ...formData, resolution: e.target.value })
                }
                className="glass border-white/20 bg-white/5 text-white h-10 w-full rounded-xl px-3 outline-none"
              >
                <option value="1920x1080" className="bg-slate-900">
                  1920x1080 (Full HD)
                </option>
                <option value="1280x720" className="bg-slate-900">
                  1280x720 (HD)
                </option>
                <option value="2560x1440" className="bg-slate-900">
                  2560x1440 (2K)
                </option>
                <option value="3840x2160" className="bg-slate-900">
                  3840x2160 (4K)
                </option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fps" className="text-slate-200 text-sm">
                Frame Rate (FPS)
              </Label>
              <Input
                id="fps"
                type="number"
                value={formData.fps}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fps: Number.parseInt(e.target.value),
                  })
                }
                className="glass border-white/20 bg-white/5 text-white h-10"
              />
            </div>
          </div>

          {/* Map Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label className="text-slate-200 text-sm">
                <MapPin className="w-4 h-4 inline mr-2" />
                Select Location on Map
              </Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowMap(!showMap)}
                className="glass border-white/20 text-white bg-transparent h-8"
              >
                {showMap ? "Hide Map" : "Show Map"}
              </Button>
            </div>

            {showMap && (
              <div className="glass rounded-xl overflow-hidden border border-white/10">
                {isClient ? (
                  <div className="h-[300px] relative">
                    <MapContainer
                      center={
                        [
                          formData.latitude,
                          formData.longitude,
                        ] as LatLngExpression
                      }
                      zoom={15}
                      style={{ height: "100%", width: "100%" }}
                      className="z-0"
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <LocationPicker
                        position={[formData.latitude, formData.longitude]}
                        setPosition={handleMapPositionChange}
                        markerIcon={customIcon}
                      />
                    </MapContainer>
                    <div className="absolute bottom-3 left-3 right-3 glass-strong rounded-lg p-2 z-[1000] pointer-events-none">
                      <p className="text-white text-xs text-center">
                        Click on the map to select camera location
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center bg-slate-800/50">
                    <p className="text-slate-400">Loading map...</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            >
              Add Camera
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="glass border-white/20 text-white bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
