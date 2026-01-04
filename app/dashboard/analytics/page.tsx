"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CrowdLineChart } from "@/components/crowd-line-chart"
import { CameraBarChart } from "@/components/camera-bar-chart"
import { Button } from "@/components/ui/button"
import { Calendar, TrendingUp, Clock, BarChart3 } from "lucide-react"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h")
  const [selectedCamera, setSelectedCamera] = useState<string>("all")

  const cameras = [
    { id: "all", name: "All Cameras" },
    { id: "CAM-001", name: "Main Entrance" },
    { id: "CAM-002", name: "Food Court" },
    { id: "CAM-003", name: "Parking Area" },
    { id: "CAM-004", name: "Exhibition Hall" },
    { id: "CAM-005", name: "Conference Room" },
  ]

  const peakHours = [
    { time: "09:00 AM", count: 1247, label: "Morning Rush" },
    { time: "01:00 PM", count: 1893, label: "Lunch Peak" },
    { time: "06:00 PM", count: 2156, label: "Evening Peak" },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Crowd Analytics</h1>
            <p className="text-slate-400">Historical data analysis and trend visualization</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="glass rounded-xl p-1 flex items-center gap-1">
              {(["24h", "7d", "30d"] as const).map((range) => (
                <Button
                  key={range}
                  variant="ghost"
                  size="sm"
                  onClick={() => setTimeRange(range)}
                  className={
                    timeRange === range
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }
                >
                  {range === "24h" ? "24 Hours" : range === "7d" ? "7 Days" : "30 Days"}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-strong rounded-3xl p-6 border border-blue-500/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="text-slate-400 text-sm">Average Crowd</div>
                <div className="text-white text-2xl font-bold">1,247</div>
              </div>
            </div>
            <div className="text-sm text-slate-400">
              <span className="text-green-400 font-semibold">+12.5%</span> vs previous period
            </div>
          </div>

          <div className="glass-strong rounded-3xl p-6 border border-cyan-500/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <div className="text-slate-400 text-sm">Peak Crowd</div>
                <div className="text-white text-2xl font-bold">2,156</div>
              </div>
            </div>
            <div className="text-sm text-slate-400">Recorded at 6:00 PM today</div>
          </div>

          <div className="glass-strong rounded-3xl p-6 border border-purple-500/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <div className="text-slate-400 text-sm">Avg. Duration</div>
                <div className="text-white text-2xl font-bold">4.2h</div>
              </div>
            </div>
            <div className="text-sm text-slate-400">High density periods</div>
          </div>
        </div>

        {/* Time Series Chart */}
        <div className="glass-strong rounded-3xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Crowd Count Over Time</h2>
            <select
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value)}
              className="glass border-white/20 bg-white/5 text-white rounded-xl px-4 py-2 text-sm outline-none"
            >
              {cameras.map((camera) => (
                <option key={camera.id} value={camera.id} className="bg-slate-900">
                  {camera.name}
                </option>
              ))}
            </select>
          </div>
          <CrowdLineChart timeRange={timeRange} cameraId={selectedCamera} />
        </div>

        {/* Camera Comparison */}
        <div className="glass-strong rounded-3xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-6">Camera-wise Density Comparison</h2>
          <CameraBarChart />
        </div>

        {/* Peak Hours */}
        <div className="glass-strong rounded-3xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            Peak Hour Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {peakHours.map((peak, index) => (
              <div key={index} className="glass rounded-2xl p-4 border border-cyan-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-cyan-400 font-semibold">{peak.time}</div>
                  <div className="text-white text-2xl font-bold">{peak.count.toLocaleString()}</div>
                </div>
                <div className="text-slate-400 text-sm">{peak.label}</div>
                <div className="w-full h-2 bg-slate-800 rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    style={{ width: `${(peak.count / 2500) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Density Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-strong rounded-3xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-6">Density Distribution</h2>
            <div className="space-y-4">
              {[
                { label: "Low Density", percentage: 35, color: "from-green-500 to-emerald-500" },
                { label: "Medium Density", percentage: 45, color: "from-yellow-500 to-orange-500" },
                { label: "High Density", percentage: 20, color: "from-red-500 to-orange-500" },
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white">{item.label}</span>
                    <span className="text-slate-400">{item.percentage}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-strong rounded-3xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-6">Hourly Variation Pattern</h2>
            <div className="space-y-3">
              {[
                { time: "00:00 - 06:00", activity: "Low", percentage: 15 },
                { time: "06:00 - 12:00", activity: "Rising", percentage: 65 },
                { time: "12:00 - 18:00", activity: "Peak", percentage: 95 },
                { time: "18:00 - 24:00", activity: "Declining", percentage: 45 },
              ].map((period, index) => (
                <div key={index} className="glass rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{period.time}</span>
                    <span className="text-slate-400 text-sm">{period.activity}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                      style={{ width: `${period.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
