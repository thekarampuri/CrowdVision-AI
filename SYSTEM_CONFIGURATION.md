# AI Based Crowd Watcher for Public Safety - System Configuration Summary

## 📊 Risk Thresholds

### People Count Classification
- **Low (Safe)**: 0 people
- **Medium**: 1-9 people
- **High (Critical)**: 10+ people

### Alert Trigger Rules
- **No Alert**: 0-9 people detected
- **High Risk Alert**: 10+ people detected
  - Stored in `high_risk_alerts` collection
  - 1-minute cooldown between alerts for same camera
  - Auto-resolves after 1 second → moves to History

---

## 🎨 Heatmap Color Coding

| People Count | Color | Status | Visual Indicator |
|--------------|-------|--------|------------------|
| 0 | 🟢 Green | Safe | Green circle & marker |
| 1-9 | 🟡 Yellow | Medium | Yellow circle & marker |
| 10+ | 🔴 Red | High Risk | Red circle & marker |

---

## 🗄️ Firebase Collections

### Primary Collection: `high_risk_alerts`
Stores all high-risk alerts (10+ people detected)

**Structure:**
```json
{
  "id": "auto-generated-firestore-id",
  "title": "High Crowd Density - {Camera Name}",
  "description": "Critical: Crowd count has exceeded threshold with {count} people detected",
  "severity": "critical",
  "location": "Building A - Ground Floor",
  "cameraId": "CAM-001",
  "cameraName": "Main Entrance",
  "peopleCount": 15,
  "latitude": 17.6599,
  "longitude": 75.9064,
  "timestamp": "Firestore Timestamp",
  "status": "active",
  "acknowledgedAt": null,
  "resolvedAt": null
}
```

### Old Collection: `alerts` (Deprecated)
- Should be deleted using Settings page
- All new alerts go to `high_risk_alerts`

---

## 🎯 Detection & Alert Flow

```
Every 2 seconds:
├─ Webcam captures frame
├─ ML Server processes detection
├─ People count returned
│
├─ Count = 0
│  ├─> Risk: Low (Safe) ✅
│  ├─> Color: Green 🟢
│  └─> Alert: None
│
├─ Count = 1-9
│  ├─> Risk: Medium ⚠️
│  ├─> Color: Yellow 🟡
│  └─> Alert: None
│
└─ Count = 10+
   ├─> Risk: High (Critical) 🚨
   ├─> Color: Red 🔴
   ├─> Check: Alert in last 60 seconds?
   │   ├─> YES: Skip creation (cooldown active)
   │   └─> NO: Create alert
   │       ├─> Store in Firebase `high_risk_alerts`
   │       ├─> Status: "active"
   │       ├─> Wait 1 second
   │       └─> Auto-resolve → Status: "resolved"
   └─> Alert appears in History page
```

---

## 📄 Page Behaviors

### Dashboard
- **Real-time stats** from cameras and alerts
- **Total Cameras**: All configured cameras
- **Active Cameras**: Online cameras only
- **Total People**: Sum of all camera detections
- **Active Alerts**: Count of active high-risk alerts
- **Risk Level**: 
  - Safe: 0 people total
  - Medium: 1-9 people total
  - Critical: 10+ people OR active critical alerts
- **Recent Alerts**: Last 4 alerts from Firebase
- **Camera Overview**: Shows all cameras with live people count

### Alerts Page
- Shows **active** and **acknowledged** alerts only
- Fetches from `high_risk_alerts` collection
- Filter by status (all/active/acknowledged/resolved)
- Filter by severity (all/critical/warning/info)
- Acknowledge/Resolve buttons
- Real-time updates

### History Page
- Shows only **resolved** alerts
- Fetches from `high_risk_alerts` collection
- Filter by severity and date range (7d/30d/90d)
- Search functionality
- Calculates response times
- No CSV export

### Heatmap Page
- Dynamic marker colors based on people count
- Dynamic circle colors based on people count
- Real-time color updates every 2 seconds
- Filter by risk level
- Toggle heatmap and markers
- Click markers for camera details
- **Legend:**
  - 🟢 Safe: 0 people
  - 🟡 Medium: 1-9 people
  - 🔴 High: 10+ people

### Live Cameras Page
- Real-time webcam detection (CAM-001 only)
- Detection runs every 2 seconds
- Bounding boxes around detected people
- Risk level display
- Add/Delete camera functionality
- ML server status indicator

### Settings Page
- Camera management (add/edit/delete)
- **Admin Actions:**
  - Clear All High Risk Alerts (red button)
  - Delete Old Alerts Collection (orange button)

---

## 🚀 Startup Process

Run `start.bat`:
1. Checks Node.js installation
2. Checks Python installation
3. Installs npm dependencies (if needed)
4. Installs Python dependencies (if needed)
5. Starts ML server (port 5000) in background
6. Waits 5 seconds
7. Starts Next.js frontend (port 3000)
8. Both run in single terminal
9. Ctrl+C stops both servers

---

## 🔥 Firebase Setup

### Collections
- `high_risk_alerts` - Active collection for all alerts
- `alerts` - Old collection (should be deleted)

### Required Actions
1. Go to Settings page
2. Click "Delete Old Alerts Collection"
3. Confirm deletion
4. Old collection removed
5. Only `high_risk_alerts` remains

---

## 🎨 Color System

### Heatmap Circles
- Opacity: 0.3 (fill), 0.6 (border)
- Radius: Camera radius × 2
- Color updates in real-time

### Marker Icons
- Custom SVG markers
- Color based on people count
- Size: 32×45 pixels
- Drop shadow for depth

### Risk Indicators
- Green: #22c55e
- Yellow: #eab308
- Red: #ef4444

---

## ⚙️ ML Server Configuration

**File:** `ml-server/app.py`

**Model:** YOLOv8n (Nano)
- Confidence threshold: 0.5
- IOU threshold: 0.4
- Detection class: Person (COCO ID: 0)

**API Endpoints:**
- `/health` - Health check
- `/detect` - Crowd detection (POST)
- `/config` - Get/update configuration

**Response Format:**
```json
{
  "count": 15,
  "riskLevel": "high",
  "detections": [...],
  "gatherings": 2,
  "hasGathering": true,
  "timestamp": "2024-01-15T10:30:00Z",
  "cameraId": "CAM-001",
  "imageSize": {"width": 640, "height": 480}
}
```

---

## 📍 Default Location

**City:** Solapur, Maharashtra, India
**Coordinates:** 17.6599°N, 75.9064°E

**Applied to:**
- Default camera location
- Map center (all map instances)
- Add Camera Dialog default
- Heatmap default center

---

## 🔐 Authentication

- Firebase Authentication
- Email/Password login
- Google OAuth
- Guest access
- Protected dashboard routes

---

## 📱 Camera Data Storage

**Storage:** Browser localStorage
**Key:** `crowdvision_cameras`

**Default Camera:**
```json
{
  "id": "CAM-001",
  "name": "Main Entrance",
  "location": "Building A - Ground Floor",
  "latitude": 17.6599,
  "longitude": 75.9064,
  "radius": 50,
  "alertThreshold": 200,
  "resolution": "1920x1080",
  "fps": 30,
  "status": "online",
  "peopleCount": 0,
  "riskLevel": "low"
}
```

---

## 🔄 Real-time Updates

### Update Triggers
- Camera detection every 2 seconds
- Alert creation → dispatches "alerts-updated" event
- Camera changes → dispatches "cameras-updated" event

### Listening Components
- Dashboard: cameras-updated, alerts-updated
- Alerts Page: alerts-updated
- History Page: alerts-updated
- Heatmap: cameras-updated
- Settings: cameras-updated

---

## 🎯 Testing Checklist

### 1. Clear Old Data
- [ ] Go to Settings
- [ ] Click "Delete Old Alerts Collection"
- [ ] Click "Clear All High Risk Alerts"
- [ ] Verify both collections empty

### 2. Test Detection Thresholds
- [ ] Show 0 fingers → Green color
- [ ] Show 5 fingers → Yellow color
- [ ] Show 10+ fingers → Red color, alert created

### 3. Test Alert Cooldown
- [ ] Show 10+ fingers
- [ ] Alert created in Firebase
- [ ] Keep showing 10+ fingers for 60 seconds
- [ ] Verify no duplicate alerts
- [ ] After 60 seconds, new alert can be created

### 4. Test Heatmap Colors
- [ ] Verify marker color matches people count
- [ ] Verify circle color matches people count
- [ ] Colors update every 2 seconds

### 5. Test Dashboard
- [ ] Verify camera count is correct
- [ ] Verify total people sum is correct
- [ ] Verify active alerts count
- [ ] Verify risk level calculation

---

## 🐛 Common Issues

### Issue: Alerts not creating
**Solution:** Check ML server is running on port 5000

### Issue: Markers showing wrong color
**Solution:** Ensure peopleCount is updating in camera storage

### Issue: Firebase index error
**Solution:** Already fixed with simplified queries

### Issue: Duplicate alerts
**Solution:** 1-minute cooldown prevents duplicates

### Issue: Old alerts showing
**Solution:** Delete old "alerts" collection from Settings

---

## 📊 Statistics

- **Detection Frequency:** Every 2 seconds
- **Alert Cooldown:** 60 seconds per camera
- **Auto-resolve Time:** 1 second after creation
- **Dashboard Refresh:** Every 5 seconds
- **Max Alerts Display:** 100 (limited by query)

---

## 🎨 UI Theme

- Dark mode by default
- Glassmorphism design
- Cyber-blue accents
- Animated backgrounds
- Gradient buttons

---

## 📦 Dependencies

### Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Leaflet & react-leaflet
- Firebase SDK
- Recharts

### Backend (ML Server)
- Python 3.8+
- Flask
- YOLOv8 (Ultralytics)
- OpenCV
- NumPy

---

**Last Updated:** 2024
**Version:** 2.0.0
**Collection:** high_risk_alerts
**Thresholds:** 0 (low), 1-9 (medium), 10+ (high)