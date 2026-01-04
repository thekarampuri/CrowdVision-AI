"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { HeatmapView } from "@/components/heatmap-view"
import { Button } from "@/components/ui/button"
import { Layers, MapPin } from "lucide-react"

export default function HeatmapPage() {
  const [showHeatmap, setShowHeatmap] = useState(true)
  const [showMarkers, setShowMarkers] = useState(true)
  const [filterRisk, setFilterRisk] = useState<"all" | "low" | "medium" | "high">("all")

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Geo-Based Heatmap</h1>
            <p className="text-slate-400">Real-time crowd density visualization across all camera zones</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant={showHeatmap ? "default" : "outline"}
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={
              showHeatmap
                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                : "glass border-white/20 text-white hover:bg-white/10 bg-transparent"
            }
          >
            <Layers className="w-4 h-4 mr-2" />
            {showHeatmap ? "Hide" : "Show"} Heatmap
          </Button>

          <Button
            variant={showMarkers ? "default" : "outline"}
            onClick={() => setShowMarkers(!showMarkers)}
            className={
              showMarkers
                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                : "glass border-white/20 text-white hover:bg-white/10 bg-transparent"
            }
          >
            <MapPin className="w-4 h-4 mr-2" />
            {showMarkers ? "Hide" : "Show"} Markers
          </Button>

          <div className="glass rounded-xl p-1 flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilterRisk("all")}
              className={
                filterRisk === "all"
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }
            >
              All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilterRisk("low")}
              className={
                filterRisk === "low"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }
            >
              Low
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilterRisk("medium")}
              className={
                filterRisk === "medium"
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }
            >
              Medium
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilterRisk("high")}
              className={
                filterRisk === "high"
                  ? "bg-gradient-to-r from-red-500 to-orange-500 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }
            >
              High
            </Button>
          </div>
        </div>

        {/* Map */}
        <div className="glass-strong rounded-3xl overflow-hidden border border-white/10">
          <HeatmapView showHeatmap={showHeatmap} showMarkers={showMarkers} filterRisk={filterRisk} />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-strong rounded-2xl p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400" />
              Low Density
            </h3>
            <p className="text-slate-400 text-sm mb-2">0-100 people detected</p>
            <div className="text-green-400 text-xl font-bold">Safe Zone</div>
          </div>

          <div className="glass-strong rounded-2xl p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              Medium Density
            </h3>
            <p className="text-slate-400 text-sm mb-2">101-250 people detected</p>
            <div className="text-yellow-400 text-xl font-bold">Monitor Zone</div>
          </div>

          <div className="glass-strong rounded-2xl p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              High Density
            </h3>
            <p className="text-slate-400 text-sm mb-2">251+ people detected</p>
            <div className="text-red-400 text-xl font-bold">Alert Zone</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
