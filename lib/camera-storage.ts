"use client";

export interface Camera {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  radius: number;
  alertThreshold: number;
  resolution: string;
  fps: number;
  status: "online" | "offline";
  peopleCount?: number;
  riskLevel?: "low" | "medium" | "high";
  addedAt: string;
}

const STORAGE_KEY = "crowdvision_cameras";

// Default cameras
const defaultCameras: Camera[] = [
  {
    id: "CAM-001",
    name: "Main Entrance",
    location: "Building A - Ground Floor",
    latitude: 28.6139,
    longitude: 77.209,
    radius: 50,
    alertThreshold: 200,
    resolution: "1920x1080",
    fps: 30,
    status: "online",
    peopleCount: 342,
    riskLevel: "high",
    addedAt: new Date().toISOString(),
  },
  {
    id: "CAM-002",
    name: "Food Court",
    location: "Building B - 2nd Floor",
    latitude: 28.6142,
    longitude: 77.2095,
    radius: 45,
    alertThreshold: 200,
    resolution: "1920x1080",
    fps: 30,
    status: "online",
    peopleCount: 278,
    riskLevel: "medium",
    addedAt: new Date().toISOString(),
  },
  {
    id: "CAM-003",
    name: "Parking Area",
    location: "Outdoor - West Wing",
    latitude: 28.6135,
    longitude: 77.2088,
    radius: 60,
    alertThreshold: 200,
    resolution: "1920x1080",
    fps: 25,
    status: "online",
    peopleCount: 189,
    riskLevel: "low",
    addedAt: new Date().toISOString(),
  },
  {
    id: "CAM-004",
    name: "Exhibition Hall",
    location: "Building C - 1st Floor",
    latitude: 28.6145,
    longitude: 77.21,
    radius: 40,
    alertThreshold: 200,
    resolution: "1920x1080",
    fps: 30,
    status: "online",
    peopleCount: 156,
    riskLevel: "low",
    addedAt: new Date().toISOString(),
  },
  {
    id: "CAM-005",
    name: "Conference Room",
    location: "Building A - 3rd Floor",
    latitude: 28.614,
    longitude: 77.2092,
    radius: 30,
    alertThreshold: 200,
    resolution: "1920x1080",
    fps: 30,
    status: "online",
    peopleCount: 67,
    riskLevel: "low",
    addedAt: new Date().toISOString(),
  },
];

export class CameraStorage {
  static getAllCameras(): Camera[] {
    if (typeof window === "undefined") return defaultCameras;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Initialize with default cameras
        this.saveCameras(defaultCameras);
        return defaultCameras;
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error("Error loading cameras:", error);
      return defaultCameras;
    }
  }

  static getCameraById(id: string): Camera | undefined {
    const cameras = this.getAllCameras();
    return cameras.find((cam) => cam.id === id);
  }

  static addCamera(
    cameraData: Omit<Camera, "id" | "addedAt" | "status">,
  ): Camera {
    const cameras = this.getAllCameras();
    const newCamera: Camera = {
      ...cameraData,
      id: `CAM-${String(cameras.length + 1).padStart(3, "0")}`,
      status: "online",
      peopleCount: 0,
      riskLevel: "low",
      addedAt: new Date().toISOString(),
    };
    cameras.push(newCamera);
    this.saveCameras(cameras);
    return newCamera;
  }

  static updateCamera(id: string, updates: Partial<Camera>): Camera | null {
    const cameras = this.getAllCameras();
    const index = cameras.findIndex((cam) => cam.id === id);
    if (index === -1) return null;

    cameras[index] = { ...cameras[index], ...updates };
    this.saveCameras(cameras);
    return cameras[index];
  }

  static deleteCamera(id: string): boolean {
    const cameras = this.getAllCameras();
    const filtered = cameras.filter((cam) => cam.id !== id);
    if (filtered.length === cameras.length) return false;

    this.saveCameras(filtered);
    return true;
  }

  static updateCameraDetection(
    id: string,
    peopleCount: number,
    riskLevel: "low" | "medium" | "high",
  ): void {
    const cameras = this.getAllCameras();
    const index = cameras.findIndex((cam) => cam.id === id);
    if (index !== -1) {
      cameras[index].peopleCount = peopleCount;
      cameras[index].riskLevel = riskLevel;
      this.saveCameras(cameras);
    }
  }

  static saveCameras(cameras: Camera[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cameras));
      // Dispatch custom event for components to listen to
      window.dispatchEvent(new CustomEvent("cameras-updated"));
    } catch (error) {
      console.error("Error saving cameras:", error);
    }
  }

  static resetToDefaults(): void {
    this.saveCameras(defaultCameras);
  }
}
