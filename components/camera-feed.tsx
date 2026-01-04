"use client"

import { useState } from "react"
import { Camera, Users, Maximize2, Play, Pause, Download, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CameraFeedProps {
  camera: {
    id: string
    name: string
    location: string
    status: "online" | "offline"
    peopleCount: number
    riskLevel: "low" | "medium" | "high"
    fps: number
    resolution: string
    latitude: number
    longitude: number
  }
  viewMode: "grid" | "list"
}

export function CameraFeed({ camera, viewMode }: CameraFeedProps) {
  const [isPaused, setIsPaused] = useState(false)
  const [showFullscreen, setShowFullscreen] = useState(false)

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return { bg: "from-green-500/20 to-emerald-500/20", border: "border-green-500/50", text: "text-green-400" }
      case "medium":
        return { bg: "from-yellow-500/20 to-orange-500/20", border: "border-yellow-500/50", text: "text-yellow-400" }
      case "high":
        return { bg: "from-red-500/20 to-orange-500/20", border: "border-red-500/50", text: "text-red-400" }
      default:
        return { bg: "from-slate-500/20 to-slate-600/20", border: "border-slate-500/50", text: "text-slate-400" }
    }
  }

  const riskColors = getRiskColor(camera.riskLevel)

  if (viewMode === "list") {
    return (
      <div className={`glass-strong rounded-2xl p-4 border ${riskColors.border} flex items-center gap-4`}>
        {/* Video preview */}
        <div className="relative w-48 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-slate-900">
          {camera.status === "online" ? (
            <>
              <img
                src={`/security-camera-view.png?height=128&width=192&query=security camera view ${camera.name}`}
                alt={camera.name}
                className="w-full h-full object-cover"
              />
              {/* Simulated bounding boxes */}
              <div className="absolute inset-0">
                {[...Array(Math.min(camera.peopleCount, 5))].map((_, i) => (
                  <div
                    key={i}
                    className="absolute border-2 border-cyan-400 rounded"
                    style={{
                      left: `${10 + i * 15}%`,
                      top: `${20 + (i % 3) * 20}%`,
                      width: "15%",
                      height: "40%",
                    }}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Camera className="w-8 h-8 text-slate-600" />
            </div>
          )}
        </div>

        {/* Camera info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-white font-semibold text-lg">{camera.name}</h3>
              <p className="text-slate-400 text-sm flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {camera.location}
              </p>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                camera.status === "online" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
              }`}
            >
              {camera.status.toUpperCase()}
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="text-white font-semibold">{camera.peopleCount}</span>
              <span className="text-slate-500">people</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Risk:</span>
              <span className={`font-semibold ${riskColors.text}`}>{camera.riskLevel.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">{camera.fps} FPS</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`glass-strong rounded-3xl overflow-hidden border ${riskColors.border}`}>
      {/* Video feed */}
      <div className="relative aspect-video bg-slate-900 group">
        {camera.status === "online" ? (
          <>
            <img
              src={`/security-camera-view.png?height=360&width=640&query=security camera view ${camera.name}`}
              alt={camera.name}
              className="w-full h-full object-cover"
            />

            {/* Simulated bounding boxes */}
            <div className="absolute inset-0">
              {[...Array(Math.min(camera.peopleCount, 8))].map((_, i) => (
                <div
                  key={i}
                  className="absolute border-2 border-cyan-400 rounded animate-pulse"
                  style={{
                    left: `${5 + (i % 4) * 22}%`,
                    top: `${15 + Math.floor(i / 4) * 35}%`,
                    width: "12%",
                    height: "35%",
                  }}
                >
                  <div className="absolute -top-6 left-0 bg-cyan-400 text-black text-xs px-2 py-0.5 rounded font-mono">
                    P{i + 1}
                  </div>
                </div>
              ))}
            </div>

            {/* Overlay controls */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsPaused(!isPaused)}
                    className="bg-black/50 hover:bg-black/70 text-white"
                  >
                    {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" className="bg-black/50 hover:bg-black/70 text-white">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowFullscreen(true)}
                  className="bg-black/50 hover:bg-black/70 text-white"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Live indicator */}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs text-white font-semibold">LIVE</span>
            </div>

            {/* FPS counter */}
            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-white font-mono">
              {camera.fps} FPS
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <Camera className="w-12 h-12 text-slate-600 mb-2" />
            <span className="text-slate-500 text-sm">Camera Offline</span>
          </div>
        )}
      </div>

      {/* Camera info */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-white font-semibold mb-1">{camera.name}</h3>
            <p className="text-slate-400 text-sm flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {camera.location}
            </p>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              camera.status === "online" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
            }`}
          >
            {camera.status.toUpperCase()}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-400 text-xs">Detected</span>
            </div>
            <div className="text-white text-xl font-bold">{camera.peopleCount}</div>
          </div>

          <div className={`glass rounded-xl p-3 bg-gradient-to-br ${riskColors.bg}`}>
            <div className="text-slate-400 text-xs mb-1">Risk Level</div>
            <div className={`text-xl font-bold ${riskColors.text}`}>{camera.riskLevel.toUpperCase()}</div>
          </div>
        </div>

        {/* Camera ID */}
        <div className="text-slate-500 text-xs font-mono flex items-center justify-between">
          <span>{camera.id}</span>
          <span>{camera.resolution}</span>
        </div>
      </div>
    </div>
  )
}
