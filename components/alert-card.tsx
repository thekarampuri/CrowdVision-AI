"use client"

import { AlertTriangle, MapPin, Users, Clock, CheckCircle, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface Alert {
  id: string
  title: string
  description: string
  severity: "critical" | "warning" | "info"
  location: string
  cameraId: string
  peopleCount: number
  timestamp: Date
  status: "active" | "acknowledged" | "resolved"
  latitude: number
  longitude: number
}

interface AlertCardProps {
  alert: Alert
  onAcknowledge: (alertId: string) => void
  onResolve: (alertId: string) => void
}

export function AlertCard({ alert, onAcknowledge, onResolve }: AlertCardProps) {
  const [expanded, setExpanded] = useState(false)

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "critical":
        return {
          bg: "from-red-500/20 to-orange-500/20",
          border: "border-red-500/50",
          icon: "text-red-400",
          badge: "bg-red-500/20 text-red-400",
        }
      case "warning":
        return {
          bg: "from-yellow-500/20 to-orange-500/20",
          border: "border-yellow-500/50",
          icon: "text-yellow-400",
          badge: "bg-yellow-500/20 text-yellow-400",
        }
      case "info":
        return {
          bg: "from-blue-500/20 to-cyan-500/20",
          border: "border-blue-500/50",
          icon: "text-blue-400",
          badge: "bg-blue-500/20 text-blue-400",
        }
      default:
        return {
          bg: "from-slate-500/20 to-slate-600/20",
          border: "border-slate-500/50",
          icon: "text-slate-400",
          badge: "bg-slate-500/20 text-slate-400",
        }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400">Active</span>
      case "acknowledged":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400">
            Acknowledged
          </span>
        )
      case "resolved":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">Resolved</span>
        )
      default:
        return null
    }
  }

  const styles = getSeverityStyles(alert.severity)
  const timeAgo = Math.floor((Date.now() - alert.timestamp.getTime()) / (1000 * 60))

  return (
    <div className={`glass-strong rounded-3xl border ${styles.border} overflow-hidden`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4 flex-1">
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${styles.bg} flex items-center justify-center flex-shrink-0 ${
                alert.severity === "critical" ? "animate-pulse" : ""
              }`}
            >
              <AlertTriangle className={`w-6 h-6 ${styles.icon}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-white font-semibold text-lg">{alert.title}</h3>
                {getStatusBadge(alert.status)}
              </div>
              <p className="text-slate-400 text-sm mb-3">{alert.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin className="w-4 h-4" />
                  <span>{alert.location}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Users className="w-4 h-4" />
                  <span className="text-white font-semibold">{alert.peopleCount}</span>
                  <span>people</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span>{timeAgo}m ago</span>
                </div>
              </div>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${styles.badge}`}>
            {alert.severity.toUpperCase()}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-white/10">
          {alert.status === "active" && (
            <>
              <Button
                onClick={() => onAcknowledge(alert.id)}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Acknowledge
              </Button>
              <Button
                onClick={() => onResolve(alert.id)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              >
                Mark as Resolved
              </Button>
            </>
          )}
          {alert.status === "acknowledged" && (
            <Button
              onClick={() => onResolve(alert.id)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
            >
              Mark as Resolved
            </Button>
          )}
          <Button
            onClick={() => setExpanded(!expanded)}
            variant="outline"
            className="glass border-white/20 text-white hover:bg-white/10 bg-transparent"
          >
            <Eye className="w-4 h-4 mr-2" />
            {expanded ? "Hide" : "View"} Details
          </Button>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass rounded-xl p-3">
                <div className="text-slate-400 text-xs mb-1">Alert ID</div>
                <div className="text-white font-mono text-sm">{alert.id}</div>
              </div>
              <div className="glass rounded-xl p-3">
                <div className="text-slate-400 text-xs mb-1">Camera ID</div>
                <div className="text-white font-mono text-sm">{alert.cameraId}</div>
              </div>
              <div className="glass rounded-xl p-3">
                <div className="text-slate-400 text-xs mb-1">Coordinates</div>
                <div className="text-white font-mono text-sm">
                  {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                </div>
              </div>
              <div className="glass rounded-xl p-3">
                <div className="text-slate-400 text-xs mb-1">Timestamp</div>
                <div className="text-white text-sm">{alert.timestamp.toLocaleTimeString()}</div>
              </div>
            </div>
            <Button
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
              onClick={() => (window.location.href = "/dashboard/heatmap")}
            >
              View on Heatmap
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
