# Leaflet Map Implementation Guide

## Overview

This document describes the Leaflet map implementation in CrowdVision-AI for visualizing camera locations and crowd density in real-time.

## Installation

Leaflet and its dependencies have been installed:

```bash
npm install leaflet react-leaflet @types/leaflet
```

## Components

### 1. Map Component (`components/map.tsx`)

The main map component with full customization options.

**Features:**
- Dynamic imports for Next.js SSR compatibility
- Camera location markers
- Crowd density visualization with circles
- Color-coded status indicators (active, inactive, alert)
- Interactive popups with camera details

**Usage:**

```tsx
import { Map, CameraLocation } from '@/components/map';

const cameras: CameraLocation[] = [
  {
    id: 'cam-1',
    name: 'India Gate Camera',
    position: [28.6129, 77.2295],
    crowdDensity: 8,
    status: 'alert',
  },
];

<Map
  center={[28.6139, 77.2090]}
  zoom={13}
  cameras={cameras}
  height="600px"
/>
```

**Props:**
- `center`: LatLngExpression - Map center coordinates (default: New Delhi)
- `zoom`: number - Initial zoom level (default: 13)
- `cameras`: CameraLocation[] - Array of camera locations to display
- `height`: string - Map container height (default: '500px')
- `className`: string - Additional CSS classes

**CameraLocation Interface:**
```typescript
interface CameraLocation {
  id: string;
  name: string;
  position: [number, number]; // [latitude, longitude]
  crowdDensity?: number;
  status?: 'active' | 'inactive' | 'alert';
}
```

### 2. MapWidget Component (`components/map-widget.tsx`)

A simplified widget version for easy dashboard integration.

**Features:**
- Lightweight and easy to integrate
- Optional card wrapper
- Simpler data structure
- Ideal for dashboard widgets

**Usage:**

```tsx
import { MapWidget, MapLocation } from '@/components/map-widget';

const locations: MapLocation[] = [
  {
    id: 'loc-1',
    name: 'Camera 1',
    lat: 28.6129,
    lng: 77.2295,
    crowdCount: 150,
    status: 'warning',
  },
];

<MapWidget
  locations={locations}
  center={[28.6139, 77.2090]}
  zoom={12}
  height="400px"
  title="Live Monitoring"
  showCard={true}
/>
```

**Props:**
- `locations`: MapLocation[] - Array of locations to display
- `center`: LatLngExpression - Map center (default: New Delhi)
- `zoom`: number - Zoom level (default: 13)
- `height`: string - Map height (default: '400px')
- `title`: string - Card title (default: 'Location Map')
- `showCard`: boolean - Wrap in card component (default: true)

**MapLocation Interface:**
```typescript
interface MapLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  crowdCount?: number;
  status?: 'normal' | 'warning' | 'critical';
}
```

## Example Page

A complete example page has been created at `app/map/page.tsx` demonstrating:
- Full map implementation
- Sample camera data
- Statistics cards
- Camera list with status indicators

**Access the example:**
Navigate to `/map` in your browser after starting the development server.

## Color Coding

### Map Component (status-based):
- **Green (#22c55e)**: Active camera, normal operation
- **Gray (#6b7280)**: Inactive camera
- **Red (#ef4444)**: Alert status, high crowd density

### MapWidget Component (status-based):
- **Green (#22c55e)**: Normal status
- **Orange (#f59e0b)**: Warning status
- **Red (#ef4444)**: Critical status

## Integration Guide

### Option 1: Add to Existing Dashboard

```tsx
'use client';

import { MapWidget } from '@/components/map-widget';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    // Fetch camera locations from your API
    fetch('/api/cameras')
      .then(res => res.json())
      .then(data => setLocations(data));
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Other dashboard components */}
      <MapWidget 
        locations={locations}
        height="400px"
        title="Camera Locations"
      />
    </div>
  );
}
```

### Option 2: Real-time Updates with Socket.IO

```tsx
'use client';

import { MapWidget } from '@/components/map-widget';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function LiveMap() {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const socket = io('http://localhost:5000');

    socket.on('camera-update', (data) => {
      setLocations(data.cameras);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return <MapWidget locations={locations} />;
}
```

### Option 3: Integration with Backend API

```tsx
// Example API route: app/api/map-data/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  // Fetch from your database or external API
  const cameras = await fetchCamerasFromDB();
  
  const mapData = cameras.map(cam => ({
    id: cam.id,
    name: cam.name,
    lat: cam.latitude,
    lng: cam.longitude,
    crowdCount: cam.currentCrowdCount,
    status: cam.crowdCount > 100 ? 'critical' : 'normal',
  }));

  return NextResponse.json(mapData);
}
```

## Styling

The map components use the existing CrowdVision-AI theme:
- Glass morphism cards
- Dark/light mode support
- Consistent color scheme
- Responsive design

### Custom Styling

```tsx
<MapWidget
  className="custom-class"
  height="500px"
  locations={locations}
/>
```

## Performance Considerations

1. **SSR Handling**: Components use dynamic imports to prevent server-side rendering issues
2. **Client-side Only**: Maps only render on the client after component mount
3. **Lazy Loading**: Map tiles load progressively as needed
4. **Optimized Markers**: Use `crowdDensity` calculations to limit circle sizes

## Troubleshooting

### Map Not Displaying

**Issue**: Blank or white screen where map should be

**Solutions**:
1. Ensure Leaflet CSS is imported in `globals.css`
2. Check that component is wrapped with `'use client'`
3. Verify dynamic imports are used for all Leaflet components

### Marker Icons Not Showing

**Issue**: Markers appear as broken images

**Solution**: Leaflet's default marker icons may need manual configuration:

```tsx
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});
```

### Build Errors

**Issue**: `window is not defined` error during build

**Solution**: Ensure all Leaflet imports use `dynamic()` with `{ ssr: false }`

## Advanced Features

### Custom Marker Icons

```tsx
import L from 'leaflet';

const customIcon = L.icon({
  iconUrl: '/camera-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

<Marker position={position} icon={customIcon}>
```

### Heatmap Layer

For advanced crowd visualization, consider adding the Leaflet.heat plugin:

```bash
npm install leaflet.heat @types/leaflet.heat
```

### Clustering

For many markers, use marker clustering:

```bash
npm install react-leaflet-cluster
```

## Next Steps

1. Connect to your real-time camera feed API
2. Implement WebSocket updates for live data
3. Add custom marker icons for different camera types
4. Integrate with your existing alert system
5. Add filtering and search capabilities

## Resources

- [Leaflet Documentation](https://leafletjs.com/)
- [React Leaflet Documentation](https://react-leaflet.js.org/)
- [OpenStreetMap Tile Servers](https://wiki.openstreetmap.org/wiki/Tile_servers)

## Support

For issues or questions about the map implementation, refer to:
- Main project README
- Leaflet GitHub issues
- React Leaflet GitHub discussions