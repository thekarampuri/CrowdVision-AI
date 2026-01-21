"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Users, AlertTriangle } from "lucide-react";
import type { LatLngExpression } from "leaflet";
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

  useEffect(() => {
    setIsClient(true);
    loadCameras();

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

  // Calculate map center based on all cameras
  const mapCenter: LatLngExpression =
    cameras.length > 0
      ? [cameras[0].latitude, cameras[0].longitude]
      : [28.614, 77.2091];

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
        zoom={15}
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
          const fillColor = getRiskColor(camera.riskLevel);
          const crowdRadius = camera.radius * 2;

          return (
            <div key={camera.id}>
              {showMarkers && (
                <Marker
                  position={position}
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
