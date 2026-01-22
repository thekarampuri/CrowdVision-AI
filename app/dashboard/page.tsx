"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { StatsCard } from "@/components/stats-card";
import { AlertBanner } from "@/components/alert-banner";
import { Users, Camera, AlertTriangle, Shield, Activity } from "lucide-react";
import { CameraStorage } from "@/lib/camera-storage";
import { AlertStorage } from "@/lib/alert-storage";

export default function DashboardPage() {
  const [cameras, setCameras] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalCameras: 0,
    activeCameras: 0,
    totalPeople: 0,
    activeAlerts: 0,
    riskLevel: "Safe" as "Safe" | "Medium" | "Critical",
    lastUpdated: new Date(),
  });

  useEffect(() => {
    loadData();

    // Listen for updates
    const handleCamerasUpdated = () => loadData();
    const handleAlertsUpdated = () => loadData();

    window.addEventListener("cameras-updated", handleCamerasUpdated);
    window.addEventListener("alerts-updated", handleAlertsUpdated);

    // Update every 5 seconds
    const interval = setInterval(() => {
      loadData();
    }, 5000);

    return () => {
      window.removeEventListener("cameras-updated", handleCamerasUpdated);
      window.removeEventListener("alerts-updated", handleAlertsUpdated);
      clearInterval(interval);
    };
  }, []);

  const loadData = async () => {
    try {
      // Load cameras
      const allCameras = CameraStorage.getAllCameras();
      setCameras(allCameras);

      // Load active alerts
      const activeAlerts = await AlertStorage.getActiveAlerts();
      setAlerts(activeAlerts);

      // Calculate stats
      // Count people only from online cameras
      const totalPeople = allCameras.reduce(
        (sum, cam) => sum + (cam.status === "online" ? (cam.peopleCount ?? 0) : 0),
        0,
      );
      const activeCameras = allCameras.filter(
        (c) => c.status === "online",
      ).length;
      const criticalAlerts = activeAlerts.filter(
        (a) => a.severity === "critical",
      ).length;

      // Determine overall risk level
      let riskLevel: "Safe" | "Medium" | "Critical" = "Safe";
      if (criticalAlerts > 0 || totalPeople >= 10) {
        riskLevel = "Critical";
      } else if (totalPeople >= 1 && totalPeople <= 9) {
        riskLevel = "Medium";
      }

      setStats({
        totalCameras: allCameras.length,
        activeCameras: activeCameras,
        totalPeople: totalPeople,
        activeAlerts: activeAlerts.length,
        riskLevel: riskLevel,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "Safe":
        return "text-green-400";
      case "Medium":
        return "text-yellow-400";
      case "Critical":
        return "text-red-400";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Dashboard Overview
            </h1>
            <p className="text-muted-foreground">
              Real-time crowd monitoring and surveillance analytics
            </p>
          </div>
          <div className="glass rounded-2xl px-6 py-3 text-sm">
            <span className="text-muted-foreground">Last updated:</span>
            <span className="ml-2 text-foreground font-mono">
              {stats.lastUpdated.toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Active Alerts Banner */}
        {stats.activeAlerts > 0 && (
          <AlertBanner
            count={stats.activeAlerts}
            message="High crowd density detected - check alerts page"
            severity="warning"
          />
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Active Cameras"
            value={`${stats.activeCameras}/${stats.totalCameras}`}
            icon={Camera}
            color="blue"
          />
          <StatsCard
            title="Total People Detected"
            value={stats.totalPeople.toLocaleString()}
            icon={Users}
            color="cyan"
            isLive
          />
          <StatsCard
            title="Overall Risk Status"
            value={stats.riskLevel}
            icon={Shield}
            color={
              stats.riskLevel === "Safe"
                ? "green"
                : stats.riskLevel === "Medium"
                  ? "yellow"
                  : "red"
            }
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
            <h2 className="text-xl font-semibold text-foreground">
              System Status
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-green-400">
                All Systems Operational
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  AI Detection Engine
                </span>
                <Activity className="w-4 h-4 text-green-400" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-foreground font-semibold">Online</span>
              </div>
              <div className="text-xs text-muted-foreground">
                YOLOv8 Model Active
              </div>
            </div>

            <div className="glass rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Backend API
                </span>
                <Activity className="w-4 h-4 text-green-400" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-foreground font-semibold">Connected</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Firebase Active
              </div>
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
              <div className="text-xs text-muted-foreground">Firestore</div>
            </div>
          </div>
        </div>

        {/* Recent Activity & Camera Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="glass-strong rounded-3xl p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Recent Alerts
            </h2>
            <div className="space-y-3">
              {alerts.length > 0 ? (
                alerts.slice(0, 4).map((alert, index) => {
                  const timeAgo = Math.floor(
                    (Date.now() - new Date(alert.timestamp).getTime()) /
                      (1000 * 60),
                  );
                  return (
                    <div
                      key={index}
                      className="glass rounded-xl p-4 flex items-center gap-4"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          alert.severity === "critical"
                            ? "bg-red-400"
                            : alert.severity === "warning"
                              ? "bg-yellow-400"
                              : "bg-blue-400"
                        }`}
                      />
                      <div className="flex-1">
                        <div className="text-foreground text-sm">
                          {alert.title}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {timeAgo < 1 ? "Just now" : `${timeAgo} min ago`}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">
                    No recent alerts
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Camera Status */}
          <div className="glass-strong rounded-3xl p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Camera Overview
            </h2>
            <div className="space-y-3">
              {cameras.slice(0, 4).map((camera, index) => {
                const peopleCount = camera.peopleCount || 0;
                const riskColor =
                  peopleCount === 0
                    ? "text-green-400"
                    : peopleCount >= 1 && peopleCount <= 9
                      ? "text-yellow-400"
                      : "text-red-400";

                return (
                  <div
                    key={index}
                    className="glass rounded-xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-foreground text-sm font-medium">
                        {camera.name}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {camera.id}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className={`text-sm font-bold ${riskColor}`}>
                          {peopleCount}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          people
                        </div>
                      </div>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          camera.status === "online"
                            ? "bg-green-400"
                            : "bg-red-400"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
              {cameras.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">
                    No cameras configured
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Risk Level Info */}
        <div className="glass-strong rounded-3xl p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Risk Level Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-foreground font-semibold">Safe</span>
              </div>
              <p className="text-muted-foreground text-sm">
                0 people detected across all cameras
              </p>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="text-foreground font-semibold">Medium</span>
              </div>
              <p className="text-muted-foreground text-sm">
                1-9 people detected - monitoring active
              </p>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span className="text-foreground font-semibold">Critical</span>
              </div>
              <p className="text-muted-foreground text-sm">
                10+ people detected - high alert triggered
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
