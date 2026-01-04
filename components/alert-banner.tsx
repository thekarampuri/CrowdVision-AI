"use client"

import { AlertTriangle, X } from "lucide-react"
import { useState } from "react"

interface AlertBannerProps {
  count: number
  message: string
  severity: "info" | "warning" | "critical"
}

export function AlertBanner({ count, message, severity }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const severityStyles = {
    info: "from-blue-500/20 to-cyan-500/20 border-blue-500/50",
    warning: "from-yellow-500/20 to-orange-500/20 border-yellow-500/50",
    critical: "from-red-500/20 to-orange-500/20 border-red-500/50",
  }

  const severityTextColor = {
    info: "text-blue-400",
    warning: "text-yellow-400",
    critical: "text-red-400",
  }

  return (
    <div className={`glass-strong rounded-2xl p-4 border ${severityStyles[severity]} flex items-center gap-4`}>
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center flex-shrink-0">
        <AlertTriangle className={`w-5 h-5 ${severityTextColor[severity]}`} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`font-semibold ${severityTextColor[severity]}`}>{count} Active Alerts</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-400 text-sm">{new Date().toLocaleTimeString()}</span>
        </div>
        <p className="text-white text-sm">{message}</p>
      </div>
      <button onClick={() => setDismissed(true)} className="text-slate-400 hover:text-white transition-colors">
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}
