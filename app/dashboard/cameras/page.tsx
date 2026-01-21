"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { WebcamFeed } from "@/components/webcam-feed";
import { AddCameraDialog } from "@/components/add-camera-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Grid3x3, List, Plus } from "lucide-react";
import { CameraStorage, type Camera } from "@/lib/camera-storage";

export default function CamerasPage() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "online" | "offline"
  >("all");
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    // Load cameras from storage
    loadCameras();

    // Listen for camera updates
    const handleCamerasUpdated = () => {
      loadCameras();
    };

    window.addEventListener("cameras-updated", handleCamerasUpdated);
    return () =>
      window.removeEventListener("cameras-updated", handleCamerasUpdated);
  }, []);

  const loadCameras = () => {
    const allCameras = CameraStorage.getAllCameras();
    setCameras(allCameras);
  };

  const handleAddCamera = (cameraData: any) => {
    CameraStorage.addCamera(cameraData);
    setShowAddDialog(false);
    loadCameras();
  };

  const handleDetectionUpdate = (cameraId: string, detections: any) => {
    CameraStorage.updateCameraDetection(
      cameraId,
      detections.count,
      detections.riskLevel,
    );
  };

  const filteredCameras = cameras.filter((camera) => {
    const matchesSearch =
      camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camera.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || camera.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Live Camera Monitoring
            </h1>
            <p className="text-slate-400">
              Real-time webcam feeds with AI-powered crowd detection
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-slate-300">
                {cameras.filter((c) => c.status === "online").length} /{" "}
                {cameras.length} Online
              </span>
            </div>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Camera
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search cameras..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass border-white/20 bg-white/5 text-white placeholder:text-slate-500 pl-12 h-12"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="glass rounded-xl p-1 flex items-center gap-1">
              <Button
                variant={filterStatus === "all" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilterStatus("all")}
                className={
                  filterStatus === "all"
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }
              >
                All
              </Button>
              <Button
                variant={filterStatus === "online" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilterStatus("online")}
                className={
                  filterStatus === "online"
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }
              >
                Online
              </Button>
              <Button
                variant={filterStatus === "offline" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilterStatus("offline")}
                className={
                  filterStatus === "offline"
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }
              >
                Offline
              </Button>
            </div>

            <div className="glass rounded-xl p-1 flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("grid")}
                className={
                  viewMode === "grid"
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-white"
                }
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("list")}
                className={
                  viewMode === "list"
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-white"
                }
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Camera Grid/List */}
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 gap-6"
              : "space-y-4"
          }
        >
          {filteredCameras.map((camera) => (
            <WebcamFeed
              key={camera.id}
              camera={camera}
              viewMode={viewMode}
              onDetectionUpdate={handleDetectionUpdate}
            />
          ))}
        </div>

        {filteredCameras.length === 0 && (
          <div className="glass-strong rounded-3xl p-12 text-center">
            <Filter className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No cameras found
            </h3>
            <p className="text-slate-400">
              Try adjusting your search or filters
            </p>
          </div>
        )}

        {/* Add Camera Dialog */}
        {showAddDialog && (
          <AddCameraDialog
            onAdd={handleAddCamera}
            onClose={() => setShowAddDialog(false)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
