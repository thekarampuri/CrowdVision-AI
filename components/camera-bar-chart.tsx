"use client"

const cameraData = [
  { name: "Main Entrance", value: 342, color: "from-red-500 to-orange-500" },
  { name: "Food Court", value: 278, color: "from-yellow-500 to-orange-500" },
  { name: "Parking Area", value: 189, color: "from-green-500 to-emerald-500" },
  { name: "Exhibition Hall", value: 156, color: "from-green-500 to-cyan-500" },
  { name: "Conference Room", value: 67, color: "from-blue-500 to-cyan-500" },
]

export function CameraBarChart() {
  const maxValue = Math.max(...cameraData.map((d) => d.value))

  return (
    <div className="space-y-4">
      {cameraData.map((camera, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-white font-medium">{camera.name}</span>
            <span className="text-slate-400">{camera.value} people</span>
          </div>
          <div className="relative w-full h-12 bg-slate-800 rounded-xl overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${camera.color} rounded-xl transition-all duration-1000 flex items-center justify-end pr-4`}
              style={{ width: `${(camera.value / maxValue) * 100}%` }}
            >
              <span className="text-white font-bold text-sm">{camera.value}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
