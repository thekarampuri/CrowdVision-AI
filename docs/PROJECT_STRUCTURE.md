# AI Based Crowd Watcher for Public Safety - Project Structure

Complete documentation of the project architecture, directory organization, and file purposes.

---

## 📁 Root Directory Structure

```
AI Based Crowd Watcher for Public Safety/
├── app/                          # Next.js App Router pages and API routes
├── components/                   # React UI components
├── docs/                         # Project documentation
├── hooks/                        # Custom React hooks
├── lib/                          # Utility libraries and configurations
├── ml-server/                    # Python ML inference server
├── public/                       # Static assets
├── styles/                       # Global styles
├── .gitignore                    # Git ignore rules
├── .next/                        # Next.js build output (auto-generated)
├── components.json               # shadcn/ui configuration
├── crowd_gathering.mp4           # Sample test video
├── crowd_gathering.py            # Legacy crowd detection script
├── firestore.rules               # Firebase security rules
├── next.config.mjs               # Next.js configuration
├── package.json                  # Node.js dependencies
├── package-lock.json             # Locked dependency versions
├── pnpm-lock.yaml                # pnpm lock file
├── postcss.config.mjs            # PostCSS configuration
├── README.md                     # Main project README
├── tsconfig.json                 # TypeScript configuration
└── LICENSE                       # Project license
```

---

## 🎨 Frontend Structure

### `/app` - Next.js Application

```
app/
├── api/                          # API Routes
│   └── detect-crowd/
│       └── route.ts             # Crowd detection API endpoint
│
├── dashboard/                    # Dashboard pages
│   ├── alerts/
│   │   └── page.tsx             # Active alerts page
│   ├── analytics/
│   │   └── page.tsx             # Crowd analytics & charts
│   ├── cameras/
│   │   └── page.tsx             # Live camera monitoring
│   ├── heatmap/
│   │   └── page.tsx             # Geographic heatmap view
│   ├── history/
│   │   └── page.tsx             # Alert history & logs
│   ├── reports/
│   │   └── page.tsx             # Report generation
│   ├── settings/
│   │   └── page.tsx             # System settings
│   ├── page.tsx                 # Dashboard overview
│   └── loading.tsx              # Dashboard loading state
│
├── globals.css                   # Global CSS styles
├── layout.tsx                    # Root layout component
└── page.tsx                      # Landing/login page
```

#### Key Files

- **`api/detect-crowd/route.ts`**: 
  - Receives base64 images from frontend
  - Forwards to Python ML server (localhost:5000)
  - Stores high-risk alerts in Firestore
  - Triggers push notifications

- **`dashboard/page.tsx`**: 
  - Main dashboard with stats overview
  - Real-time updates
  - System health indicators

- **`dashboard/cameras/page.tsx`**:
  - Live camera feeds
  - Real-time person detection
  - Bounding box visualization

- **`dashboard/heatmap/page.tsx`**:
  - Google Maps integration
  - Camera location markers
  - Crowd density heatmap overlay

---

### `/components` - React Components

```
components/
├── ui/                           # shadcn/ui base components
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── tabs.tsx
│   ├── toast.tsx
│   └── ... (30+ UI components)
│
├── add-camera-dialog.tsx         # Dialog for adding new cameras
├── alert-banner.tsx              # Top banner for active alerts
├── alert-card.tsx                # Individual alert display card
├── camera-bar-chart.tsx          # Camera density comparison chart
├── camera-feed.tsx               # Single camera feed component
├── camera-management-card.tsx    # Camera CRUD operations
├── crowd-line-chart.tsx          # Time-series crowd chart
├── dashboard-layout.tsx          # Dashboard wrapper with sidebar
├── heatmap-view.tsx              # Map with heatmap overlay
├── stats-card.tsx                # Statistics display card
├── theme-provider.tsx            # Dark/light theme provider
└── webcam-feed.tsx               # Webcam capture component
```

#### Component Purposes

**Dashboard Components:**
- `dashboard-layout.tsx`: Sidebar navigation, header, breadcrumbs
- `stats-card.tsx`: Reusable metric display (people count, alerts, etc.)
- `alert-banner.tsx`: Persistent alert notification banner

**Camera Components:**
- `webcam-feed.tsx`: Captures frames, sends to API, displays detections
- `camera-feed.tsx`: Displays individual camera with controls
- `camera-management-card.tsx`: Add/edit/delete camera configurations

**Analytics Components:**
- `crowd-line-chart.tsx`: Line chart showing crowd trends over time
- `camera-bar-chart.tsx`: Bar chart comparing camera densities

**Map Components:**
- `heatmap-view.tsx`: Google Maps with markers and heatmap layer

---

### `/lib` - Utilities & Configuration

```
lib/
├── firebase.ts                   # Firebase initialization & exports
└── utils.ts                      # Utility functions (cn, etc.)
```

- **`firebase.ts`**: Firebase config, Firestore, Auth instances
- **`utils.ts`**: Helper functions (className merging, formatters)

---

### `/hooks` - Custom React Hooks

```
hooks/
└── use-mobile.ts                 # Mobile device detection hook
```

---

### `/styles` - Global Styles

```
styles/
└── globals.css                   # Additional global styles
```

---

## 🤖 ML Server Structure

### `/ml-server` - Python Inference Server

```
ml-server/
├── models/                       # Model files
│   ├── yolov8n.pt               # YOLOv8 nano weights (6MB)
│   └── model_config.json        # Model metadata & configuration
│
├── utils/                        # Utility modules
│   └── image_utils.py           # Image processing functions
│
├── app.py                        # Main Flask application
├── requirements.txt              # Python dependencies
├── start_server.bat             # Windows startup script
├── start_server.sh              # Linux/Mac startup script
├── test_server.py               # ML server unit tests
├── test_integration.py          # End-to-end integration tests
├── .gitignore                   # Python-specific ignores
└── README.md                     # ML server documentation
```

#### Key ML Server Files

**`app.py`** - Main Flask Server
- **Endpoints**:
  - `GET /health`: Server health check
  - `POST /detect`: Person detection endpoint
  - `GET /config`: Get current configuration
  - `POST /config`: Update configuration

- **Functionality**:
  - Loads YOLOv8 model on startup
  - Receives base64 images
  - Runs inference with configurable thresholds
  - Returns detections with risk level
  - Detects gatherings (people in close proximity)

**`models/yolov8n.pt`** - YOLO Model
- Pre-trained on COCO dataset
- Detects 80 classes (filtered to 'person' only)
- 3.2M parameters, ~6MB file size
- 30+ FPS on CPU, 100+ FPS on GPU

**`utils/image_utils.py`** - Image Processing
- Base64 ↔ OpenCV conversion
- Image resizing with letterboxing
- Normalization functions
- Detection drawing utilities
- Heatmap generation
- Image validation

**Test Scripts**:
- `test_server.py`: Tests individual endpoints
- `test_integration.py`: Full pipeline E2E tests

---

## 📄 Configuration Files

### TypeScript & Next.js

**`tsconfig.json`**
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**`next.config.mjs`**
- Configures Next.js build settings
- Environment variables
- Image optimization

**`components.json`**
- shadcn/ui component configuration
- Tailwind CSS integration

---

### Python & ML

**`ml-server/requirements.txt`**
```
ultralytics==8.3.0        # YOLOv8
opencv-python==4.10.0     # Computer vision
flask==3.0.0              # Web server
flask-cors==4.0.0         # CORS support
torch==2.1.0              # PyTorch
numpy==1.24.3             # Numerical ops
```

**`ml-server/models/model_config.json`**
- Model metadata
- Input/output specifications
- Risk thresholds
- Performance metrics

---

### Firebase

**`firestore.rules`**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /alerts/{alertId} {
      allow read, write: if request.auth != null;
    }
    match /cameras/{cameraId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

**`lib/firebase.ts`**
- Project ID: `AI Based Crowd Watcher for Public Safety-7e13f`
- Collections: `/alerts`, `/cameras`, `/users`

---

## 📚 Documentation

### `/docs` - Project Documentation

```
docs/
├── MODEL_INTEGRATION.md          # ML model integration guide
├── PROJECT_STRUCTURE.md          # This file
├── SETUP_GUIDE.md               # Complete setup instructions
└── ANDROID_APP_PROMPT.md        # (To be created)
```

---

## 🔄 Data Flow

### 1. Image Capture → Detection Pipeline

```
[Camera/Webcam]
      ↓
[Webcam Feed Component]
  - Captures frame every 2-3 seconds
  - Converts to base64 JPEG
      ↓
[Next.js API: /api/detect-crowd]
  - Receives base64 image
  - Forwards to ML server
      ↓
[Flask ML Server: /detect]
  - Decodes base64 → OpenCV image
  - Runs YOLOv8 inference
  - Counts people
  - Calculates risk level
  - Detects gatherings
      ↓
[Response JSON]
{
  "count": 15,
  "riskLevel": "medium",
  "detections": [...],
  "gatherings": 2
}
      ↓
[Next.js API]
  - If high risk → Store alert in Firestore
  - Send push notification to mobile app
      ↓
[Frontend Updates]
  - Display bounding boxes
  - Update stats
  - Show alerts
```

---

### 2. Firestore Data Structure

```
/alerts
  ├── {alertId}
  │   ├── cameraId: string
  │   ├── count: number
  │   ├── riskLevel: "low" | "medium" | "high"
  │   ├── timestamp: Timestamp
  │   ├── acknowledged: boolean
  │   ├── location: string
  │   └── message: string

/cameras
  ├── {cameraId}
  │   ├── name: string
  │   ├── location: string
  │   ├── latitude: number
  │   ├── longitude: number
  │   ├── isActive: boolean
  │   ├── thresholds: object
  │   └── lastSeen: Timestamp

/users
  ├── {userId}
  │   ├── email: string
  │   ├── role: "admin" | "operator"
  │   └── settings: object
```

---

## 🚀 Build & Deployment

### Development

```bash
# Terminal 1: Start ML Server
cd ml-server
python app.py

# Terminal 2: Start Next.js
cd ..
npm run dev
```

### Production Build

```bash
# Build frontend
npm run build
npm start

# ML Server with Gunicorn
cd ml-server
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

---

## 🧪 Testing

### Frontend Tests
- Manual testing in browser
- Component testing (to be added)

### ML Server Tests
```bash
cd ml-server

# Unit tests
python test_server.py

# Integration tests
python test_integration.py
```

---

## 📦 Dependencies

### Frontend (package.json)
- **Framework**: Next.js 16.0, React 19.2
- **UI**: Radix UI, Tailwind CSS
- **Firebase**: firebase 12.7.0
- **Charts**: recharts 2.15.4
- **Maps**: Google Maps JavaScript API
- **Forms**: react-hook-form, zod

### ML Server (requirements.txt)
- **ML**: ultralytics (YOLOv8), torch, torchvision
- **Vision**: opencv-python
- **Server**: flask, flask-cors
- **Utils**: numpy, pillow

---

## 🔐 Environment Variables

### `.env.local` (Optional)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_ML_SERVER_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```

### ML Server Environment
```bash
MODEL_PATH=models/yolov8n.pt
CONFIDENCE_THRESHOLD=0.5
IOU_THRESHOLD=0.4
```

---

## 📱 Future: Android App Structure

```
android/
├── app/
│   ├── src/main/java/com/crowdvision/
│   │   ├── MainActivity.kt
│   │   ├── ui/
│   │   │   ├── dashboard/
│   │   │   ├── alerts/
│   │   │   └── map/
│   │   ├── data/
│   │   │   ├── models/
│   │   │   └── repository/
│   │   └── services/
│   │       └── FCMService.kt
│   └── src/main/res/
├── build.gradle
└── google-services.json
```

---

## 🎯 Key Technologies

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 16 | React framework with App Router |
| UI | Tailwind CSS + Radix UI | Styling & components |
| Backend API | Next.js API Routes | REST endpoints |
| Database | Firebase Firestore | NoSQL cloud database |
| Auth | Firebase Auth | User authentication |
| ML Framework | YOLOv8 (Ultralytics) | Object detection |
| ML Server | Flask | Python API server |
| Computer Vision | OpenCV | Image processing |
| Maps | Google Maps API | Geospatial visualization |
| Charts | Recharts | Data visualization |

---

## 📊 File Statistics

- **Total Lines of Code**: ~15,000+
- **Frontend Components**: 40+
- **API Endpoints**: 5
- **ML Server Endpoints**: 4
- **Firestore Collections**: 3
- **Documentation Pages**: 4

---

## 🔗 File Relationships

### Critical Path: Image → Detection

1. `components/webcam-feed.tsx` captures image
2. `app/api/detect-crowd/route.ts` receives request
3. `ml-server/app.py` processes with YOLOv8
4. `ml-server/utils/image_utils.py` handles conversion
5. `lib/firebase.ts` stores alerts
6. `components/alert-card.tsx` displays results

---

## 🛠️ Development Workflow

1. **Start ML Server**: `cd ml-server && python app.py`
2. **Start Frontend**: `npm run dev`
3. **Test Changes**: `http://localhost:3000`
4. **Check ML API**: `http://localhost:5000/health`
5. **Monitor Logs**: Terminal output + Browser console
6. **Debug**: Chrome DevTools + Python print statements

---

## 📝 Notes

- All paths use forward slashes (`/`) for cross-platform compatibility
- Firebase config is public (protected by security rules)
- ML model file is ~6MB (excluded from git with proper .gitignore)
- TypeScript strict mode enabled for type safety
- Python virtual environment recommended for ML server

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Maintainer**: AI Based Crowd Watcher for Public Safety Team