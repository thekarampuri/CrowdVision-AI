"use client"

import { useRef, useState } from "react"
import { MapPin, Users, AlertTriangle } from "lucide-react"

interface HeatmapViewProps {
  showHeatmap: boolean
  showMarkers: boolean
  filterRisk: "all" | "low" | "medium" | "high"
}

const cameraLocations = [
  {
    id: "CAM-001",
    name: "Main Entrance",
    lat: 28.6139,
    lng: 77.209,
    peopleCount: 342,
    riskLevel: "high" as const,
    radius: 50,
  },
  {
    id: "CAM-002",
    name: "Food Court",
    lat: 28.6142,
    lng: 77.2095,
    peopleCount: 278,
    riskLevel: "medium" as const,
    radius: 45,
  },
  {
    id: "CAM-003",
    name: "Parking Area",
    lat: 28.6135,
    lng: 77.2088,
    peopleCount: 189,
    riskLevel: "low" as const,
    radius: 60,
  },
  {
    id: "CAM-004",
    name: "Exhibition Hall",
    lat: 28.6145,
    lng: 77.21,
    peopleCount: 156,
    riskLevel: "low" as const,
    radius: 40,
  },
  {
    id: "CAM-005",
    name: "Conference Room",
    lat: 28.614,
    lng: 77.2092,
    peopleCount: 67,
    riskLevel: "low" as const,
    radius: 30,
  },
]

export function HeatmapView({ showHeatmap, showMarkers, filterRisk }: HeatmapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [selectedCamera, setSelectedCamera] = useState<(typeof cameraLocations)[0] | null>(null)

  const filteredLocations = cameraLocations.filter((loc) => {
    if (filterRisk === "all") return true
    return loc.riskLevel === filterRisk
  })

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "bg-green-500"
      case "medium":
        return "bg-yellow-500"
      case "high":
        return "bg-red-500"
      default:
        return "bg-slate-500"
    }
  }

  return (
    <div className="relative w-full h-[600px] bg-slate-900">
      {/* Simulated map background */}
      <div className="absolute inset-0">
        <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800">
          {/* Grid lines to simulate map */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

          {/* Heatmap visualization */}
          {showHeatmap && (
            <div className="absolute inset-0">
              {filteredLocations.map((location, index) => {
                const intensity = location.peopleCount / 350
                const color =
                  location.riskLevel === "high"
                    ? "rgba(239, 68, 68, 0.4)"
                    : location.riskLevel === "medium"
                      ? "rgba(234, 179, 8, 0.4)"
                      : "rgba(34, 197, 94, 0.4)"

                return (
                  <div
                    key={`heatmap-${index}`}
                    className="absolute rounded-full blur-3xl animate-pulse"
                    style={{
                      left: `${20 + index * 15}%`,
                      top: `${30 + (index % 3) * 20}%`,
                      width: `${location.radius * 3}px`,
                      height: `${location.radius * 3}px`,
                      backgroundColor: color,
                      opacity: 0.6 + intensity * 0.4,
                    }}
                  />
                )
              })}
            </div>
          )}

          {/* Camera markers */}
          {showMarkers &&
            filteredLocations.map((location, index) => (
              <div
                key={location.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{
                  left: `${20 + index * 15}%`,
                  top: `${30 + (index % 3) * 20}%`,
                }}
                onClick={() => setSelectedCamera(location)}
              >
                {/* Coverage radius */}
                <div
                  className={`absolute rounded-full border-2 ${
                    location.riskLevel === "high"
                      ? "border-red-400/30"
                      : location.riskLevel === "medium"
                        ? "border-yellow-400/30"
                        : "border-green-400/30"
                  } -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2`}
                  style={{
                    width: `${location.radius * 2}px`,
                    height: `${location.radius * 2}px`,
                  }}
                />

                {/* Marker */}
                <div className="relative">
                  <div
                    className={`w-10 h-10 rounded-full ${getRiskColor(location.riskLevel)} flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110`}
                  >
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 glass rounded-lg px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <span className="text-white text-xs font-semibold">{location.name}</span>
                  </div>
                </div>

                {/* Pulse effect */}
                {location.riskLevel === "high" && (
                  <div
                    className={`absolute w-10 h-10 rounded-full ${getRiskColor(location.riskLevel)} opacity-50 animate-ping`}
                  />
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Map controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button className="w-10 h-10 glass-strong rounded-xl flex items-center justify-center text-white hover:bg-white/10 transition-colors">
          +
        </button>
        <button className="w-10 h-10 glass-strong rounded-xl flex items-center justify-center text-white hover:bg-white/10 transition-colors">
          −
        </button>
      </div>

      {/* Camera info panel */}
      {selectedCamera && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-80 glass-strong rounded-2xl p-4 border border-white/10">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-white font-semibold text-lg">{selectedCamera.name}</h3>
              <p className="text-slate-400 text-sm">{selectedCamera.id}</p>
            </div>
            <button
              onClick={() => setSelectedCamera(null)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                People Detected
              </span>
              <span className="text-white font-semibold">{selectedCamera.peopleCount}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm flex items-center gap-2">
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
                {selectedCamera.riskLevel.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Coverage Radius</span>
              <span className="text-white font-semibold">{selectedCamera.radius}m</span>
            </div>

            <button className="w-full mt-2 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-cyan-600 transition-all">
              View Camera Feed
            </button>
          </div>
        </div>
      )}

      {/* Stats overlay */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <div className="glass-strong rounded-xl px-4 py-3">
          <div className="text-slate-400 text-xs mb-1">Total Cameras</div>
          <div className="text-white text-2xl font-bold">{filteredLocations.length}</div>
        </div>
        <div className="glass-strong rounded-xl px-4 py-3">
          <div className="text-slate-400 text-xs mb-1">Total People</div>
          <div className="text-cyan-400 text-2xl font-bold">
            {filteredLocations.reduce((acc, loc) => acc + loc.peopleCount, 0)}
          </div>
        </div>
      </div>
    </div>
  )
}
