import type { LucideIcon } from "lucide-react"
import { TrendingUp, TrendingDown } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    label: string
  }
  color?: "blue" | "cyan" | "green" | "yellow" | "red" | "purple"
  isLive?: boolean
  highlight?: boolean
  customValueClass?: string
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "blue",
  isLive,
  highlight,
  customValueClass,
}: StatsCardProps) {
  const colorClasses = {
    blue: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
    cyan: "from-cyan-500/20 to-cyan-600/20 border-cyan-500/30",
    green: "from-green-500/20 to-green-600/20 border-green-500/30",
    yellow: "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30",
    red: "from-red-500/20 to-red-600/20 border-red-500/30",
    purple: "from-purple-500/20 to-purple-600/20 border-purple-500/30",
  }

  const iconColorClasses = {
    blue: "text-blue-400",
    cyan: "text-cyan-400",
    green: "text-green-400",
    yellow: "text-yellow-400",
    red: "text-red-400",
    purple: "text-purple-400",
  }

  return (
    <div
      className={`glass-strong rounded-3xl p-6 border ${colorClasses[color]} ${
        highlight ? "ring-2 ring-red-500/50 animate-pulse" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 ${iconColorClasses[color]}`} />
        </div>
        {isLive && (
          <div className="flex items-center gap-1 glass rounded-full px-3 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs text-slate-300 font-medium">LIVE</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
        <div className={`text-3xl font-bold ${customValueClass || "text-white"}`}>{value}</div>
        {trend && (
          <div className="flex items-center gap-2">
            {trend.value > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span className={`text-sm ${trend.value > 0 ? "text-green-400" : "text-red-400"}`}>
              {Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-slate-500">{trend.label}</span>
          </div>
        )}
      </div>
    </div>
  )
}
