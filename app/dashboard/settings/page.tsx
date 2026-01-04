"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CameraManagementCard } from "@/components/camera-management-card"
import { AddCameraDialog } from "@/components/add-camera-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Camera } from "lucide-react"

const mockCameras = [
  {
    id: "CAM-001",
    name: "Main Entrance",
    location: "Building A - Ground Floor",
    status: "online" as const,
    latitude: 28.6139,
    longitude: 77.209,
    radius: 50,
    alertThreshold: 300,
    resolution: "1920x1080",
    fps: 30,
    lastMaintenance: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  },
  {
    id: "CAM-002",
    name: "Food Court",
    location: "Building B - 2nd Floor",
    status: "online" as const,
    latitude: 28.6142,
    longitude: 77.2095,
    radius: 45,
    alertThreshold: 250,
    resolution: "1920x1080",
    fps: 30,
    lastMaintenance: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  },
  {
    id: "CAM-003",
    name: "Parking Area",
    location: "Outdoor - West Wing",
    status: "online" as const,
    latitude: 28.6135,
    longitude: 77.2088,
    radius: 60,
    alertThreshold: 200,
    resolution: "1920x1080",
    fps: 25,
    lastMaintenance: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
  },
  {
    id: "CAM-004",
    name: "Exhibition Hall",
    location: "Building C - 1st Floor",
    status: "online" as const,
    latitude: 28.6145,
    longitude: 77.21,
    radius: 40,
    alertThreshold: 180,
    resolution: "1920x1080",
    fps: 30,
    lastMaintenance: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: "CAM-005",
    name: "Conference Room",
    location: "Building A - 3rd Floor",
    status: "online" as const,
    latitude: 28.614,
    longitude: 77.2092,
    radius: 30,
    alertThreshold: 100,
    resolution: "1280x720",
    fps: 30,
    lastMaintenance: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
  },
  {
    id: "CAM-006",
    name: "Library",
    location: "Building D - Ground Floor",
    status: "offline" as const,
    latitude: 28.6138,
    longitude: 77.2098,
    radius: 35,
    alertThreshold: 150,
    resolution: "1920x1080",
    fps: 0,
    lastMaintenance: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
  },
]

export default function SettingsPage() {
  const [cameras, setCameras] = useState(mockCameras)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)

  const filteredCameras = cameras.filter(
    (camera) =>
      camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camera.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camera.id.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddCamera = (cameraData: any) => {
    const newCamera = {
      id: `CAM-${String(cameras.length + 1).padStart(3, "0")}`,
      ...cameraData,
      status: "online" as const,
      lastMaintenance: new Date(),
    }
    setCameras([...cameras, newCamera])
    setShowAddDialog(false)
  }

  const handleUpdateCamera = (cameraId: string, updates: any) => {
    setCameras((prev) => prev.map((cam) => (cam.id === cameraId ? { ...cam, ...updates } : cam)))
  }

  const handleDeleteCamera = (cameraId: string) => {
    setCameras((prev) => prev.filter((cam) => cam.id !== cameraId))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Camera Management</h1>
            <p className="text-slate-400">Configure and manage surveillance cameras</p>
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
            <div className="text-white text-3xl font-bold">{cameras.length}</div>
          </div>

          <div className="glass-strong rounded-2xl p-4 border border-green-500/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-slate-400 text-sm">Online</span>
            </div>
            <div className="text-white text-3xl font-bold">{cameras.filter((c) => c.status === "online").length}</div>
          </div>

          <div className="glass-strong rounded-2xl p-4 border border-red-500/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <span className="text-slate-400 text-sm">Offline</span>
            </div>
            <div className="text-white text-3xl font-bold">{cameras.filter((c) => c.status === "offline").length}</div>
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
            <h3 className="text-xl font-semibold text-white mb-2">No cameras found</h3>
            <p className="text-slate-400">Try adjusting your search or add a new camera</p>
          </div>
        )}
      </div>

      {showAddDialog && <AddCameraDialog onAdd={handleAddCamera} onClose={() => setShowAddDialog(false)} />}
    </DashboardLayout>
  )
}
