"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { AlertCard } from "@/components/alert-card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Clock, Filter } from "lucide-react";
import { AlertStorage, type Alert } from "@/lib/alert-storage";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "acknowledged" | "resolved"
  >("all");
  const [filterSeverity, setFilterSeverity] = useState<
    "all" | "critical" | "warning" | "info"
  >("all");

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
      setAlerts(allAlerts);
    } catch (error) {
      console.error("Error loading alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    const matchesStatus =
      filterStatus === "all" || alert.status === filterStatus;
    const matchesSeverity =
      filterSeverity === "all" || alert.severity === filterSeverity;
    return matchesStatus && matchesSeverity;
  });

  const handleAcknowledge = async (alertId: string) => {
    try {
      if (alertId) {
        await AlertStorage.acknowledgeAlert(alertId);
        await loadAlerts();
      }
    } catch (error) {
      console.error("Error acknowledging alert:", error);
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      if (alertId) {
        await AlertStorage.resolveAlert(alertId);
        await loadAlerts();
      }
    } catch (error) {
      console.error("Error resolving alert:", error);
    }
  };

  const activeCount = alerts.filter((a) => a.status === "active").length;
  const criticalCount = alerts.filter(
    (a) => a.severity === "critical" && a.status === "active",
  ).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Alerts & Warnings
            </h1>
            <p className="text-slate-400">
              Real-time alert monitoring and management
            </p>
          </div>
          <div className="flex items-center gap-3">
            {criticalCount > 0 && (
              <div className="glass rounded-xl px-4 py-2 flex items-center gap-2 border border-red-500/50 bg-red-500/10">
                <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
                <span className="text-sm text-red-400 font-semibold">
                  {criticalCount} Critical
                </span>
              </div>
            )}
            <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-sm text-slate-300">
                {activeCount} Active Alerts
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-strong rounded-2xl p-4 border border-red-500/30">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-slate-400 text-sm">Critical</span>
            </div>
            <div className="text-white text-3xl font-bold">
              {alerts.filter((a) => a.severity === "critical").length}
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-4 border border-yellow-500/30">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <span className="text-slate-400 text-sm">Warning</span>
            </div>
            <div className="text-white text-3xl font-bold">
              {alerts.filter((a) => a.severity === "warning").length}
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-4 border border-blue-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="text-slate-400 text-sm">Acknowledged</span>
            </div>
            <div className="text-white text-3xl font-bold">
              {alerts.filter((a) => a.status === "acknowledged").length}
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-4 border border-green-500/30">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-slate-400 text-sm">Resolved</span>
            </div>
            <div className="text-white text-3xl font-bold">
              {alerts.filter((a) => a.status === "resolved").length}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400 text-sm font-medium">Filters:</span>
          </div>

          <div className="glass rounded-xl p-1 flex items-center gap-1">
            <span className="text-slate-400 text-xs px-2">Status:</span>
            {(["all", "active", "acknowledged", "resolved"] as const).map(
              (status) => (
                <Button
                  key={status}
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                  className={
                    filterStatus === status
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ),
            )}
          </div>

          <div className="glass rounded-xl p-1 flex items-center gap-1">
            <span className="text-slate-400 text-xs px-2">Severity:</span>
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
        </div>

        {/* Alerts List */}
        {loading ? (
          <div className="glass-strong rounded-3xl p-12 text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading alerts...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={handleAcknowledge}
                  onResolve={handleResolve}
                />
              ))
            ) : (
              <div className="glass-strong rounded-3xl p-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No alerts found
                </h3>
                <p className="text-slate-400">
                  All systems operating normally or try adjusting your filters
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
