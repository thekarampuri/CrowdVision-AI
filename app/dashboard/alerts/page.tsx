"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { AlertCard } from "@/components/alert-card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Clock, Filter, Download, FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
      // Fetch all alerts to include history
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
        // Event will trigger reload via listener
      }
    } catch (error) {
      console.error("Error acknowledging alert:", error);
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      if (alertId) {
        await AlertStorage.resolveAlert(alertId);
        // Event will trigger reload via listener
      }
    } catch (error) {
      console.error("Error resolving alert:", error);
    }
  };

  const activeCount = alerts.filter((a) => a.status === "active").length;
  const criticalCount = alerts.filter(
    (a) => a.severity === "critical" && a.status === "active",
  ).length;

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text("AI Based Crowd Watcher for Public Safety - Alert Report", 14, 22);

    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Filters: Status=${filterStatus}, Severity=${filterSeverity}`, 14, 36);

    // Table Data
    const tableData = filteredAlerts.map(alert => [
      new Date(alert.timestamp).toLocaleString(),
      alert.cameraName,
      alert.severity.toUpperCase(),
      alert.status.toUpperCase(),
      alert.description,
      `${alert.latitude.toFixed(4)}, ${alert.longitude.toFixed(4)}`
    ]);

    autoTable(doc, {
      startY: 44,
      head: [['Timestamp', 'Camera', 'Severity', 'Status', 'Description', 'Location']],
      body: tableData,
      headStyles: { fillColor: [59, 130, 246] }, // Blue
      alternateRowStyles: { fillColor: [240, 240, 240] },
      styles: { fontSize: 8 },
      columnStyles: {
        4: { cellWidth: 50 } // Description column width
      }
    });

    doc.save(`crowdwatcher-alerts-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Camera Name', 'Severity', 'Status', 'Description', 'Latitude', 'Longitude'];
    const csvContent = [
      headers.join(','),
      ...filteredAlerts.map(alert => [
        alert.id,
        `"${new Date(alert.timestamp).toLocaleString()}"`,
        `"${alert.cameraName}"`,
        alert.severity,
        alert.status,
        `"${alert.description.replace(/"/g, '""')}"`, // Escape quotes
        alert.latitude,
        alert.longitude
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `crowdwatcher-alerts-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Alerts & Logs
            </h1>
            <p className="text-slate-400">
              Real-time monitoring and historical alert records
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
                {activeCount} Active
              </span>
            </div>
          </div>
        </div>

        {/* Export Actions */}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            className="glass border-white/20 text-white hover:bg-white/10 gap-2"
            onClick={handleExportCSV}
            disabled={filteredAlerts.length === 0}
          >
            <FileText className="w-4 h-4" />
            Export CSV
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-500 text-white gap-2"
            onClick={handleExportPDF}
            disabled={filteredAlerts.length === 0}
          >
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
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
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }
                >
                  {status === "all" ? "All History" : status.charAt(0).toUpperCase() + status.slice(1)}
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
                        ? "bg-red-500 text-white shadow-md"
                        : severity === "warning"
                          ? "bg-yellow-500 text-white shadow-md"
                          : "bg-blue-500 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
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
            <p className="text-slate-400">Syncing with database...</p>
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
                  No records matching filters
                </h3>
                <p className="text-slate-400">
                  Try adjusting your status or severity filters to view more logs
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
