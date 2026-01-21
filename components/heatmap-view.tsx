"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Users, AlertTriangle } from "lucide-react";
import type { LatLngExpression, Icon, DivIcon } from "leaflet";
import { CameraStorage, type Camera } from "@/lib/camera-storage";

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

const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false },
);

interface HeatmapViewProps {
  showHeatmap: boolean;
  showMarkers: boolean;
  filterRisk: "all" | "low" | "medium" | "high";
}

export function HeatmapView({
  showHeatmap,
  showMarkers,
  filterRisk,
}: HeatmapViewProps) {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [customIcon, setCustomIcon] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    loadCameras();

    // Create custom marker icon
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
      const createColoredIcon = (color: string) => {
        return L.divIcon({
          className: "custom-marker",
          html: `
            <div style="position: relative;">
              <svg width="32" height="45" viewBox="0 0 32 45" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 29 16 29s16-17 16-29c0-8.837-7.163-16-16-16z" fill="${color}"/>
                <circle cx="16" cy="16" r="6" fill="white"/>
              </svg>
            </div>
          `,
          iconSize: [32, 45],
          iconAnchor: [16, 45],
          popupAnchor: [0, -45],
        });
      };

      // Not used anymore - markers are created dynamically
      setCustomIcon({
        low: createColoredIcon("#22c55e"),
        medium: createColoredIcon("#eab308"),
        high: createColoredIcon("#ef4444"),
      });
    }

    // Listen for camera updates
    const handleCamerasUpdated = () => {
      loadCameras();
    };

    window.addEventListener("cameras-updated", handleCamerasUpdated);
    return () =>
      window.removeEventListener("cameras-updated", handleCamerasUpdated);
  }, []);

  const loadCameras = () => {
    const allCameras = CameraStorage.getAllCameras();
    setCameras(allCameras);
  };

  const filteredLocations = cameras.filter((cam) => {
    if (filterRisk === "all") return true;
    return cam.riskLevel === filterRisk;
  });

  const getRiskColor = (level: string | undefined) => {
    switch (level) {
      case "low":
        return "#22c55e";
      case "medium":
        return "#eab308";
      case "high":
        return "#ef4444";
      default:
        return "#64748b";
    }
  };

  // Get dynamic color based on people count
  const getDynamicColor = (peopleCount: number | undefined) => {
    if (!peopleCount || peopleCount === 0) {
      return "#22c55e"; // Green for 0 people
    } else if (peopleCount >= 1 && peopleCount <= 10) {
      return "#eab308"; // Yellow for 1-10 people
    } else {
      return "#ef4444"; // Red for >10 people
    }
  };

  // Calculate map center - Solapur, Maharashtra
  const mapCenter: LatLngExpression = [17.6599, 75.9064];

  if (!isClient) {
    return (
      <div className="relative w-full h-[600px] bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px]">
      <MapContainer
        center={mapCenter}
        zoom={13}
        key={`map-${mapCenter[0]}-${mapCenter[1]}`}
        style={{ height: "100%", width: "100%", background: "#1e293b" }}
        className="z-0 rounded-3xl"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {filteredLocations.map((camera) => {
          const position: LatLngExpression = [
            camera.latitude,
            camera.longitude,
          ];
          const fillColor = getDynamicColor(camera.peopleCount);
          const crowdRadius = camera.radius * 2;

          // Create dynamic marker icon based on people count
          const L = require("leaflet");
          const dynamicIcon = L.divIcon({
            className: "custom-marker",
            html: `
              <div style="position: relative;">
                <svg width="32" height="45" viewBox="0 0 32 45" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 29 16 29s16-17 16-29c0-8.837-7.163-16-16-16z" fill="${fillColor}"/>
                  <circle cx="16" cy="16" r="6" fill="white"/>
                </svg>
              </div>
            `,
            iconSize: [32, 45],
            iconAnchor: [16, 45],
            popupAnchor: [0, -45],
          });

          return (
            <div key={camera.id}>
              {showMarkers && (
                <Marker
                  position={position}
                  icon={dynamicIcon}
                  eventHandlers={{ click: () => setSelectedCamera(camera) }}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold text-sm mb-1">
                        {camera.name}
                      </h3>
                      <p className="text-xs mb-1">ID: {camera.id}</p>
                      <p className="text-xs mb-1">
                        People: {camera.peopleCount || 0}
                      </p>
                      <p className="text-xs mb-1 capitalize">
                        Risk: {camera.riskLevel || "low"}
                      </p>
                      <p className="text-xs">Location: {camera.location}</p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {showHeatmap && (
                <Circle
                  center={position}
                  radius={crowdRadius}
                  pathOptions={{
                    fillColor: fillColor,
                    fillOpacity: 0.3,
                    color: fillColor,
                    weight: 2,
                    opacity: 0.6,
                  }}
                />
              )}
            </div>
          );
        })}
      </MapContainer>

      {/* Camera info panel */}
      {selectedCamera && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-80 glass-strong rounded-2xl p-4 border border-white/10 z-[1000]">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-foreground font-semibold text-lg">
                {selectedCamera.name}
              </h3>
              <p className="text-muted-foreground text-sm">
                {selectedCamera.id}
              </p>
            </div>
            <button
              onClick={() => setSelectedCamera(null)}
              className="text-slate-400 hover:text-white transition-colors text-xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                People Detected
              </span>
              <span className="text-foreground font-semibold">
                {selectedCamera.peopleCount || 0}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Risk Level
              </span>
              <span
                className={`font-semibold ${
                  selectedCamera.riskLevel === "high"
                    ? "text-red-400"
                    : selectedCamera.riskLevel === "medium"
                      ? "text-yellow-400"
                      : "text-green-400"
                }`}
              >
                {(selectedCamera.riskLevel || "low").toUpperCase()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                Coverage Radius
              </span>
              <span className="text-foreground font-semibold">
                {selectedCamera.radius}m
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Location</span>
              <span className="text-foreground text-sm">
                {selectedCamera.location}
              </span>
            </div>

            <div className="pt-2 border-t border-white/10">
              <div className="text-muted-foreground text-xs mb-1">
                Coordinates
              </div>
              <div className="text-foreground text-xs font-mono">
                {selectedCamera.latitude.toFixed(4)},{" "}
                {selectedCamera.longitude.toFixed(4)}
              </div>
            </div>

            <button className="w-full mt-2 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-cyan-600 transition-all">
              View Camera Feed
            </button>
          </div>
        </div>
      )}

      {/* Stats overlay */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-[1000]">
        <div className="glass-strong rounded-xl px-4 py-3">
          <div className="text-muted-foreground text-xs mb-1">
            Total Cameras
          </div>
          <div className="text-white text-2xl font-bold">
            {filteredLocations.length}
          </div>
        </div>
        <div className="glass-strong rounded-xl px-4 py-3">
          <div className="text-slate-400 text-xs mb-1">Total People</div>
          <div className="text-cyan-400 text-2xl font-bold">
            {filteredLocations.reduce(
              (acc, loc) => acc + (loc.peopleCount || 0),
              0,
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
