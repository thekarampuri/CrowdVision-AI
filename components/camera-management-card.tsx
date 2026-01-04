"use client"

import { useState } from "react"
import { MapPin, Trash2, Edit, Calendar, Signal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Camera {
  id: string
  name: string
  location: string
  status: "online" | "offline"
  latitude: number
  longitude: number
  radius: number
  alertThreshold: number
  resolution: string
  fps: number
  lastMaintenance: Date
}

interface CameraManagementCardProps {
  camera: Camera
  onUpdate: (cameraId: string, updates: any) => void
  onDelete: (cameraId: string) => void
}

export function CameraManagementCard({ camera, onUpdate, onDelete }: CameraManagementCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(camera)

  const handleSave = () => {
    onUpdate(camera.id, editData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData(camera)
    setIsEditing(false)
  }

  const daysSinceMaintenance = Math.floor((Date.now() - camera.lastMaintenance.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="glass-strong rounded-3xl p-6 border border-white/10">
      {!isEditing ? (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  camera.status === "online"
                    ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20"
                    : "bg-gradient-to-br from-red-500/20 to-orange-500/20"
                }`}
              >
                <Signal className={`w-6 h-6 ${camera.status === "online" ? "text-green-400" : "text-red-400"}`} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-white font-semibold text-lg">{camera.name}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      camera.status === "online" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {camera.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-slate-400 text-sm flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {camera.location}
                </p>
                <p className="text-slate-500 text-xs font-mono mt-1">{camera.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="text-slate-400 hover:text-white hover:bg-white/10"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(camera.id)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass rounded-xl p-3">
              <div className="text-slate-400 text-xs mb-1">Coordinates</div>
              <div className="text-white text-sm font-mono">
                {camera.latitude.toFixed(4)}, {camera.longitude.toFixed(4)}
              </div>
            </div>
            <div className="glass rounded-xl p-3">
              <div className="text-slate-400 text-xs mb-1">Coverage Radius</div>
              <div className="text-white text-sm font-semibold">{camera.radius}m</div>
            </div>
            <div className="glass rounded-xl p-3">
              <div className="text-slate-400 text-xs mb-1">Alert Threshold</div>
              <div className="text-white text-sm font-semibold">{camera.alertThreshold} people</div>
            </div>
            <div className="glass rounded-xl p-3">
              <div className="text-slate-400 text-xs mb-1">Resolution</div>
              <div className="text-white text-sm font-mono">{camera.resolution}</div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Calendar className="w-4 h-4" />
              <span>Last maintenance: {daysSinceMaintenance} days ago</span>
            </div>
            <div className="text-sm">
              <span className="text-slate-400">FPS:</span>
              <span className="ml-2 text-white font-semibold">{camera.fps}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Edit Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-200 text-sm">
                Camera Name
              </Label>
              <Input
                id="name"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="glass border-white/20 bg-white/5 text-white h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-slate-200 text-sm">
                Location
              </Label>
              <Input
                id="location"
                value={editData.location}
                onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                className="glass border-white/20 bg-white/5 text-white h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="latitude" className="text-slate-200 text-sm">
                Latitude
              </Label>
              <Input
                id="latitude"
                type="number"
                step="0.0001"
                value={editData.latitude}
                onChange={(e) => setEditData({ ...editData, latitude: Number.parseFloat(e.target.value) })}
                className="glass border-white/20 bg-white/5 text-white h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude" className="text-slate-200 text-sm">
                Longitude
              </Label>
              <Input
                id="longitude"
                type="number"
                step="0.0001"
                value={editData.longitude}
                onChange={(e) => setEditData({ ...editData, longitude: Number.parseFloat(e.target.value) })}
                className="glass border-white/20 bg-white/5 text-white h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="radius" className="text-slate-200 text-sm">
                Coverage Radius (m)
              </Label>
              <Input
                id="radius"
                type="number"
                value={editData.radius}
                onChange={(e) => setEditData({ ...editData, radius: Number.parseInt(e.target.value) })}
                className="glass border-white/20 bg-white/5 text-white h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="threshold" className="text-slate-200 text-sm">
                Alert Threshold
              </Label>
              <Input
                id="threshold"
                type="number"
                value={editData.alertThreshold}
                onChange={(e) => setEditData({ ...editData, alertThreshold: Number.parseInt(e.target.value) })}
                className="glass border-white/20 bg-white/5 text-white h-10"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-white/10">
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
            >
              Save Changes
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="glass border-white/20 text-white bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
