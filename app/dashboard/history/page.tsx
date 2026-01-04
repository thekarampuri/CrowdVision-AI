"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Search, Calendar, Filter, FileText } from "lucide-react"

const mockHistory = [
  {
    id: "ALT-045",
    title: "Critical Density - Main Entrance",
    severity: "critical" as const,
    location: "Building A - Main Entrance",
    cameraId: "CAM-001",
    peopleCount: 412,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
    responseTime: 45,
    actions: "Alert acknowledged, security personnel dispatched",
  },
  {
    id: "ALT-044",
    title: "High Density Warning - Food Court",
    severity: "warning" as const,
    location: "Building B - Food Court",
    cameraId: "CAM-002",
    peopleCount: 298,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    resolvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000),
    responseTime: 25,
    actions: "Monitored, density reduced naturally",
  },
  {
    id: "ALT-043",
    title: "Crowd Buildup - Parking Area",
    severity: "warning" as const,
    location: "Outdoor - West Wing Parking",
    cameraId: "CAM-003",
    peopleCount: 267,
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    resolvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
    responseTime: 30,
    actions: "Traffic control measures applied",
  },
  {
    id: "ALT-042",
    title: "Moderate Density - Exhibition Hall",
    severity: "info" as const,
    location: "Building C - Exhibition Hall",
    cameraId: "CAM-004",
    peopleCount: 215,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    resolvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
    responseTime: 15,
    actions: "No action required, auto-resolved",
  },
  {
    id: "ALT-041",
    title: "Critical Density - Main Entrance",
    severity: "critical" as const,
    location: "Building A - Main Entrance",
    cameraId: "CAM-001",
    peopleCount: 389,
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    resolvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 52 * 60 * 1000),
    responseTime: 52,
    actions: "Emergency protocols activated",
  },
]

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterSeverity, setFilterSeverity] = useState<"all" | "critical" | "warning" | "info">("all")
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d")

  const filteredHistory = mockHistory.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSeverity = filterSeverity === "all" || item.severity === filterSeverity
    return matchesSearch && matchesSeverity
  })

  const handleExportCSV = () => {
    const csvContent = [
      [
        "Alert ID",
        "Title",
        "Severity",
        "Location",
        "Camera ID",
        "People Count",
        "Timestamp",
        "Resolved At",
        "Response Time",
        "Actions",
      ],
      ...filteredHistory.map((item) => [
        item.id,
        item.title,
        item.severity,
        item.location,
        item.cameraId,
        item.peopleCount,
        item.timestamp.toISOString(),
        item.resolvedAt.toISOString(),
        item.responseTime,
        item.actions,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `crowdvision-ai-alert-history-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const avgResponseTime = Math.round(
    filteredHistory.reduce((sum, item) => sum + item.responseTime, 0) / filteredHistory.length,
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Alert History & Logs</h1>
            <p className="text-slate-400">Historical alert records and analytics</p>
          </div>
          <Button
            onClick={handleExportCSV}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-strong rounded-2xl p-4 border border-blue-500/30">
            <div className="text-slate-400 text-xs mb-2">Total Alerts</div>
            <div className="text-white text-3xl font-bold">{filteredHistory.length}</div>
          </div>

          <div className="glass-strong rounded-2xl p-4 border border-cyan-500/30">
            <div className="text-slate-400 text-xs mb-2">Avg Response Time</div>
            <div className="text-white text-3xl font-bold">{avgResponseTime}m</div>
          </div>

          <div className="glass-strong rounded-2xl p-4 border border-red-500/30">
            <div className="text-slate-400 text-xs mb-2">Critical Alerts</div>
            <div className="text-white text-3xl font-bold">
              {filteredHistory.filter((a) => a.severity === "critical").length}
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-4 border border-green-500/30">
            <div className="text-slate-400 text-xs mb-2">Resolution Rate</div>
            <div className="text-white text-3xl font-bold">100%</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass border-white/20 bg-white/5 text-white placeholder:text-slate-500 pl-12 h-12"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="glass rounded-xl p-1 flex items-center gap-1">
              <Filter className="w-4 h-4 text-slate-400 mx-2" />
              {(["all", "critical", "warning", "info"] as const).map((severity) => (
                <Button
                  key={severity}
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilterSeverity(severity)}
                  className={
                    filterSeverity === severity
                      ? severity === "critical"
                        ? "bg-gradient-to-r from-red-500 to-orange-500 text-white"
                        : severity === "warning"
                          ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                          : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }
                >
                  {severity.charAt(0).toUpperCase() + severity.slice(1)}
                </Button>
              ))}
            </div>

            <div className="glass rounded-xl p-1 flex items-center gap-1">
              <Calendar className="w-4 h-4 text-slate-400 mx-2" />
              {(["7d", "30d", "90d"] as const).map((range) => (
                <Button
                  key={range}
                  variant="ghost"
                  size="sm"
                  onClick={() => setDateRange(range)}
                  className={
                    dateRange === range
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }
                >
                  {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="glass-strong rounded-3xl overflow-hidden border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10">
                <tr className="text-left">
                  <th className="px-6 py-4 text-sm font-semibold text-slate-400">Alert ID</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-400">Title</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-400">Severity</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-400">Location</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-400">Count</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-400">Date</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-400">Response</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item, index) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-white font-mono text-sm">{item.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white text-sm">{item.title}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.severity === "critical"
                            ? "bg-red-500/20 text-red-400"
                            : item.severity === "warning"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {item.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-400 text-sm">{item.location}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-semibold text-sm">{item.peopleCount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-400 text-sm">{item.timestamp.toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-cyan-400 font-semibold text-sm">{item.responseTime}m</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredHistory.length === 0 && (
          <div className="glass-strong rounded-3xl p-12 text-center">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No history found</h3>
            <p className="text-slate-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
