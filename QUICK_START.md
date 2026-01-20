# CrowdVision AI - Quick Start Guide

Get your CrowdVision AI system running in **5 minutes**! ⚡

---

## 🎯 What You'll Have Running

- **Web Dashboard**: Real-time crowd monitoring interface
- **ML Inference Server**: YOLOv8-powered person detection
- **Live Detection**: Webcam-based crowd counting with alerts

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Node.js 18+** installed ([Download](https://nodejs.org/))
- [ ] **Python 3.8-3.11** installed ([Download](https://www.python.org/))
- [ ] **Webcam** or camera access
- [ ] **Internet connection** (for Firebase)

---

## ⚡ 5-Minute Setup

### Step 1: Open Two Terminals

You'll need two command windows running simultaneously.

---

### Step 2: Terminal 1 - Start ML Server

```bash
# Navigate to ML server directory
cd E:\Projects\CrowdVision-AI\ml-server

# Windows users - Run startup script
start_server.bat

# Linux/Mac users - Run startup script
chmod +x start_server.sh
./start_server.sh
```

**What to expect:**
```
============================================================
CrowdVision AI - ML Inference Server
============================================================
✓ YOLOv8 model loaded successfully
 * Running on http://0.0.0.0:5000
```

**❌ If you get errors:**
```bash
# Install dependencies manually
pip install ultralytics opencv-python flask flask-cors torch numpy
```

---

### Step 3: Terminal 2 - Start Web Dashboard

```bash
# Navigate to project root
cd E:\Projects\CrowdVision-AI

# Install frontend dependencies (first time only)
npm install

# Start Next.js development server
npm run dev
```

**What to expect:**
```
> crowdvision-ai@0.1.0 dev
> next dev

  ▲ Next.js 16.0.10
  - Local:        http://localhost:3000
  - Ready in 2.3s
```

---

### Step 4: Access the Application

Open your browser and go to:

🌐 **http://localhost:3000**

---

## 🧪 Quick Test

### Test 1: Health Check

Open a new terminal and run:

```bash
curl http://localhost:5000/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

✅ **Success!** ML server is working.

---

### Test 2: Live Detection

1. Go to **http://localhost:3000**
2. Click **"Dashboard"** → **"Cameras"**
3. Click **"Enable Webcam"**
4. Allow camera permissions when prompted
5. Stand in front of the camera

**You should see:**
- ✅ Green bounding boxes around detected people
- ✅ Person count updating in real-time
- ✅ Risk level indicator (Low/Medium/High)

---

## 🎨 Dashboard Navigation

| Page | URL | What You'll See |
|------|-----|-----------------|
| **Overview** | `/dashboard` | Total stats, system health, recent activity |
| **Cameras** | `/dashboard/cameras` | Live feeds with detection boxes |
| **Heatmap** | `/dashboard/heatmap` | Geographic crowd density map |
| **Alerts** | `/dashboard/alerts` | Active high-risk crowd alerts |
| **Analytics** | `/dashboard/analytics` | Charts and trend analysis |
| **History** | `/dashboard/history` | Complete alert logs |

---

## 🔧 Configuration

### Adjust Risk Thresholds

Edit `ml-server/app.py`:

```python
RISK_THRESHOLDS = {
    "low": (0, 10),      # 0-10 people = Safe
    "medium": (11, 25),  # 11-25 people = Warning
    "high": (26, 999),   # 26+ people = Critical
}
```

**Restart ML server after changes:**
```bash
# Press Ctrl+C to stop, then:
python app.py
```

---

### Adjust Detection Sensitivity

Edit `ml-server/app.py`:

```python
CONFIDENCE_THRESHOLD = 0.5  # Lower = more detections (0.3-0.7)
IOU_THRESHOLD = 0.4         # For overlapping boxes (0.3-0.5)
```

**Lower confidence = more detections (may include false positives)**  
**Higher confidence = fewer detections (more accurate)**

---

## 🐛 Common Issues & Fixes

### Issue 1: ML Server Won't Start

**Error:** `ModuleNotFoundError: No module named 'ultralytics'`

**Fix:**
```bash
cd ml-server
pip install -r requirements.txt
```

---

### Issue 2: Port 5000 Already in Use

**Error:** `Address already in use`

**Fix (Windows):**
```bash
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

**Fix (Linux/Mac):**
```bash
lsof -i :5000
kill -9 <PID_NUMBER>
```

---

### Issue 3: Webcam Not Working

**Problem:** Black screen or "Permission denied"

**Fix:**
- Allow camera permissions in browser
- Close other apps using the camera (Zoom, Teams, etc.)
- Try a different browser (Chrome recommended)
- Check camera device ID in browser console

---

### Issue 4: Model Not Detecting People

**Problem:** No bounding boxes appearing

**Fix:**
1. Check ML server terminal for errors
2. Ensure good lighting
3. Lower confidence threshold to 0.3
4. Stand closer to camera
5. Verify health endpoint: `curl http://localhost:5000/health`

---

### Issue 5: Next.js Build Error

**Error:** `Cannot find module '@/components/...'`

**Fix:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install

# Or use npm cache clean
npm cache clean --force
npm install
```

---

## 📱 Project Structure Overview

```
CrowdVision-AI/
├── app/                    # Next.js pages
│   ├── api/
│   │   └── detect-crowd/  # API that calls ML server
│   └── dashboard/         # Dashboard pages
│
├── components/            # React UI components
│
├── ml-server/            # Python ML inference server ⭐
│   ├── app.py           # Flask server
│   ├── models/          # YOLOv8 model
│   └── requirements.txt # Python deps
│
├── lib/                  # Firebase config
└── public/              # Static files
```

---

## 🔄 Typical Workflow

### Morning Routine (Starting the System)

```bash
# Terminal 1: Start ML Server
cd ml-server && python app.py

# Terminal 2: Start Frontend
cd .. && npm run dev
```

### Evening Routine (Stopping the System)

Press **Ctrl+C** in both terminals to stop the servers.

---

## 🧪 Run Tests

```bash
# Test ML server
cd ml-server
python test_server.py

# Test full integration
python test_integration.py
```

---

## 📊 System Architecture (Simplified)

```
┌─────────────┐
│   Camera    │
│  (Webcam)   │
└──────┬──────┘
       │ Captures frames
       ▼
┌─────────────────────────┐
│  Next.js Frontend       │
│  (localhost:3000)       │
│  - Webcam component     │
│  - Dashboard UI         │
└────────┬────────────────┘
         │ Sends base64 image
         ▼
┌─────────────────────────┐
│  Next.js API Route      │
│  /api/detect-crowd      │
└────────┬────────────────┘
         │ Forwards image
         ▼
┌─────────────────────────┐
│  Python ML Server       │
│  (localhost:5000)       │
│  - YOLOv8 detection     │
│  - Risk calculation     │
└────────┬────────────────┘
         │ Returns results
         ▼
┌─────────────────────────┐
│  Firebase Firestore     │
│  - Stores alerts        │
│  - Real-time sync       │
└─────────────────────────┘
```

---

## 🚀 Next Steps

After getting the system running:

1. **Customize Thresholds**: Adjust risk levels for your use case
2. **Add Real Cameras**: Integrate IP cameras (RTSP streams)
3. **Build Android App**: Mobile app for field officers (see docs/)
4. **Deploy to Production**: Cloud deployment (see SETUP_GUIDE.md)

---

## 📚 More Documentation

- **Full Setup Guide**: `docs/SETUP_GUIDE.md`
- **ML Server Docs**: `ml-server/README.md`
- **Project Structure**: `docs/PROJECT_STRUCTURE.md`
- **Model Integration**: `docs/MODEL_INTEGRATION.md`

---

## 💡 Pro Tips

1. **Keep both terminals visible** - Monitor logs in real-time
2. **Use Chrome DevTools** - Network tab shows API calls
3. **Check browser console** - Frontend errors appear here
4. **Test with `/health` endpoint** - Quick ML server check
5. **Save configurations** - Document your custom thresholds

---

## 🎯 Success Checklist

- [ ] ML server running on port 5000
- [ ] Frontend running on port 3000
- [ ] Health check returns `"status": "healthy"`
- [ ] Webcam feed shows in browser
- [ ] Person detection works (bounding boxes visible)
- [ ] Alerts trigger when threshold exceeded
- [ ] Dashboard shows real-time stats

**All checked?** 🎉 **You're ready to go!**

---

## 🆘 Need Help?

### Check Logs

**ML Server logs:** Look in Terminal 1  
**Frontend logs:** Look in Terminal 2  
**Browser logs:** Open DevTools (F12) → Console

### Common Log Messages

✅ **Good:**
```
✓ YOLOv8 model loaded successfully
[camera_001] Detection complete: 5 people, risk=low
```

❌ **Bad:**
```
✗ Failed to load model
[ERROR] Cannot connect to ML server
```

### Debug Commands

```bash
# Test ML server connectivity
curl http://localhost:5000/health

# Test detection with image
curl -X POST http://localhost:5000/detect \
  -H "Content-Type: application/json" \
  -d '{"image":"data:image/jpeg;base64,...","cameraId":"test"}'

# Check Python packages
pip list | grep -E "ultralytics|opencv|flask"

# Check Node modules
npm list next react firebase
```

---

## 🌟 You're All Set!

Your CrowdVision AI system is now operational. Start monitoring crowds in real-time!

**Happy Detecting! 🎥👥📊**

---

**Quick Links:**
- Dashboard: http://localhost:3000
- ML API: http://localhost:5000
- Health Check: http://localhost:5000/health
- GitHub: [Your Repo URL]

---

*Last Updated: January 2024 | Version 1.0.0*