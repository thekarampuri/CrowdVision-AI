"use client";

import { useEffect, useState } from "react";
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

const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false },
);

export interface CameraLocation {
  id: string;
  name: string;
  position: [number, number];
  crowdDensity?: number;
  status?: "active" | "inactive" | "alert";
}

interface MapProps {
  center?: LatLngExpression;
  zoom?: number;
  cameras?: CameraLocation[];
  height?: string;
  className?: string;
}

export function Map({
  center = [17.6599, 75.9064], // Default to Solapur, Maharashtra
  zoom = 13,
  cameras = [],
  height = "500px",
  className = "",
}: MapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div
        className={`flex items-center justify-center bg-muted/20 rounded-lg ${className}`}
        style={{ height }}
      >
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg overflow-hidden ${className}`}
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {cameras.map((camera) => {
          const fillColor =
            camera.status === "alert"
              ? "#ef4444"
              : camera.status === "inactive"
                ? "#6b7280"
                : "#22c55e";

          const crowdRadius = camera.crowdDensity
            ? Math.min(camera.crowdDensity * 10, 200)
            : 50;

          return (
            <div key={camera.id}>
              <Marker position={camera.position}>
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold text-sm">{camera.name}</h3>
                    {camera.crowdDensity !== undefined && (
                      <p className="text-xs mt-1">
                        Crowd Density: {camera.crowdDensity}
                      </p>
                    )}
                    {camera.status && (
                      <p className="text-xs mt-1 capitalize">
                        Status:{" "}
                        <span
                          className={`font-medium ${
                            camera.status === "alert"
                              ? "text-red-500"
                              : camera.status === "inactive"
                                ? "text-gray-500"
                                : "text-green-500"
                          }`}
                        >
                          {camera.status}
                        </span>
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>

              {camera.crowdDensity !== undefined && (
                <Circle
                  center={camera.position}
                  radius={crowdRadius}
                  pathOptions={{
                    fillColor,
                    fillOpacity: 0.2,
                    color: fillColor,
                    weight: 2,
                  }}
                />
              )}
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default Map;
