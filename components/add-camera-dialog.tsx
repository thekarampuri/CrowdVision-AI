"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

interface AddCameraDialogProps {
  onAdd: (cameraData: any) => void
  onClose: () => void
}

export function AddCameraDialog({ onAdd, onClose }: AddCameraDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    latitude: 28.614,
    longitude: 77.209,
    radius: 50,
    alertThreshold: 200,
    resolution: "1920x1080",
    fps: 30,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-strong rounded-3xl p-6 border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Add New Camera</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-200 text-sm">
                Camera Name *
              </Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Main Entrance"
                className="glass border-white/20 bg-white/5 text-white placeholder:text-slate-500 h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-slate-200 text-sm">
                Location *
              </Label>
              <Input
                id="location"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Building A - Ground Floor"
                className="glass border-white/20 bg-white/5 text-white placeholder:text-slate-500 h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="latitude" className="text-slate-200 text-sm">
                Latitude *
              </Label>
              <Input
                id="latitude"
                type="number"
                step="0.0001"
                required
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: Number.parseFloat(e.target.value) })}
                className="glass border-white/20 bg-white/5 text-white h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude" className="text-slate-200 text-sm">
                Longitude *
              </Label>
              <Input
                id="longitude"
                type="number"
                step="0.0001"
                required
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: Number.parseFloat(e.target.value) })}
                className="glass border-white/20 bg-white/5 text-white h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="radius" className="text-slate-200 text-sm">
                Coverage Radius (meters) *
              </Label>
              <Input
                id="radius"
                type="number"
                required
                value={formData.radius}
                onChange={(e) => setFormData({ ...formData, radius: Number.parseInt(e.target.value) })}
                className="glass border-white/20 bg-white/5 text-white h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="threshold" className="text-slate-200 text-sm">
                Alert Threshold (people) *
              </Label>
              <Input
                id="threshold"
                type="number"
                required
                value={formData.alertThreshold}
                onChange={(e) => setFormData({ ...formData, alertThreshold: Number.parseInt(e.target.value) })}
                className="glass border-white/20 bg-white/5 text-white h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resolution" className="text-slate-200 text-sm">
                Resolution
              </Label>
              <select
                id="resolution"
                value={formData.resolution}
                onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                className="glass border-white/20 bg-white/5 text-white h-10 w-full rounded-xl px-3 outline-none"
              >
                <option value="1920x1080" className="bg-slate-900">
                  1920x1080 (Full HD)
                </option>
                <option value="1280x720" className="bg-slate-900">
                  1280x720 (HD)
                </option>
                <option value="2560x1440" className="bg-slate-900">
                  2560x1440 (2K)
                </option>
                <option value="3840x2160" className="bg-slate-900">
                  3840x2160 (4K)
                </option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fps" className="text-slate-200 text-sm">
                Frame Rate (FPS)
              </Label>
              <Input
                id="fps"
                type="number"
                value={formData.fps}
                onChange={(e) => setFormData({ ...formData, fps: Number.parseInt(e.target.value) })}
                className="glass border-white/20 bg-white/5 text-white h-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            >
              Add Camera
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="glass border-white/20 text-white bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
