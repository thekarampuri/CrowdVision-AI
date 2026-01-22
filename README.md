# CrowdVision AI

**AI-Powered Crowd Detection & Surveillance System**

CrowdVision AI is a real-time crowd monitoring and public safety system built to help authorities understand, manage, and respond to crowd situations during large public gatherings. The platform combines computer vision, geospatial visualization with Leaflet maps, and intelligent alerting to turn raw camera feeds into actionable insights.

---

## 🎯 Key Features

### 🔐 Authentication
- Firebase-based email/password authentication
- Google OAuth integration
- Protected dashboard routes with role-based access
- Guest access for demos

### 📊 Real-Time Dashboard
- Live crowd count across all cameras
- Active camera monitoring
- Overall risk status (Safe / Warning / Critical)
- Active alerts with severity indicators
- Recent activity feed with timestamps
- System health monitoring

### 🎥 Live Camera Monitoring
- Real-time webcam or camera feed support
- YOLOv8-powered person detection
- Bounding boxes around detected people
- Per-camera crowd count and risk visualization
- Grid and list view modes
- Fullscreen mode with pause controls
- FPS and camera health indicators

### 🗺️ Interactive Heatmap (Leaflet Integration)
- **Real Leaflet map integration** with OpenStreetMap tiles
- Interactive camera location markers
- Real-time crowd density visualization
- Coverage radius circles for each camera
- Risk-level color coding (green/yellow/red)
- Click-to-view camera details
- Filter by risk level (low/medium/high)
- Toggle heatmap layers and markers

### 📈 Analytics Dashboard
- Time-series crowd count trends
- Camera-wise density comparison
- Peak hour detection
- Density distribution charts
- Configurable time ranges (24h, 7d, 30d)

### 🚨 Alert Management
- Real-time alerts with severity levels
- Active, acknowledged, and resolved states
- Alert acknowledgment workflow
- Automatic risk-based triggering
- Alert history and filtering
- Response time tracking

### 🎛️ Camera Management
- Add, edit, and remove cameras
- Configure geo-coordinates and coverage radius
- Set custom alert thresholds
- Camera health monitoring
- Inline editing with validation

### 📱 Export & Reports
- PDF report generation
- CSV data export
- Alert history logs
- Analytics visualization export

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** (App Router)
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Leaflet** & **react-leaflet** for interactive maps
- **Recharts** for data visualization
- **Shadcn UI** components

### Backend
- **Python 3.8+** for ML inference
- **Flask** API server
- **YOLOv8** (Ultralytics) for person detection
- **OpenCV** for video processing

### Database & Auth
- **Firebase** Authentication
- **Firestore** for data storage

### Deployment
- **Vercel** ready for frontend
- **Python server** for ML inference (separate deployment)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/pnpm
- Python 3.8+
- Firebase account (configuration included)

### Installation

#### 1. Clone the repository
```bash
git clone <repository-url>
cd CrowdVision-AI
```

#### 2. Install Frontend Dependencies
```bash
npm install
# or
pnpm install
```

#### 3. Setup ML Inference Server
```bash
cd ml-server
pip install -r requirements.txt
```

#### 4. Start the ML Server
```bash
# Windows
start_server.bat

# Linux/Mac
chmod +x start_server.sh
./start_server.sh
```

The ML server will start on `http://localhost:5000`

#### 5. Start the Next.js Development Server
```bash
cd ..
npm run dev
```

The web application will be available at `http://localhost:3000`

---

## 📁 Project Structure

```
CrowdVision-AI/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   │   └── detect-crowd/     # Crowd detection endpoint
│   ├── dashboard/            # Dashboard pages
│   │   ├── alerts/           # Alerts page
│   │   ├── analytics/        # Analytics page
│   │   ├── cameras/          # Camera management
│   │   ├── heatmap/          # Leaflet map heatmap
│   │   ├── history/          # Alert history
│   │   ├── reports/          # Reports & exports
│   │   └── settings/         # Settings page
│   ├── globals.css           # Global styles (includes Leaflet CSS)
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Auth/landing page
│
├── components/               # React components
│   ├── ui/                   # Shadcn UI components
│   ├── heatmap-view.tsx      # Leaflet map integration
│   ├── map.tsx               # Reusable map component
│   ├── camera-feed.tsx       # Live camera feed
│   ├── alert-card.tsx        # Alert display
│   └── dashboard-layout.tsx  # Dashboard wrapper
│
├── lib/                      # Utilities & contexts
│   ├── auth-context.tsx      # Firebase auth
│   ├── theme-context.tsx     # Theme management
│   └── firebase.ts           # Firebase config
│
├── ml-server/                # Python ML inference server
│   ├── app.py                # Flask server
│   ├── models/               # YOLOv8 model files
│   ├── utils/                # Processing utilities
│   └── requirements.txt      # Python dependencies
│
├── backend/                  # Advanced detection & tracking
│   ├── advanced_crowd_detection.py
│   ├── camera_feed_server.py
│   └── requirements.txt
│
├── public/                   # Static assets
│   └── *.png, *.svg          # Icons and images
│
├── docs/                     # Documentation
│   ├── SETUP_GUIDE.md
│   ├── PROJECT_STRUCTURE.md
│   └── MODEL_INTEGRATION.md
│
├── package.json              # Node dependencies
├── tsconfig.json             # TypeScript config
├── tailwind.config.ts        # Tailwind config
└── next.config.mjs           # Next.js config
```

---

## 🧠 ML Model Details

- **Model**: YOLOv8n (Nano) - Ultralytics
- **Framework**: PyTorch
- **Input**: 640x640 RGB images
- **Output**: Person bounding boxes with confidence scores
- **Performance**: 30+ FPS on CPU, 100+ FPS on GPU
- **Detection Class**: Person (COCO class ID: 0)

### Risk Level Thresholds
- **Low** (Safe): 0 people
- **Medium** (Warning): 1-9 people
- **High** (Critical): 10+ people

---

## 🌍 Deploying to Production

### Frontend Deployment (Vercel)

1. **Push to GitHub/GitLab**
   ```bash
   git push origin main
   ```

2. **Deploy on Vercel**
   - Import your repository on [Vercel](https://vercel.com)
   - Configure build settings (auto-detected for Next.js)
   - Add environment variables in Vercel dashboard
   - Deploy!

3. **Environment Variables**
   Add these in Vercel dashboard:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_ML_SERVER_URL=https://your-ml-server.com
   ```

### ML Server Deployment

Deploy the Python ML server separately:

- **Railway**: Python app deployment
- **Render**: Web service deployment
- **AWS EC2/Lambda**: Custom server setup
- **Google Cloud Run**: Containerized deployment

Example for Railway:
```bash
cd ml-server
railway login
railway init
railway up
```

---

## 🔧 Configuration

### Camera Configuration
Edit camera locations in `components/heatmap-view.tsx`:
```typescript
const cameraLocations = [
  {
    id: "CAM-001",
    name: "Main Entrance",
    lat: 28.6139,    // Latitude
    lng: 77.209,     // Longitude
    peopleCount: 342,
    riskLevel: "high",
    radius: 50,      // Coverage radius in meters
  },
  // Add more cameras...
]
```

### Map Center
Change default map center in `components/heatmap-view.tsx`:
```typescript
const mapCenter: LatLngExpression = [28.614, 77.2091]; // [lat, lng]
```

---

## 📊 Features Overview

| Feature | Status | Description |
|---------|--------|-------------|
| Authentication | ✅ | Email/Password + Google OAuth |
| Dashboard | ✅ | Real-time overview with stats |
| Camera Feeds | ✅ | Live monitoring with YOLOv8 |
| Leaflet Heatmap | ✅ | Interactive map with real tiles |
| Analytics | ✅ | Charts and trend analysis |
| Alerts | ✅ | Multi-level alert system |
| Reports | ✅ | PDF/CSV export |
| Mobile App | 🚧 | React Native (in progress) |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **YOLOv8** by Ultralytics for person detection
- **Leaflet** for interactive mapping
- **Next.js** team for the amazing framework
- **OpenStreetMap** for map tiles
- **Firebase** for authentication and database
- **Vercel** for deployment platform

---

## 📧 Contact & Support

For questions, issues, or feature requests:
- Open an issue on GitHub
- Contact the development team
- Check the [docs](./docs) folder for detailed guides

---

## 🎯 Roadmap

- [ ] Real-time WebSocket updates for all clients
- [ ] Advanced crowd flow analysis
- [ ] Multi-camera correlation
- [ ] Automatic face blurring for privacy
- [ ] Historical heatmap playback
- [ ] Mobile app completion
- [ ] Edge device deployment

---

**Built with ❤️ for public safety and smart city initiatives**