# Frontend Integration Guide

## Overview

This guide explains how to integrate the CrowdVision AI frontend with the ML backend servers.

## Prerequisites

1. **Backend servers running** - See `backend/SETUP.md`
2. **Node.js dependencies installed** - Run `npm install`
3. **Environment variables configured** - See below

## Setup

### 1. Install Dependencies

```bash
# Install the new socket.io-client dependency
npm install
```

### 2. Configure Environment Variables

Create `.env.local` file in the project root:

```bash
# Copy the example file
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_CAMERA_FEED_URL=http://localhost:999
NEXT_PUBLIC_DATA_API_URL=http://localhost:666
```

**For production**, update these URLs to your deployed backend servers.

### 3. Start Backend Servers

Before starting the frontend, ensure backend servers are running:

```bash
# In the backend directory
cd backend
start_backend.bat  # Windows

# Or manually start both servers in separate terminals
python camera_feed_server.py
python data_api_server.py
```

### 4. Start Frontend

```bash
# In the project root
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Backend Integration Components

### 1. API Client (`lib/backend-client.ts`)

Provides two main clients:

#### CameraFeedClient (WebSocket)

```typescript
import { getCameraFeedClient } from '@/lib/backend-client';

const client = getCameraFeedClient();

// Start camera
client.startCamera(0); // Camera ID 0

// Listen for frames
client.onFrame((data) => {
  console.log('Frame received:', data.frame); // Base64 image
  console.log('Metrics:', data.metrics); // People count, density, etc.
});

// Listen for errors
client.onError((error) => {
  console.error('Camera error:', error);
});

// Stop camera
client.stopCamera();

// Disconnect
client.disconnect();
```

#### DataAPIClient (REST API)

```typescript
import { getDataAPIClient } from '@/lib/backend-client';

const client = getDataAPIClient();

// Get statistics
const stats = await client.getStats();
console.log('Total people:', stats.data.total_people);

// Get heatmap data
const heatmap = await client.getHeatmap();
console.log('Heatmap points:', heatmap.data.points);

// Get alerts
const alerts = await client.getAlerts();
console.log('Active alerts:', alerts.data.alerts);

// Get analytics
const analytics = await client.getAnalytics();
console.log('Average people:', analytics.data.avg_people);
```

### 2. Backend Status Component

Add to your dashboard layout:

```typescript
import { BackendStatus } from '@/components/backend-status';

export default function DashboardLayout({ children }) {
  return (
    <div>
      <header>
        {/* Your header content */}
        <BackendStatus />
      </header>
      {children}
    </div>
  );
}
```

The component shows:
- ✅ Green badge - Both servers connected
- ⚠️ Yellow badge - Partial connection
- ❌ Red badge - No connection
- Tooltip with detailed status
- Refresh button to check status

## Usage Examples

### Example 1: Live Camera Feed Page

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getCameraFeedClient, CameraFrame } from '@/lib/backend-client';

export default function CameraPage() {
  const [frame, setFrame] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    const client = getCameraFeedClient();

    client.onFrame((data: CameraFrame) => {
      setFrame(data.frame);
      setMetrics(data.metrics);
    });

    client.onError((error) => {
      console.error('Camera error:', error);
      setIsStreaming(false);
    });

    return () => {
      client.stopCamera();
      client.disconnect();
    };
  }, []);

  const handleStart = () => {
    const client = getCameraFeedClient();
    client.startCamera(0);
    setIsStreaming(true);
  };

  const handleStop = () => {
    const client = getCameraFeedClient();
    client.stopCamera();
    setIsStreaming(false);
  };

  return (
    <div>
      <h1>Live Camera Feed</h1>
      
      <div className="controls">
        <button onClick={handleStart} disabled={isStreaming}>
          Start Camera
        </button>
        <button onClick={handleStop} disabled={!isStreaming}>
          Stop Camera
        </button>
      </div>

      {frame && (
        <div>
          <img 
            src={`data:image/jpeg;base64,${frame}`} 
            alt="Camera feed"
            className="w-full h-auto"
          />
        </div>
      )}

      {metrics && (
        <div className="metrics">
          <p>People: {metrics.total_people}</p>
          <p>Groups: {metrics.num_groups}</p>
          <p>Density: {metrics.density_level}</p>
          <p>FPS: {metrics.fps.toFixed(1)}</p>
        </div>
      )}
    </div>
  );
}
```

### Example 2: Statistics Dashboard

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getDataAPIClient, CrowdStats } from '@/lib/backend-client';

export default function StatsPage() {
  const [stats, setStats] = useState<CrowdStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const client = getDataAPIClient();
      const response = await client.getStats();
      setStats(response.data);
    };

    fetchStats();
    
    // Refresh every 5 seconds
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div>
      <h1>Crowd Statistics</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="stat-card">
          <h3>Total People</h3>
          <p className="text-4xl">{stats.total_people}</p>
        </div>
        <div className="stat-card">
          <h3>Active Cameras</h3>
          <p className="text-4xl">{stats.active_cameras}</p>
        </div>
        <div className="stat-card">
          <h3>Risk Level</h3>
          <p className="text-4xl">{stats.risk_level}</p>
        </div>
        <div className="stat-card">
          <h3>Active Alerts</h3>
          <p className="text-4xl">{stats.active_alerts}</p>
        </div>
      </div>
    </div>
  );
}
```

### Example 3: Heatmap Integration

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getDataAPIClient, HeatmapPoint } from '@/lib/backend-client';

export default function HeatmapPage() {
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);

  useEffect(() => {
    const fetchHeatmap = async () => {
      const client = getDataAPIClient();
      const response = await client.getHeatmap();
      setHeatmapData(response.data.points);
    };

    fetchHeatmap();
    
    // Refresh every 10 seconds
    const interval = setInterval(fetchHeatmap, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>Crowd Heatmap</h1>
      {/* Your map component here */}
      {/* Pass heatmapData to your map visualization */}
    </div>
  );
}
```

### Example 4: Alerts Management

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getDataAPIClient, Alert } from '@/lib/backend-client';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      const client = getDataAPIClient();
      const response = await client.getAlerts();
      setAlerts(response.data.alerts);
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAcknowledge = async (alertId: string) => {
    const client = getDataAPIClient();
    await client.acknowledgeAlert(alertId);
    // Refresh alerts
  };

  const handleResolve = async (alertId: string) => {
    const client = getDataAPIClient();
    await client.resolveAlert(alertId);
    // Refresh alerts
  };

  return (
    <div>
      <h1>Active Alerts</h1>
      {alerts.map((alert) => (
        <div key={alert.id} className="alert-card">
          <h3>{alert.message}</h3>
          <p>Severity: {alert.severity}</p>
          <p>Location: {alert.location}</p>
          <p>People: {alert.people_count}</p>
          <div className="actions">
            <button onClick={() => handleAcknowledge(alert.id)}>
              Acknowledge
            </button>
            <button onClick={() => handleResolve(alert.id)}>
              Resolve
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

## API Reference

### CameraFeedClient Methods

| Method | Description |
|--------|-------------|
| `connect()` | Connect to WebSocket server |
| `disconnect()` | Disconnect from server |
| `startCamera(cameraId)` | Start camera streaming |
| `stopCamera()` | Stop camera streaming |
| `onFrame(callback)` | Listen for frame updates |
| `onError(callback)` | Listen for errors |
| `onCameraResponse(callback)` | Listen for server responses |
| `isConnected()` | Check connection status |

### DataAPIClient Methods

| Method | Description |
|--------|-------------|
| `healthCheck()` | Check server health |
| `getStats()` | Get current statistics |
| `updateStats(stats)` | Update statistics |
| `getHeatmap()` | Get heatmap data |
| `getAlerts()` | Get active alerts |
| `createAlert(alert)` | Create new alert |
| `acknowledgeAlert(id)` | Acknowledge alert |
| `resolveAlert(id)` | Resolve alert |
| `getHistory(hours)` | Get historical data |
| `getAnalytics()` | Get analytics data |
| `getCameras()` | Get camera list |
| `addCamera(camera)` | Add new camera |
| `updateCamera(id, camera)` | Update camera |
| `deleteCamera(id)` | Delete camera |

## Troubleshooting

### Issue: "Failed to connect to backend"

**Solutions**:
1. Check if backend servers are running
2. Verify ports 999 and 666 are not blocked
3. Check `.env.local` has correct URLs
4. Look at browser console for errors

### Issue: "CORS error"

**Solution**: Backend servers have CORS enabled for all origins in development. For production, update CORS settings in backend servers.

### Issue: "WebSocket connection failed"

**Solutions**:
1. Check if camera feed server is running on port 999
2. Try refreshing the page
3. Check browser console for detailed error
4. Verify firewall isn't blocking WebSocket connections

### Issue: "No frames received"

**Solutions**:
1. Check if camera is accessible (webcam permissions)
2. Look at backend server console for errors
3. Try different camera ID (0, 1, 2)
4. Verify YOLOv8 model is loaded successfully

## Next Steps

1. ✅ Backend servers running
2. ✅ Frontend dependencies installed
3. ✅ Environment variables configured
4. ⏭️ Update existing dashboard pages to use backend data
5. ⏭️ Test end-to-end integration
6. ⏭️ Deploy to production

## Additional Resources

- [Backend Setup Guide](../backend/SETUP.md)
- [Socket.IO Client Docs](https://socket.io/docs/v4/client-api/)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
