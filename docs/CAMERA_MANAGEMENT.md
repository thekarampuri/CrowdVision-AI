# Camera Management with Leaflet Map Integration

## Overview

The CrowdVision AI system now features a complete camera management solution with interactive Leaflet map integration. This allows you to add, manage, and visualize camera locations directly on a real-world map.

---

## Features Implemented

### 1. **Interactive Camera Addition**

When adding a new camera, you can now:

- **Click on a Leaflet map** to select the exact GPS coordinates
- **Visual marker placement** shows where the camera will be located
- **Real-time coordinate update** in the form fields
- **Toggle map view** to show/hide the interactive map

### 2. **Dynamic Heatmap Visualization**

The heatmap page now displays:

- **All cameras from storage** with real-time updates
- **Interactive markers** that show camera details on click
- **Coverage radius circles** around each camera location
- **Color-coded risk levels** (green/yellow/red)
- **Real-world OpenStreetMap tiles** instead of simulated graphics

### 3. **Centralized Camera Storage**

A new camera storage service (`lib/camera-storage.ts`) provides:

- **LocalStorage persistence** - Cameras persist across sessions
- **Real-time synchronization** - Changes reflect across all pages
- **Event-driven updates** - Components auto-update when cameras change
- **Default cameras** - Pre-populated with 5 sample cameras

---

## How to Use

### Adding a New Camera

1. Navigate to **Dashboard > Cameras**
2. Click the **"Add Camera"** button (top right)
3. Fill in the camera details:
   - Camera Name
   - Location/Description
   - Coverage Radius (meters)
   - Alert Threshold (number of people)
   - Resolution & FPS
4. Click **"Show Map"** to open the interactive map
5. **Click anywhere on the map** to set the camera's GPS coordinates
6. The latitude and longitude fields update automatically
7. Click **"Add Camera"** to save

### Viewing Cameras on Heatmap

1. Navigate to **Dashboard > Heatmap**
2. All cameras are displayed as markers on the map
3. Click any marker to view camera details:
   - Camera name and ID
   - Current people count
   - Risk level
   - Coverage radius
   - Exact coordinates
4. Use filters to show only specific risk levels:
   - Low (0-100 people)
   - Medium (101-250 people)
   - High (251+ people)
5. Toggle "Show Heatmap" to see coverage areas
6. Toggle "Show Markers" to hide/show camera pins

---

## Technical Details

### Camera Data Structure

```typescript
interface Camera {
  id: string;              // Auto-generated (CAM-001, CAM-002, etc.)
  name: string;            // User-defined name
  location: string;        // Descriptive location
  latitude: number;        // GPS latitude
  longitude: number;       // GPS longitude
  radius: number;          // Coverage radius in meters
  alertThreshold: number;  // Alert trigger threshold
  resolution: string;      // Camera resolution (1920x1080, etc.)
  fps: number;            // Frames per second
  status: "online" | "offline";
  peopleCount?: number;    // Real-time detected count
  riskLevel?: "low" | "medium" | "high";
  addedAt: string;        // ISO timestamp
}
```

### Storage API

```typescript
import { CameraStorage } from "@/lib/camera-storage";

// Get all cameras
const cameras = CameraStorage.getAllCameras();

// Add new camera
const newCamera = CameraStorage.addCamera({
  name: "New Camera",
  location: "Building A",
  latitude: 28.614,
  longitude: 77.209,
  radius: 50,
  alertThreshold: 200,
  resolution: "1920x1080",
  fps: 30,
});

// Update camera detection data
CameraStorage.updateCameraDetection("CAM-001", 150, "medium");

// Delete camera
CameraStorage.deleteCamera("CAM-001");

// Reset to defaults
CameraStorage.resetToDefaults();
```

### Real-time Updates

Components listen to camera updates using custom events:

```typescript
useEffect(() => {
  const handleCamerasUpdated = () => {
    // Reload cameras
    loadCameras();
  };

  window.addEventListener("cameras-updated", handleCamerasUpdated);
  return () => window.removeEventListener("cameras-updated", handleCamerasUpdated);
}, []);
```

---

## Map Features

### Interactive Map (Add Camera Dialog)

- **Base layer**: OpenStreetMap tiles
- **Click to select**: Click anywhere to set coordinates
- **Visual feedback**: Marker shows selected location
- **Zoom**: Default zoom level 15 (street level)
- **Center**: Automatically centers on current coordinates

### Heatmap Visualization

- **Dynamic markers**: All cameras shown with pins
- **Coverage circles**: Visual radius for each camera
- **Risk colors**:
  - 🟢 Green: Low risk (0-100 people)
  - 🟡 Yellow: Medium risk (101-250 people)
  - 🔴 Red: High risk (251+ people)
- **Popup info**: Click any marker for details
- **Filtering**: Show/hide cameras by risk level
- **Layer controls**: Toggle heatmap and markers independently

---

## Default Cameras

The system comes pre-configured with 5 sample cameras:

1. **CAM-001** - Main Entrance (28.6139, 77.2090) - High Risk
2. **CAM-002** - Food Court (28.6142, 77.2095) - Medium Risk
3. **CAM-003** - Parking Area (28.6135, 77.2088) - Low Risk
4. **CAM-004** - Exhibition Hall (28.6145, 77.2100) - Low Risk
5. **CAM-005** - Conference Room (28.6140, 77.2092) - Low Risk

---

## Benefits

✅ **Real-world accuracy** - Actual GPS coordinates instead of simulated data
✅ **Easy camera placement** - Visual map selection is intuitive
✅ **Persistent storage** - Cameras saved in browser localStorage
✅ **Real-time sync** - Changes instantly reflect across all pages
✅ **Professional visualization** - OpenStreetMap provides real geographic context
✅ **Scalable** - Add unlimited cameras with coordinates
✅ **No backend required** - Fully client-side storage solution

---

## Future Enhancements

- [ ] Export/Import camera configurations
- [ ] Camera grouping and zones
- [ ] Historical heatmap playback
- [ ] Camera offline status detection
- [ ] Batch camera upload via CSV
- [ ] Integration with real camera feeds via RTSP
- [ ] Firebase Firestore sync (optional cloud backup)

---

## Troubleshooting

### Map Not Loading

- Ensure you have internet connection (OpenStreetMap tiles require internet)
- Check browser console for Leaflet errors
- Try refreshing the page

### Cameras Not Appearing on Heatmap

- Check if cameras are added in the Cameras page
- Verify localStorage is enabled in browser
- Check browser console for storage errors
- Try clicking "Reset to Defaults" in storage service

### Coordinates Not Updating

- Click directly on the map (not on the marker)
- Ensure the map is fully loaded before clicking
- Check that latitude/longitude fields are not disabled

---

## Support

For issues or feature requests, please check:
- Project documentation in `/docs`
- Browser console for error messages
- GitHub issues (if applicable)

---

**Last Updated**: 2024
**Version**: 1.0.0
**Feature**: Camera Management with Leaflet Integration