# 🚀 CrowdVision AI - Quick Start Guide

## ⚡ Fastest Way to Run the Project

### Option 1: One-Click Start (Recommended)

1. **Double-click** `start_project.bat`
2. Wait for both servers to start
3. Browser will open automatically to http://localhost:3000

That's it! 🎉

---

## 🔧 Manual Start (If Batch File Doesn't Work)

### Step 1: Start ML Server

Open Terminal 1:
```bash
cd ml-server
python server.py
```

You should see:
```
✓ YOLOv8 model loaded successfully
* Running on http://0.0.0.0:5000
```

### Step 2: Start Web Dashboard

Open Terminal 2:
```bash
npm run dev
```

You should see:
```
▲ Next.js 16.0.10
- Local: http://localhost:3000
```

### Step 3: Open Browser

Go to: **http://localhost:3000**

---

## 🎥 Test Webcam Detection

1. Go to **Dashboard → Cameras**
2. Click **"Enable Webcam"** button
3. Allow camera permissions
4. Stand in front of camera
5. You should see:
   - ✅ Green bounding boxes around you
   - ✅ Person count updating
   - ✅ Risk level indicator

---

## 🐛 Troubleshooting

### ML Server Won't Start

**Error:** `ModuleNotFoundError: No module named 'flask'`

**Fix:**
```bash
cd ml-server
pip install flask flask-cors ultralytics opencv-python numpy
python server.py
```

---

### Webcam Detection Not Working

**Error:** "ML Server Connection Failed"

**Fix:**
1. Check ML server is running on port 5000
2. Test: Open http://localhost:5000/health in browser
3. Should show: `{"status": "healthy"}`

---

### Port Already in Use

**Error:** `Address already in use`

**Fix:**
```bash
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

---

## 📊 System Requirements

- ✅ Python 3.8+
- ✅ Node.js 18+
- ✅ Webcam/Camera
- ✅ 8GB RAM minimum
- ✅ Internet connection (for Firebase)

---

## 🎯 Risk Level Thresholds

- **LOW (Safe)**: 0-10 people
- **MEDIUM (Warning)**: 11-30 people  
- **HIGH (Critical)**: 31+ people

---

## 📝 Project URLs

| Service | URL |
|---------|-----|
| Web Dashboard | http://localhost:3000 |
| ML Server | http://localhost:5000 |
| Health Check | http://localhost:5000/health |
| API Config | http://localhost:5000/config |

---

## 🔑 Key Features

✅ **Real-time Person Detection** - YOLOv8 ML model  
✅ **Live Webcam Feed** - Instant bounding boxes  
✅ **Risk Assessment** - Automatic crowd level calculation  
✅ **Firebase Integration** - Real-time alerts & database  
✅ **Interactive Maps** - Google Maps with heatmaps  
✅ **Analytics Dashboard** - Charts and statistics  

---

## 📁 Project Structure

```
CrowdVision-AI/
├── ml-server/
│   ├── server.py          # ML inference server
│   ├── models/
│   │   └── yolov8n.pt    # YOLO model
│   └── start_ml_server.bat
│
├── app/                   # Next.js pages
├── components/            # React components
├── lib/                   # Firebase config
│
├── start_project.bat      # 👈 START HERE
└── package.json
```

---

## 🆘 Still Having Issues?

1. **Check Python version:** `python --version` (need 3.8+)
2. **Check Node version:** `node --version` (need 18+)
3. **Reinstall dependencies:**
   ```bash
   pip install -r ml-server/requirements.txt
   npm install
   ```
4. **Check firewall:** Allow ports 3000 and 5000

---

## 🎉 Success Checklist

- [ ] ML server running on port 5000
- [ ] Web dashboard running on port 3000
- [ ] Health check returns "healthy"
- [ ] Webcam shows in browser
- [ ] Person detection works (bounding boxes visible)
- [ ] Risk level updates correctly

**All checked?** You're ready to monitor crowds! 🚀

---

## 📚 Documentation

- **Full Setup Guide:** `docs/SETUP_GUIDE.md`
- **ML Server Docs:** `ml-server/README.md`
- **Project Structure:** `docs/PROJECT_STRUCTURE.md`
- **API Documentation:** `docs/MODEL_INTEGRATION.md`

---

**Version:** 1.0.0  
**Last Updated:** January 2024  

**Need Help?** Check the `docs/` folder for detailed guides.