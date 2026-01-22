"use client";

import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Users,
  Play,
  Pause,
  MapPin,
  AlertTriangle,
  Video,
  VideoOff,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CameraStorage } from "@/lib/camera-storage";
import { AlertStorage } from "@/lib/alert-storage";

interface WebcamFeedProps {
  camera: {
    id: string;
    name: string;
    location: string;
    status: "online" | "offline";
    peopleCount: number;
    riskLevel: "low" | "medium" | "high";
    fps: number;
    resolution: string;
    latitude: number;
    longitude: number;
  };
  viewMode: "grid" | "list";
  onDetectionUpdate?: (cameraId: string, detections: DetectionResult) => void;
  onDelete?: (cameraId: string) => void;
}

interface DetectionResult {
  count: number;
  riskLevel: "low" | "medium" | "high";
  boundingBoxes: Array<{ x: number; y: number; width: number; height: number }>;
  gatherings?: number;
}

export function WebcamFeed({
  camera,
  viewMode,
  onDetectionUpdate,
  onDelete,
}: WebcamFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  // Default to OFF; user must enable manually
  const [isWebcamEnabled, setIsWebcamEnabled] = useState(false);
  const [detections, setDetections] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mlServerConnected, setMlServerConnected] = useState(true);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

useEffect(() => {
  // Only initialize when the camera is online and explicitly enabled
  if (camera.status === "online" && camera.id === "CAM-001" && isWebcamEnabled) {
    if (!streamRef.current) {
      initializeWebcam();
    }
  }

  // If camera goes offline or is disabled, ensure webcam is stopped
  if (camera.status !== "online" || camera.id !== "CAM-001" || !isWebcamEnabled) {
    if (streamRef.current) {
      stopWebcam();
    }
  }
}, [camera.status, isWebcamEnabled, camera.id]);

  // Handle window visibility change to stop webcam in background
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        console.log("[Webcam] Tab hidden, stopping webcam");
        stopWebcam();
      } else if (
        document.visibilityState === "visible" &&
        camera.status === "online" &&
        isWebcamEnabled &&
        camera.id === "CAM-001"
      ) {
        // Do not auto-restart on visibility change to avoid loops
        console.log("[Webcam] Tab visible, not auto-restarting webcam");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [camera.status, isWebcamEnabled, camera.id]);

  // New effect to attach stream when video element becomes available
  useEffect(() => {
    if (isWebcamActive && videoRef.current && streamRef.current) {
      console.log("[Webcam] Attaching stream to video element");
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.onloadedmetadata = () => {
        console.log("[Webcam] Video metadata loaded, starting playback");
        videoRef.current?.play().catch((e) => console.error("Play error:", e));
        startDetection();
      };
    }
  }, [isWebcamActive]);

  const initializeWebcam = async () => {
    try {
      console.log("[Webcam] Initializing webcam...");
      
      // Check if we already have a stream to avoid double requests
      if (streamRef.current) {
        console.log("[Webcam] Stream already exists");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
      });

      // Check if component was disabled while we were waiting
      if (!isWebcamEnabled) {
        console.log("[Webcam] Component disabled while initializing, stopping stream");
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = stream;
      console.log("[Webcam] Stream obtained successfully");
      
      // Set active to true to mount the video element in the DOM
      setIsWebcamActive(true);
      setError(null);
    } catch (err) {
      console.error("Error accessing webcam:", err);
      setError("Unable to access webcam. Please check permissions.");
      setIsWebcamActive(false);
      setIsWebcamEnabled(false);
    }
  };

const stopWebcam = () => {
    console.log("[Webcam] Stopping webcam completely");
    
    // Explicitly stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        console.log("[Webcam] Stopping track:", track.kind);
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      // Pause playback and let browser clean up. Do not manipulate the DOM structure
      videoRef.current.pause();
      videoRef.current.load(); // Clear any buffered data
    }

    setIsWebcamActive(false);
    setIsWebcamEnabled(false); // Also disable the webcam when stopped

    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  const toggleWebcam = () => {
    if (camera.id !== "CAM-001") return;
    if (isWebcamEnabled) {
      stopWebcam();
    } else {
      setIsWebcamEnabled(true);
      if (camera.status === "online" && !streamRef.current) initializeWebcam();
    }
  };

  const startDetection = () => {
    detectionIntervalRef.current = setInterval(() => {
      if (!isPaused && videoRef.current && canvasRef.current) {
        runDetection();
      }
    }, 2000) as unknown as NodeJS.Timeout;
  };

  const runDetection = async () => {
    if (isPaused || !isWebcamActive) return;

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = canvas.toDataURL("image/jpeg", 0.8);

      const result = await detectCrowd(imageData);

      console.log(`[ML] Camera ${camera.id} response:`, result);
      setDetections(result);

      if (onDetectionUpdate) {
        onDetectionUpdate(camera.id, result);
      }

      // Only create HIGH RISK alerts when count >= 10 (matching ML server thresholds)
      // Check for existing high risk alert within last 1 minute
      if (result.count >= 10) {
        const hasRecent = await AlertStorage.hasRecentAlert(camera.id, 1);

        if (!hasRecent) {
          try {
            const alertId = await AlertStorage.createHighRiskAlert({
              title: `Crowd Alert - ${camera.name}`,
              description: `Critical: Crowd count of ${result.count} people detected at ${camera.location}`,
              severity: "critical",
              location: camera.location,
              cameraId: camera.id,
              peopleCount: result.count,
              timestamp: new Date(),
              status: "active",
              latitude: camera.latitude,
              longitude: camera.longitude,
              cameraName: camera.name,
            });

            console.log(
              `[ALERT] High risk alert created with ID ${alertId} for ${camera.id} with ${result.count} people`,
            );
          } catch (alertError) {
            console.error("Error creating alert:", alertError);
          }
        }
      }
      // If count is 0-9, no alert is created

      drawBoundingBoxes(ctx, result.boundingBoxes, canvas.width, canvas.height);
    } catch (err: any) {
      console.error("Detection error:", err);
      setError(err.message || "Detection failed");
    }
  };

  const detectCrowd = async (imageData: string): Promise<DetectionResult> => {
    try {
      const response = await fetch("/api/detect-crowd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData, cameraId: camera.id }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn(
          `ML Server Error (${response.status}):`,
          errorData.error || "API Error",
        );
        setMlServerConnected(false);
        // Return default values instead of throwing
        return {
          count: 0,
          riskLevel: "low",
          boundingBoxes: [],
          gatherings: 0,
        };
      }

      // Server responded successfully
      setMlServerConnected(true);

      const data = await response.json();

      // Convert ML server response to our format
      const boundingBoxes = (data.detections || []).map((det: any) => {
        const [x1, y1, x2, y2] = det.bbox;
        return {
          x: x1,
          y: y1,
          width: x2 - x1,
          height: y2 - y1,
        };
      });

      // Calculate risk level based on count - matching ML server thresholds
      // low: 0, medium: 1-9, high: 10+
      let riskLevel: "low" | "medium" | "high" = "low";
      if (data.count >= 10) {
        riskLevel = "high";
      } else if (data.count >= 1) {
        riskLevel = "medium";
      }

      return {
        count: data.count || 0,
        riskLevel: riskLevel,
        boundingBoxes: boundingBoxes,
      };
    } catch (error) {
      console.error("Detection error:", error);
      setMlServerConnected(false);
      // Return default values on error instead of throwing
      return {
        count: 0,
        riskLevel: "low",
        boundingBoxes: [],
        gatherings: 0,
      };
    }
  };

  const drawBoundingBoxes = (
    ctx: CanvasRenderingContext2D,
    boxes: Array<{ x: number; y: number; width: number; height: number }>,
    canvasWidth: number,
    canvasHeight: number,
  ) => {
    ctx.strokeStyle = "#00FFFF";
    ctx.lineWidth = 2;

    boxes.forEach((box, i) => {
      // Bounding boxes from ML server are already in pixel coordinates
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      ctx.fillStyle = "#00FFFF";
      ctx.font = "14px Arial";
      ctx.fillText(`P${i + 1}`, box.x + 5, box.y + 15);
    });
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return {
          bg: "from-green-500/20 to-emerald-500/20",
          border: "border-green-500/50",
          text: "text-green-400",
        };
      case "medium":
        return {
          bg: "from-yellow-500/20 to-orange-500/20",
          border: "border-yellow-500/50",
          text: "text-yellow-400",
        };
      case "high":
        return {
          bg: "from-red-500/20 to-orange-500/20",
          border: "border-red-500/50",
          text: "text-red-400",
        };
      default:
        return {
          bg: "from-slate-500/20 to-slate-600/20",
          border: "border-slate-500/50",
          text: "text-muted-foreground",
        };
    }
  };

  const riskColors = getRiskColor(detections?.riskLevel || camera.riskLevel);

  const togglePause = () => {
    setIsPaused(!isPaused);
    if (videoRef.current) {
      if (isPaused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const isMainCamera = camera.id === "CAM-001";

  if (viewMode === "list") {
    return (
      <div
        className={`glass-strong rounded-2xl p-4 border ${riskColors.border} flex items-center gap-4`}
      >
        <div className="relative w-48 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
          {isWebcamActive && isMainCamera ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover"
              />
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
              <h3 className="text-foreground font-semibold text-lg">
                {camera.name}
              </h3>
              <p className="text-muted-foreground text-sm flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {camera.location}
              </p>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold ${isWebcamActive
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
                }`}
            >
              {isWebcamActive ? "LIVE" : "OFFLINE"}
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="text-foreground font-semibold">
                {detections?.count || 0}
              </span>
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
            title={
              camera.id !== "CAM-001"
                ? "Webcam only available for Main Entrance"
                : "Toggle webcam"
            }
          >
            {isWebcamEnabled && isMainCamera ? (
              <Video className="w-4 h-4" />
            ) : (
              <VideoOff className="w-4 h-4" />
            )}
          </Button>
          {isWebcamActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePause}
              className="text-slate-400 hover:text-white"
            >
              {isPaused ? (
                <Play className="w-4 h-4" />
              ) : (
                <Pause className="w-4 h-4" />
              )}
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm(`Delete camera ${camera.name}?`)) {
                  onDelete(camera.id);
                }
              }}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              title="Delete camera"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`glass-strong rounded-3xl overflow-hidden border ${riskColors.border}`}
    >
      <div className="relative aspect-video bg-muted group">
        {isWebcamActive && isMainCamera ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={toggleWebcam}
                    className="bg-red-500/30 hover:bg-red-500/50 text-red-300 flex items-center gap-2"
                  >
                    <VideoOff className="w-4 h-4" />
                    <span className="text-xs font-semibold">Turn Off</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={togglePause}
                    className="bg-black/50 hover:bg-black/70 text-white"
                  >
                    {isPaused ? (
                      <Play className="w-4 h-4" />
                    ) : (
                      <Pause className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs text-white font-semibold">
                LIVE WEBCAM
              </span>
            </div>

            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-white font-mono">
                {camera.fps} FPS
              </div>
              {!mlServerConnected && (
                <div className="bg-yellow-500/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-black font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3" />
                  <span>ML Server Offline</span>
                </div>
              )}
            </div>
          </>
        ) : error && isMainCamera ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-8">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
            <span className="text-red-400 text-center px-4 mb-4">{error}</span>
            <Button
              onClick={() => setIsWebcamEnabled(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Retry Webcam Access
            </Button>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <Camera className="w-12 h-12 text-muted-foreground mb-2" />
            <span className="text-muted-foreground text-sm">
              Static Camera Feed
            </span>
            <span className="text-muted-foreground/70 text-xs mt-1">
              (Demo mode)
            </span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-foreground font-semibold mb-1">
              {camera.name}
            </h3>
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
              title={
                camera.id !== "CAM-001"
                  ? "Webcam only available for Main Entrance"
                  : "Toggle webcam"
              }
            >
              {isWebcamEnabled && isMainCamera ? (
                <Video className="w-4 h-4" />
              ) : (
                <VideoOff className="w-4 h-4" />
              )}
            </Button>
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold ${isWebcamActive
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
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
            <div className="text-foreground text-xl font-bold">
              {detections?.count || 0}
            </div>
          </div>

          <div
            className={`glass rounded-xl p-3 bg-gradient-to-br ${riskColors.bg}`}
          >
            <div className="text-muted-foreground text-xs mb-1">Risk Level</div>
            <div className={`text-xl font-bold ${riskColors.text}`}>
              {(
                detections?.riskLevel ||
                camera.riskLevel ||
                "low"
              ).toUpperCase()}
            </div>
          </div>
        </div>

        <div className="text-muted-foreground text-xs font-mono flex items-center justify-between">
          <span>{camera.id}</span>
          <span>{camera.resolution}</span>
        </div>
      </div>
    </div>
  );
}
