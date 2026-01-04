"use client"

interface CrowdLineChartProps {
  timeRange: "24h" | "7d" | "30d"
  cameraId: string
}

export function CrowdLineChart({ timeRange, cameraId }: CrowdLineChartProps) {
  // Generate mock data based on time range
  const dataPoints = timeRange === "24h" ? 24 : timeRange === "7d" ? 7 : 30

  const generateData = () => {
    const data = []
    for (let i = 0; i < dataPoints; i++) {
      const baseValue = 500 + Math.random() * 1000
      const time =
        timeRange === "24h" ? `${String(i).padStart(2, "0")}:00` : timeRange === "7d" ? `Day ${i + 1}` : `Day ${i + 1}`
      data.push({ time, value: Math.round(baseValue) })
    }
    return data
  }

  const data = generateData()
  const maxValue = Math.max(...data.map((d) => d.value))

  return (
    <div className="w-full h-80">
      <div className="relative w-full h-full">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-slate-500">
          <span>{maxValue}</span>
          <span>{Math.round(maxValue * 0.75)}</span>
          <span>{Math.round(maxValue * 0.5)}</span>
          <span>{Math.round(maxValue * 0.25)}</span>
          <span>0</span>
        </div>

        {/* Chart area */}
        <div className="absolute left-14 right-0 top-0 bottom-8">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-full border-t border-white/5" />
            ))}
          </div>

          {/* Line chart */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Area under the line */}
            <path
              d={`M 0,${((maxValue - data[0].value) / maxValue) * 100}% ${data
                .map((point, i) => `L ${(i / (dataPoints - 1)) * 100}%,${((maxValue - point.value) / maxValue) * 100}%`)
                .join(" ")} L 100%,100% L 0,100% Z`}
              fill="url(#chartGradient)"
            />

            {/* Line */}
            <polyline
              points={data
                .map((point, i) => `${(i / (dataPoints - 1)) * 100}%,${((maxValue - point.value) / maxValue) * 100}%`)
                .join(" ")}
              fill="none"
              stroke="rgb(59, 130, 246)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {data.map((point, i) => (
              <circle
                key={i}
                cx={`${(i / (dataPoints - 1)) * 100}%`}
                cy={`${((maxValue - point.value) / maxValue) * 100}%`}
                r="4"
                fill="rgb(59, 130, 246)"
                className="hover:r-6 transition-all cursor-pointer"
              />
            ))}
          </svg>
        </div>

        {/* X-axis labels */}
        <div className="absolute left-14 right-0 bottom-0 h-8 flex justify-between items-end text-xs text-slate-500">
          {data
            .filter((_, i) => i % Math.ceil(dataPoints / 8) === 0)
            .map((point, i) => (
              <span key={i}>{point.time}</span>
            ))}
        </div>
      </div>
    </div>
  )
}
