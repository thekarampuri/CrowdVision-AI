"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StatsCard } from "@/components/stats-card"
import { AlertBanner } from "@/components/alert-banner"
import { Users, Camera, AlertTriangle, Shield, Activity } from "lucide-react"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalCameras: 12,
    activeCameras: 10,
    totalPeople: 1847,
    activeAlerts: 3,
    riskLevel: "Medium" as "Safe" | "Medium" | "Critical",
    lastUpdated: new Date(),
  })

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        totalPeople: prev.totalPeople + Math.floor(Math.random() * 20 - 10),
        lastUpdated: new Date(),
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getRiskColor = (level: string) => {
    switch (level) {
      case "Safe":
        return "text-green-400"
      case "Medium":
        return "text-yellow-400"
      case "Critical":
        return "text-red-400"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Overview</h1>
            <p className="text-muted-foreground">Real-time crowd monitoring and surveillance analytics</p>
          </div>
          <div className="glass rounded-2xl px-6 py-3 text-sm">
            <span className="text-muted-foreground">Last updated:</span>
            <span className="ml-2 text-foreground font-mono">{stats.lastUpdated.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Active Alerts Banner */}
        {stats.activeAlerts > 0 && (
          <AlertBanner
            count={stats.activeAlerts}
            message="High crowd density detected in multiple zones"
            severity="warning"
          />
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Active Cameras"
            value={`${stats.activeCameras}/${stats.totalCameras}`}
            icon={Camera}
            trend={{ value: 2, label: "vs last hour" }}
            color="blue"
          />
          <StatsCard
            title="Total People Detected"
            value={stats.totalPeople.toLocaleString()}
            icon={Users}
            trend={{ value: 12, label: "vs last hour" }}
            color="cyan"
            isLive
          />
          <StatsCard
            title="Overall Risk Status"
            value={stats.riskLevel}
            icon={Shield}
            color={stats.riskLevel === "Safe" ? "green" : stats.riskLevel === "Medium" ? "yellow" : "red"}
            customValueClass={getRiskColor(stats.riskLevel)}
          />
          <StatsCard
            title="Active Alerts"
            value={stats.activeAlerts}
            icon={AlertTriangle}
            color="red"
            highlight={stats.activeAlerts > 0}
          />
        </div>

        {/* System Status */}
        <div className="glass-strong rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">System Status</h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-green-400">All Systems Operational</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">AI Detection Engine</span>
                <Activity className="w-4 h-4 text-green-400" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-foreground font-semibold">Online</span>
              </div>
              <div className="text-xs text-muted-foreground">YOLOv8 Model Active</div>
            </div>

            <div className="glass rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Backend API</span>
                <Activity className="w-4 h-4 text-green-400" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-foreground font-semibold">Connected</span>
              </div>
              <div className="text-xs text-muted-foreground">WebSocket Active</div>
            </div>

            <div className="glass rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Database</span>
                <Activity className="w-4 h-4 text-green-400" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-foreground font-semibold">Connected</span>
              </div>
              <div className="text-xs text-muted-foreground">Latency: 24ms</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-strong rounded-3xl p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {[
                { time: "2 min ago", event: "Camera 7 - High density detected", severity: "warning" },
                { time: "5 min ago", event: "Camera 3 - Alert resolved", severity: "success" },
                { time: "12 min ago", event: "Camera 12 - Maintenance scheduled", severity: "info" },
                { time: "18 min ago", event: "Camera 5 - Normal operation resumed", severity: "success" },
              ].map((activity, index) => (
                <div key={index} className="glass rounded-xl p-4 flex items-center gap-4">
                  <div
                    className={`w-2 h-2 rounded-full ${activity.severity === "warning"
                        ? "bg-yellow-400"
                        : activity.severity === "success"
                          ? "bg-green-400"
                          : "bg-blue-400"
                      }`}
                  />
                  <div className="flex-1">
                    <div className="text-foreground text-sm">{activity.event}</div>
                    <div className="text-muted-foreground text-xs">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-strong rounded-3xl p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Top Locations by Density</h2>
            <div className="space-y-4">
              {[
                { name: "Main Entrance", count: 342, level: 85 },
                { name: "Food Court", count: 278, level: 68 },
                { name: "Parking Area", count: 189, level: 45 },
                { name: "Exhibition Hall", count: 156, level: 38 },
              ].map((location, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{location.name}</span>
                    <span className="text-muted-foreground">{location.count} people</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${location.level > 70
                          ? "bg-gradient-to-r from-red-500 to-orange-500"
                          : location.level > 50
                            ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                            : "bg-gradient-to-r from-green-500 to-cyan-500"
                        }`}
                      style={{ width: `${location.level}%` }}
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
