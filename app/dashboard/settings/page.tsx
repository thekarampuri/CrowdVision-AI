"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { CameraManagementCard } from "@/components/camera-management-card";
import { AddCameraDialog } from "@/components/add-camera-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Camera } from "lucide-react";
import { CameraStorage, type Camera as CameraType } from "@/lib/camera-storage";

export default function SettingsPage() {
  const [cameras, setCameras] = useState<CameraType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
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

  const filteredCameras = cameras.filter(
    (camera) =>
      camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camera.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camera.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAddCamera = (cameraData: any) => {
    CameraStorage.addCamera(cameraData);
    setShowAddDialog(false);
    loadCameras();
  };

  const handleUpdateCamera = (cameraId: string, updates: any) => {
    CameraStorage.updateCamera(cameraId, updates);
    loadCameras();
  };

  const handleDeleteCamera = (cameraId: string) => {
    if (confirm("Are you sure you want to delete this camera?")) {
      CameraStorage.deleteCamera(cameraId);
      loadCameras();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Camera Management
            </h1>
            <p className="text-slate-400">
              Configure and manage surveillance cameras
            </p>
          </div>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Camera
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-strong rounded-2xl p-4 border border-blue-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Camera className="w-5 h-5 text-blue-400" />
              <span className="text-slate-400 text-sm">Total Cameras</span>
            </div>
            <div className="text-white text-3xl font-bold">
              {cameras.length}
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-4 border border-green-500/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-slate-400 text-sm">Online</span>
            </div>
            <div className="text-white text-3xl font-bold">
              {cameras.filter((c) => c.status === "online").length}
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-4 border border-red-500/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <span className="text-slate-400 text-sm">Offline</span>
            </div>
            <div className="text-white text-3xl font-bold">
              {cameras.filter((c) => c.status === "offline").length}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search cameras..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass border-white/20 bg-white/5 text-white placeholder:text-slate-500 pl-12 h-12"
          />
        </div>

        {/* Camera List */}
        <div className="space-y-4">
          {filteredCameras.map((camera) => (
            <CameraManagementCard
              key={camera.id}
              camera={camera}
              onUpdate={handleUpdateCamera}
              onDelete={handleDeleteCamera}
            />
          ))}
        </div>

        {filteredCameras.length === 0 && (
          <div className="glass-strong rounded-3xl p-12 text-center">
            <Camera className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No cameras found
            </h3>
            <p className="text-slate-400">
              Try adjusting your search or add a new camera
            </p>
          </div>
        )}
      </div>

      {showAddDialog && (
        <AddCameraDialog
          onAdd={handleAddCamera}
          onClose={() => setShowAddDialog(false)}
        />
      )}
    </DashboardLayout>
  );
}
