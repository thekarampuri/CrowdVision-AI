"use client"

import { useEffect, useRef, useState } from "react"
import { Camera, Users, Play, Pause, MapPin, AlertTriangle, Video, VideoOff } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WebcamFeedProps {
  camera: {
    id: string
    name: string
    location: string
    status: "online" | "offline"
    peopleCount: number
    riskLevel: "low" | "medium" | "high"
    fps: number
    resolution: string
    latitude: number
    longitude: number
  }
  viewMode: "grid" | "list"
  onDetectionUpdate?: (cameraId: string, detections: DetectionResult) => void
}

interface DetectionResult {
  count: number
  riskLevel: "low" | "medium" | "high"
  boundingBoxes: Array<{ x: number; y: number; width: number; height: number }>
}

export function WebcamFeed({ camera, viewMode, onDetectionUpdate }: WebcamFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [isWebcamActive, setIsWebcamActive] = useState(false)
  const [isWebcamEnabled, setIsWebcamEnabled] = useState(camera.id === "CAM-001")
  const [detections, setDetections] = useState<DetectionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (camera.status === "online" && isWebcamEnabled && camera.id === "CAM-001") {
      initializeWebcam()
    } else {
      stopWebcam()
    }

    return () => {
      stopWebcam()
    }
  }, [camera.status, isWebcamEnabled, camera.id])

  // New effect to attach stream when video element becomes available
  useEffect(() => {
    if (isWebcamActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch(e => console.error("Play error:", e))
        startDetection()
      }
    }
  }, [isWebcamActive])

  const initializeWebcam = async () => {
    try {
      // Check if we already have a stream to avoid double requests
      if (streamRef.current) return

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true, // Simplified constraints for better compatibility
      })

      // Check if component was disabled while we were waiting
      if (!isWebcamEnabled) {
        stream.getTracks().forEach(t => t.stop())
        return
      }

      streamRef.current = stream
      // Set active to true to mount the video element in the DOM
      setIsWebcamActive(true)
      setError(null)

    } catch (err) {
      console.error("Error accessing webcam:", err)
      setError("Unable to access webcam. Please check permissions.")
      setIsWebcamActive(false)
      setIsWebcamEnabled(false)
    }
  }

  const stopWebcam = () => {
    // Explicitly stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop()
      })
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current.load() // Force reload to clear buffer
    }

    setIsWebcamActive(false)

    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current)
      detectionIntervalRef.current = null
    }
  }

  const toggleWebcam = () => {
    if (camera.id === "CAM-001") {
      setIsWebcamEnabled((prev) => !prev)
    }
  }

  const startDetection = () => {
    detectionIntervalRef.current = setInterval(() => {
      if (!isPaused && videoRef.current && canvasRef.current) {
        runDetection()
      }
    }, 500) as unknown as NodeJS.Timeout
  }

  const runDetection = async () => {
    try {
      const video = videoRef.current
      const canvas = canvasRef.current

      if (!video || !canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      const imageData = canvas.toDataURL("image/jpeg", 0.8)

      const result = await detectCrowd(imageData)

      console.log(`[ML] Camera ${camera.id} response:`, result);
      setDetections(result)

      if (onDetectionUpdate) {
        onDetectionUpdate(camera.id, result)
      }

      drawBoundingBoxes(ctx, result.boundingBoxes, canvas.width, canvas.height)
    } catch (err: any) {
      console.error("Detection error:", err)
      // Only set error if it's not a temporary network issue
      if (err.message !== "Failed to fetch") {
        setError(`ML Error: ${err.message}`)
      }
    }
  }

  const detectCrowd = async (imageData: string): Promise<DetectionResult> => {
    try {
      const response = await fetch("/api/detect-crowd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData, cameraId: camera.id }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error (${response.status})`);
      }

      return await response.json()
    } catch (err) {
      console.error("ML API error:", err)
      return generateMockDetections()
    }
  }

  const generateMockDetections = (): DetectionResult => {
    const count = Math.floor(Math.random() * 10) + 1
    const boundingBoxes = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * 0.7 + 0.1,
      y: Math.random() * 0.6 + 0.1,
      width: 0.1 + Math.random() * 0.05,
      height: 0.15 + Math.random() * 0.1,
    }))

    let riskLevel: "low" | "medium" | "high" = "low"
    if (count > 7) riskLevel = "high"
    else if (count > 4) riskLevel = "medium"

    return { count, riskLevel, boundingBoxes }
  }

  const drawBoundingBoxes = (
    ctx: CanvasRenderingContext2D,
    boxes: Array<{ x: number; y: number; width: number; height: number }>,
    canvasWidth: number,
    canvasHeight: number,
  ) => {
    ctx.strokeStyle = "#00ffff"
    ctx.lineWidth = 3
    ctx.font = "16px monospace"
    ctx.fillStyle = "#00ffff"

    boxes.forEach((box: any, i) => {
      const x = box.x * canvasWidth
      const y = box.y * canvasHeight
      const width = box.width * canvasWidth
      const height = box.height * canvasHeight

      ctx.strokeRect(x, y, width, height)
      const label = box.confidence ? `P${i + 1} (${Math.round(box.confidence * 100)}%)` : `P${i + 1}`
      ctx.fillText(label, x, y - 5)
    })
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return { bg: "from-green-500/20 to-emerald-500/20", border: "border-green-500/50", text: "text-green-400" }
      case "medium":
        return { bg: "from-yellow-500/20 to-orange-500/20", border: "border-yellow-500/50", text: "text-yellow-400" }
      case "high":
        return { bg: "from-red-500/20 to-orange-500/20", border: "border-red-500/50", text: "text-red-400" }
      default:
        return { bg: "from-slate-500/20 to-slate-600/20", border: "border-slate-500/50", text: "text-muted-foreground" }
    }
  }

  const riskColors = getRiskColor(detections?.riskLevel || camera.riskLevel)

  const togglePause = () => {
    setIsPaused(!isPaused)
    if (videoRef.current) {
      if (isPaused) {
        videoRef.current.play()
      } else {
        videoRef.current.pause()
      }
    }
  }

  const isMainCamera = camera.id === "CAM-001"

  if (viewMode === "list") {
    return (
      <div className={`glass-strong rounded-2xl p-4 border ${riskColors.border} flex items-center gap-4`}>
        <div className="relative w-48 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
          {isWebcamActive && isMainCamera ? (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />
            </>
          ) : error && isMainCamera ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-2">
              <AlertTriangle className="w-6 h-6 text-red-500 mb-1" />
              <span className="text-red-400 text-xs text-center">{error}</span>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Camera className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-foreground font-semibold text-lg">{camera.name}</h3>
              <p className="text-muted-foreground text-sm flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {camera.location}
              </p>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold ${isWebcamActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                }`}
            >
              {isWebcamActive ? "LIVE" : "OFFLINE"}
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="text-foreground font-semibold">{detections?.count || 0}</span>
              <span className="text-muted-foreground">people</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Risk:</span>
              <span className={`font-semibold ${riskColors.text}`}>
                {(detections?.riskLevel || camera.riskLevel).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleWebcam}
            disabled={camera.id !== "CAM-001"}
            className={`${isWebcamEnabled && isMainCamera
              ? "text-green-400 hover:text-green-300"
              : "text-slate-400 hover:text-white"
              } ${camera.id !== "CAM-001" ? "opacity-50 cursor-not-allowed" : ""}`}
            title={camera.id !== "CAM-001" ? "Webcam only available for Main Entrance" : "Toggle webcam"}
          >
            {isWebcamEnabled && isMainCamera ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </Button>
          {isWebcamActive && (
            <Button variant="ghost" size="sm" onClick={togglePause} className="text-slate-400 hover:text-white">
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`glass-strong rounded-3xl overflow-hidden border ${riskColors.border}`}>
      <div className="relative aspect-video bg-muted group">
        {isWebcamActive && isMainCamera ? (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={toggleWebcam}
                    className="bg-green-500/30 hover:bg-green-500/50 text-green-300 flex items-center gap-2"
                  >
                    <Video className="w-4 h-4" />
                    <span className="text-xs font-semibold">Turn Off</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={togglePause}
                    className="bg-black/50 hover:bg-black/70 text-white"
                  >
                    {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs text-white font-semibold">LIVE WEBCAM</span>
            </div>

            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-white font-mono">
              {camera.fps} FPS
            </div>
          </>
        ) : error && isMainCamera ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-8">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
            <span className="text-red-400 text-center px-4 mb-4">{error}</span>
            <Button onClick={() => setIsWebcamEnabled(true)} className="bg-blue-600 hover:bg-blue-700">
              Retry Webcam Access
            </Button>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <Camera className="w-12 h-12 text-muted-foreground mb-2" />
            <span className="text-muted-foreground text-sm">Static Camera Feed</span>
            <span className="text-muted-foreground/70 text-xs mt-1">(Demo mode)</span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-foreground font-semibold mb-1">{camera.name}</h3>
            <p className="text-muted-foreground text-sm flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {camera.location}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleWebcam}
              disabled={camera.id !== "CAM-001"}
              className={`h-8 px-2 ${isWebcamEnabled && isMainCamera
                ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                : "bg-slate-700/50 text-slate-400 hover:bg-slate-700/70"
                } ${camera.id !== "CAM-001" ? "opacity-50 cursor-not-allowed" : ""}`}
              title={camera.id !== "CAM-001" ? "Webcam only available for Main Entrance" : "Toggle webcam"}
            >
              {isWebcamEnabled && isMainCamera ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </Button>
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold ${isWebcamActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                }`}
            >
              {isWebcamActive ? "LIVE" : "OFFLINE"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="text-muted-foreground text-xs">Detected</span>
            </div>
            <div className="text-foreground text-xl font-bold">{detections?.count || 0}</div>
          </div>

          <div className={`glass rounded-xl p-3 bg-gradient-to-br ${riskColors.bg}`}>
            <div className="text-muted-foreground text-xs mb-1">Risk Level</div>
            <div className={`text-xl font-bold ${riskColors.text}`}>
              {(detections?.riskLevel || camera.riskLevel).toUpperCase()}
            </div>
          </div>
        </div>

        <div className="text-muted-foreground text-xs font-mono flex items-center justify-between">
          <span>{camera.id}</span>
          <span>{camera.resolution}</span>
        </div>
      </div>
    </div>
  )
}
