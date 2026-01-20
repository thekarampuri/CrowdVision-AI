/**
 * Backend API Client
 * 
 * This module provides a client for communicating with the CrowdVision AI backend servers:
 * - Camera Feed Server (Port 999) - WebSocket for live video streaming
 * - Data API Server (Port 666) - REST API for analytics and data
 */

import { io, Socket } from 'socket.io-client';

// Backend server URLs
const CAMERA_FEED_URL = process.env.NEXT_PUBLIC_CAMERA_FEED_URL || 'http://localhost:999';
const DATA_API_URL = process.env.NEXT_PUBLIC_DATA_API_URL || 'http://localhost:666';

// Types
export interface CameraFrame {
    frame: string; // Base64 encoded image
    metrics: {
        total_people: number;
        num_groups: number;
        density_level: string;
        fps: number;
        timestamp: string;
    };
}

export interface CrowdStats {
    total_people: number;
    active_cameras: number;
    risk_level: string;
    active_alerts: number;
    last_updated: string;
}

export interface HeatmapPoint {
    lat: number;
    lng: number;
    intensity: number;
    radius: number;
    camera_id: string;
}

export interface Alert {
    id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    camera_id: string;
    location: string;
    people_count: number;
    status: 'active' | 'acknowledged' | 'resolved';
    created_at: string;
    acknowledged?: boolean;
    acknowledged_at?: string;
    resolved_at?: string;
}

export interface Camera {
    id: string;
    name: string;
    location: string;
    latitude: number;
    longitude: number;
    coverage_radius: number;
    threshold: number;
    status: 'active' | 'inactive';
    created_at: string;
}

export interface HistoricalEntry {
    timestamp: string;
    total_people: number;
    risk_level: string;
}

export interface Analytics {
    avg_people: number;
    max_people: number;
    min_people: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    hourly_data: HistoricalEntry[];
}

/**
 * Camera Feed WebSocket Client
 */
export class CameraFeedClient {
    private socket: Socket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    constructor() {
        this.connect();
    }

    connect() {
        if (this.socket?.connected) {
            return;
        }

        this.socket = io(CAMERA_FEED_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: this.maxReconnectAttempts,
        });

        this.socket.on('connect', () => {
            console.log('✅ Connected to camera feed server');
            this.reconnectAttempts = 0;
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Disconnected from camera feed server');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Camera feed connection error:', error);
            this.reconnectAttempts++;
        });

        this.socket.on('connection_response', (data) => {
            console.log('Camera feed server response:', data);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    startCamera(cameraId: number = 0) {
        if (!this.socket?.connected) {
            console.error('Socket not connected');
            return;
        }

        this.socket.emit('start_camera', { camera_id: cameraId });
    }

    stopCamera() {
        if (!this.socket?.connected) {
            console.error('Socket not connected');
            return;
        }

        this.socket.emit('stop_camera');
    }

    onFrame(callback: (data: CameraFrame) => void) {
        if (!this.socket) {
            console.error('Socket not initialized');
            return;
        }

        this.socket.on('camera_frame', callback);
    }

    onError(callback: (error: { error: string }) => void) {
        if (!this.socket) {
            console.error('Socket not initialized');
            return;
        }

        this.socket.on('camera_error', callback);
    }

    onCameraResponse(callback: (response: { status: string; message: string }) => void) {
        if (!this.socket) {
            console.error('Socket not initialized');
            return;
        }

        this.socket.on('camera_response', callback);
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }
}

/**
 * Data API Client
 */
export class DataAPIClient {
    private baseUrl: string;

    constructor() {
        this.baseUrl = DATA_API_URL;
    }

    private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options?.headers,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`API request failed for ${endpoint}:`, error);
            throw error;
        }
    }

    // Health Check
    async healthCheck(): Promise<{ status: string; service: string; port: number; timestamp: string }> {
        return this.request('/health');
    }

    // Statistics
    async getStats(): Promise<{ success: boolean; data: CrowdStats; timestamp: string }> {
        return this.request('/api/stats');
    }

    async updateStats(stats: Partial<CrowdStats>): Promise<{ success: boolean; message: string }> {
        return this.request('/api/stats', {
            method: 'POST',
            body: JSON.stringify(stats),
        });
    }

    // Heatmap
    async getHeatmap(): Promise<{ success: boolean; data: { points: HeatmapPoint[]; total_points: number; timestamp: string } }> {
        return this.request('/api/heatmap');
    }

    // Alerts
    async getAlerts(): Promise<{ success: boolean; data: { alerts: Alert[]; total: number; timestamp: string } }> {
        return this.request('/api/alerts');
    }

    async createAlert(alert: Partial<Alert>): Promise<{ success: boolean; data: Alert }> {
        return this.request('/api/alerts', {
            method: 'POST',
            body: JSON.stringify(alert),
        });
    }

    async acknowledgeAlert(alertId: string): Promise<{ success: boolean; message: string }> {
        return this.request(`/api/alerts/${alertId}/acknowledge`, {
            method: 'POST',
        });
    }

    async resolveAlert(alertId: string): Promise<{ success: boolean; message: string }> {
        return this.request(`/api/alerts/${alertId}/resolve`, {
            method: 'POST',
        });
    }

    // History
    async getHistory(hours: number = 24): Promise<{ success: boolean; data: { entries: HistoricalEntry[]; total: number; time_range_hours: number; timestamp: string } }> {
        return this.request(`/api/history?hours=${hours}`);
    }

    // Analytics
    async getAnalytics(): Promise<{ success: boolean; data: Analytics; timestamp: string }> {
        return this.request('/api/analytics');
    }

    // Cameras
    async getCameras(): Promise<{ success: boolean; data: { cameras: Camera[]; total: number } }> {
        return this.request('/api/cameras');
    }

    async addCamera(camera: Partial<Camera>): Promise<{ success: boolean; data: Camera }> {
        return this.request('/api/cameras', {
            method: 'POST',
            body: JSON.stringify(camera),
        });
    }

    async updateCamera(cameraId: string, camera: Partial<Camera>): Promise<{ success: boolean; data: Camera }> {
        return this.request(`/api/cameras/${cameraId}`, {
            method: 'PUT',
            body: JSON.stringify(camera),
        });
    }

    async deleteCamera(cameraId: string): Promise<{ success: boolean; message: string }> {
        return this.request(`/api/cameras/${cameraId}`, {
            method: 'DELETE',
        });
    }
}

// Singleton instances
let cameraFeedClient: CameraFeedClient | null = null;
let dataAPIClient: DataAPIClient | null = null;

export function getCameraFeedClient(): CameraFeedClient {
    if (!cameraFeedClient) {
        cameraFeedClient = new CameraFeedClient();
    }
    return cameraFeedClient;
}

export function getDataAPIClient(): DataAPIClient {
    if (!dataAPIClient) {
        dataAPIClient = new DataAPIClient();
    }
    return dataAPIClient;
}

// Health check utility
export async function checkBackendHealth(): Promise<{
    cameraFeed: boolean;
    dataAPI: boolean;
}> {
    const results = {
        cameraFeed: false,
        dataAPI: false,
    };

    try {
        const response = await fetch(`${CAMERA_FEED_URL}/health`);
        results.cameraFeed = response.ok;
    } catch (error) {
        console.error('Camera feed health check failed:', error);
    }

    try {
        const client = getDataAPIClient();
        await client.healthCheck();
        results.dataAPI = true;
    } catch (error) {
        console.error('Data API health check failed:', error);
    }

    return results;
}
