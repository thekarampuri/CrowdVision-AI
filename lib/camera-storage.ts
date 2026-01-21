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

// Default cameras - Solapur, Maharashtra coordinates
const defaultCameras: Camera[] = [
  {
    id: "CAM-001",
    name: "Main Entrance",
    location: "Building A - Ground Floor",
    latitude: 17.6599,
    longitude: 75.9064,
    radius: 50,
    alertThreshold: 200,
    resolution: "1920x1080",
    fps: 30,
    status: "online",
    peopleCount: 0,
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
