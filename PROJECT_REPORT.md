# 📄 AI Based Crowd Watcher for Public Safety - Detailed Project Report

## 1. 📖 Executive Overview
**AI Based Crowd Watcher for Public Safety** is a state-of-the-art surveillance ecosystem designed to enhance public safety through real-time crowd monitoring and intelligent alerting. By leveraging Computer Vision (AI) and Geospatial Mapping, the system transforms traditional passive CCTV feeds into active, data-driven security insights. It provides a comprehensive solution for monitoring crowd density, detecting high-risk gatherings, and coordinating field response via a dedicated mobile application.

---

## 2. 🎯 Problem Statement
Traditional surveillance systems suffer from significant limitations:
*   **Passive Monitoring**: Security personnel cannot monitor hundreds of camera feeds simultaneously 24/7.
*   **Delayed Response**: Incidents are often reviewed only *after* they occur.
*   **Lack of Data**: No real-time quantification of crowd sizes or density.
*   **Disconnect**: Field officers lack real-time context and rely on radio communications that can be slow or unclear.

## 3. 💡 Solution
AI Based Crowd Watcher for Public Safety addresses these challenges with an automated, integrated ecosystem:
1.  **Automated Detection**: AI models continually scan feeds to count people and assess risk.
2.  **Real-Time Visualization**: A central dashboard visualizes data on interactive maps (heatmaps) and charts.
3.  **Instant Alerts**: Threshold-based logic triggers instant alerts when crowd density becomes critical.
4.  **Field Coordination**: A mobile app connects ground staff directly to the central intelligence, delivering alerts and location data instantly.

---

## 4. 🌟 Features & Capabilities

### 🖥️ Central Command Dashboard (Web)
*   **Live Surveillance**: View real-time video feeds with AI bounding boxes.
*   **Geospatial Heatmaps**: Interactive maps (Leaflet) showing camera locations and crowd density with color-coded risk circles (Green/Yellow/Red).
*   **Analytics Suite**: Recharts-powered graphs for historical trends, peak usage times, and alert history.
*   **Camera Management**: Add, edit, and configure camera inputs (RTSP/Webcam), locations, and coverage radii.
*   **Role-Based Access**: Secure login for Admins via Firebase Authentication.

### 🧠 Intelligent Inference Engine (ML Server)
*   **Person Detection**: Utilizes **YOLOv8** (Nano/Medium) for high-speed, accurate person detection.
*   **Crowd Counting**: precise counting of individuals in a frame.
*   **Gathering Detection**: Logic to identify if individuals are forming close groups (potential fights or discussions).
*   **Risk Classification**:
    *   **Low (Safe)**: 0 people
    *   **Medium (Warning)**: 1-9 people
    *   **High (Critical)**: 10+ people

### 📱 Field Officer App (Android)
*   **Push Notifications**: Instant alerts for critical crowd levels.
*   **Incident Management**: List view of active alerts with severity and location.
*   **Map Navigation**: View alert locations on a map relative to the officer's position.
*   **Status Updates**: Acknowledge and resolve alerts from the field, syncing back to the dashboard.

---

## 5. 🎬 Use Cases
1.  **Event Security**: Managing flow and density at concerts, sports stadiums, or festivals.
2.  **Public Transport Hubs**: Monitoring platforms and concourses in train stations or airports to prevent overcrowding.
3.  **Urban Safety**: Monitoring public squares, parks, or protest routes.
4.  **Retail Analytics**: Understanding peak shopping hours and store occupancy.

---

## 6. 🔄 User Flow
1.  **Input**: CCTV/Webcam feeds video to the Local ML Server.
2.  **Processing**:
    *   ML Server captures frames every 2 seconds.
    *   YOLOv8 model detects persons.
    *   System calculates count and determines Risk Level (Safe/Medium/Critical).
3.  **Decision**:
    *   If **Count >= 10** (Critical): Checks cooldown (60s). If clear, generates a **High Risk Alert**.
4.  **Communication**:
    *   Alert is stored in **Firebase Cloud Firestore**.
    *   **Web Dashboard** receives real-time update -> Triggers UI alarm/toast + Updates Heatmap to Red.
    *   **Android App** receives data -> Notifies Field Officer.
5.  **Response**:
    *   Field Officer views alert details and location.
    *   Officer attends scene and marks alert as "Acknowledged" or "Resolved".
6.  **Resolution**: System updates status to "Resolved" and moves it to history. Heatmap returns to Green/Yellow as crowd disperses.

---

## 7. 🏗️ Project Architecture
The system follows a distributed **Client-Server-Mobile** architecture facilitated by **Firebase** as the central data and auth relay.

```mermaid
graph TD
    subgraph "Local Network / Edge"
        Cam[Cameras/CCTV] -->|RTSP/USB| ML[ML Inference Server (Python/Flask)]
        ML -->|Write: Alerts/Stats| FB[(Firebase Firestore)]
    end

    subgraph "Cloud / Backend Services"
        FB <--> Auth[Firebase Auth]
    end

    subgraph "Frontend Clients"
        Web[Web Dashboard (Next.js)] <-->|Read/Write| FB
        Mobile[Android App (Kotlin)] <-->|Read/Update| FB
    end
    
    ML -.->|Local Stream| Web
```

---

## 8. 🛠️ Technology Stack

### 🌐 Frontend (Web Dashboard)
*   **Framework**: Next.js 16.0.10 (React 19, App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS 4, Shadcn UI, Lucide React
*   **Maps**: Leaflet, React-Leaflet
*   **State**: React Hooks, SWR/Firebase Listeners
*   **Validation**: Zod

### 🧠 Backend (ML & AI)
*   **Language**: Python 3.8+
*   **Server**: Flask 3.0 (REST API)
*   **Computer Vision**: OpenCV (cv2)
*   **AI Model**: Ultralytics YOLOv8 (yolov8n.pt / yolov8m.pt)
*   **Math/Data**: NumPy

### 📱 Mobile (Android)
*   **OS**: Android (Min SDK 24, Target SDK 36)
*   **Language**: Kotlin
*   **UI Toolkit**: Jetpack Compose (Material3)
*   **Architecture**: MVVM (Model-View-ViewModel)
*   **Concurrency**: Kotlin Coroutines
*   **Data**: Firebase Firestore KTX

### ☁️ Infrastructure
*   **Database**: Google Cloud Firestore (NoSQL)
*   **Authentication**: Firebase Auth (Email/Google)
*   **Storage**: Firebase Cloud Storage
*   **DevOps**: One-click startup script (`start.bat`)

---

## 9. 📥 Inputs & 📤 Outputs

### Inputs
*   **Video Feed**: Webcam (ID 0) or RTSP Stream URL.
*   **Configuration**:
    *   Confidence Threshold (e.g., 0.5)
    *   Risk Thresholds (Low/Med/High counts)
    *   Camera Locations (Lat/Lng)

### Outputs
*   **Visual Overlay**: Bounding boxes on video feed.
*   **Quantitative Data**: Real-time people count, gathering count.
*   **Risk Assessment**: Level (Low/Medium/High).
*   **Map Visualization**: Color-coded markers (Green/Yellow/Red) and radius circles.
*   **Alert Objects**: JSON records in Firestore with timestamp, location, snapshot (optional), and severity.

---

## 10. 🚀 How to Run the Project

The project includes an automated startup script for Windows.

### Prerequisites
1.  **Node.js** (v18+)
2.  **Python** (v3.8+)
3.  **Android Studio** (for mobile app)
4.  **Firebase Account** with `google-services.json` (Android) and `.env.local` keys (Web).

### One-Click Startup (Windows)
1.  Double-click `start.bat` in the root directory.
2.  The script will:
    *   Check for Node.js and Python.
    *   Install `node_modules` (if missing).
    *   Install Python `requirements.txt` (if missing).
    *   Launch the **ML Server** on port `5000`.
    *   Launch the **Web Dashboard** on port `3000`.

### Manual Startup
**1. ML Server:**
```bash
cd ml-server
pip install -r requirements.txt
python app.py
# Running on http://localhost:5000
```

**2. Web Dashboard:**
```bash
# Root directory
npm install
npm run dev
# Running on http://localhost:3000
```

**3. Android App:**
*   Open `android` folder in Android Studio.
*   Ensure `google-services.json` is in `android/app/`.
*   Connect device/emulator and click **Run**.

---

## 11. 📦 Installation Guide

### Step 1: Clone Repository
```bash
git clone https://github.com/your-repo/crowdvision-ai.git
cd AI Based Crowd Watcher for Public Safety
```

### Step 2: Configure Environment
Create a `.env.local` file in the root directory with your Firebase config:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
# ... other firebase config keys
```

### Step 3: Install Dependencies
For the web and server, simply run `start.bat` once, or install manually as shown in the "Manual Startup" section.

### Step 4: Android Configuration
1.  Go to Firebase Console > Project Settings > General.
2.  Add an Android App (package: `com.tricommits.crowdvisionmobile`).
3.  Download `google-services.json`.
4.  Place it in `AI Based Crowd Watcher for Public Safety/android/app/`.
5.  Sync Gradle in Android Studio.

---

## 12. 🔮 Future Scope
*   **Face Recognition**: Identify known offenders or missing persons.
*   **Anomaly Detection**: Detect running, falling, or violence (Pose Estimation).
*   **Edge Deployment**: Optimize ML models for Raspberry Pi / Jetson Nano for standalone camera units.
*   **Offline Mode**: Full local operation without cloud dependency for sensitive areas.
