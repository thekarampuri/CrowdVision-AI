"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Filter, FileText } from "lucide-react";
import { AlertStorage, type Alert } from "@/lib/alert-storage";

export default function HistoryPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<
    "all" | "critical" | "warning" | "info"
  >("all");
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d");

  useEffect(() => {
    loadAlerts();

    // Listen for alert updates
    const handleAlertsUpdated = () => {
      loadAlerts();
    };

    window.addEventListener("alerts-updated", handleAlertsUpdated);
    return () =>
      window.removeEventListener("alerts-updated", handleAlertsUpdated);
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const allAlerts = await AlertStorage.getAllAlerts();
      // Only show resolved alerts in history
      const resolvedAlerts = allAlerts.filter((a) => a.status === "resolved");
      setAlerts(resolvedAlerts);
    } catch (error) {
      console.error("Error loading alert history:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = alerts.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.cameraId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity =
      filterSeverity === "all" || item.severity === filterSeverity;

    // Date range filter
    const now = new Date();
    const alertDate = new Date(item.timestamp);
    const daysDiff = Math.floor(
      (now.getTime() - alertDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const matchesDate =
      dateRange === "7d"
        ? daysDiff <= 7
        : dateRange === "30d"
          ? daysDiff <= 30
          : daysDiff <= 90;

    return matchesSearch && matchesSeverity && matchesDate;
  });

  const avgResponseTime =
    filteredHistory.length > 0
      ? Math.round(
          filteredHistory.reduce((sum, item) => {
            if (item.resolvedAt) {
              return (
                sum +
                (new Date(item.resolvedAt).getTime() -
                  new Date(item.timestamp).getTime()) /
                  (1000 * 60)
              );
            }
            return sum;
          }, 0) / filteredHistory.length,
        )
      : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Alert History & Logs
            </h1>
            <p className="text-slate-400">
              Historical alert records and analytics
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-strong rounded-2xl p-4 border border-blue-500/30">
            <div className="text-slate-400 text-xs mb-2">Total Alerts</div>
            <div className="text-white text-3xl font-bold">
              {filteredHistory.length}
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-4 border border-cyan-500/30">
            <div className="text-slate-400 text-xs mb-2">Avg Response Time</div>
            <div className="text-white text-3xl font-bold">
              {avgResponseTime}m
            </div>
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
              {(["all", "critical", "warning", "info"] as const).map(
                (severity) => (
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
                ),
              )}
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
                  {range === "7d"
                    ? "7 Days"
                    : range === "30d"
                      ? "30 Days"
                      : "90 Days"}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* History Table */}
        {loading ? (
          <div className="glass-strong rounded-3xl p-12 text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading alert history...</p>
          </div>
        ) : filteredHistory.length > 0 ? (
          <div className="glass-strong rounded-3xl overflow-hidden border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr className="text-left">
                    <th className="px-6 py-4 text-sm font-semibold text-slate-400">
                      Alert ID
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-400">
                      Title
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-400">
                      Severity
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-400">
                      Location
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-400">
                      Count
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-400">
                      Date
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-400">
                      Response
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((item) => {
                    const responseTime = item.resolvedAt
                      ? Math.round(
                          (new Date(item.resolvedAt).getTime() -
                            new Date(item.timestamp).getTime()) /
                            (1000 * 60),
                        )
                      : 0;

                    return (
                      <tr
                        key={item.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="text-white font-mono text-sm">
                            {item.id?.substring(0, 8) || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white text-sm">
                            {item.title}
                          </span>
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
                          <span className="text-slate-400 text-sm">
                            {item.location}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white font-semibold text-sm">
                            {item.peopleCount}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-400 text-sm">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </span>
                          <br />
                          <span className="text-slate-500 text-xs">
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-cyan-400 font-semibold text-sm">
                            {responseTime}m
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="glass-strong rounded-3xl p-12 text-center">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No history found
            </h3>
            <p className="text-slate-400">
              Try adjusting your search or filters, or no alerts have been
              resolved yet
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
