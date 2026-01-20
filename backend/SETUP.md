# CrowdVision AI - Backend Setup Guide

## 🚀 Quick Start

### Prerequisites

- **Python 3.8 or higher** - [Download Python](https://www.python.org/downloads/)
- **pip** (Python package manager) - Usually comes with Python
- **Webcam** (for live detection testing)
- **4GB+ RAM** recommended
- **GPU with CUDA** (optional, for better performance)

### Installation Steps

#### 1. Create Virtual Environment (Recommended)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate
```

#### 2. Install Dependencies

```bash
# Install all required packages
pip install -r requirements.txt
```

This will install:
- **ultralytics** - YOLOv8 detection
- **opencv-python** - Computer vision
- **tensorflow** - ML framework
- **flask** - Web server
- **flask-socketio** - WebSocket support
- **scikit-learn** - Clustering algorithms
- And other dependencies...

**Note**: First installation may take 5-10 minutes as it downloads large packages.

#### 3. Download YOLOv8 Model (Automatic)

The YOLOv8 model weights (~50MB) will be automatically downloaded on first run.
No manual download needed!

---

## 🧪 Testing the Backend

### Test 1: Basic Detection on Video

Test the detection system on a sample video:

```bash
# Run detection on a video file
python advanced_crowd_detection.py --video data/video/test.mp4 --output outputs/result.mp4
```

**Expected Output**:
- Console shows detection progress
- Output video saved to `outputs/result.mp4`
- Bounding boxes around detected people
- Group detection and counting

### Test 2: Live Camera Detection

Test with your webcam:

```bash
# Run live camera detection
python live_camera_detection.py
```

**Expected Output**:
- CV2 window opens showing camera feed
- Real-time person detection
- Bounding boxes and labels
- FPS counter
- Statistics overlay

**Controls**:
- `q` or `ESC` - Quit
- `s` - Save screenshot
- `r` - Start/stop recording
- `SPACE` - Pause/resume

### Test 3: Camera Feed Server

Start the WebSocket server for camera streaming:

```bash
# Start camera feed server (Port 999)
python camera_feed_server.py
```

**Expected Output**:
```
============================================================
🎥 Camera Feed Server Starting...
============================================================
📡 Port: 999
🌐 WebSocket endpoint: ws://localhost:999
💚 Health check: http://localhost:999/health
============================================================
```

**Test Health Check**:
```bash
# In another terminal
curl http://localhost:999/health
```

### Test 4: Data API Server

Start the REST API server:

```bash
# Start data API server (Port 666)
python data_api_server.py
```

**Expected Output**:
```
============================================================
📊 Data API Server Starting...
============================================================
📡 Port: 666
🌐 Base URL: http://localhost:666
💚 Health check: http://localhost:666/health
============================================================
```

**Test Endpoints**:
```bash
# Health check
curl http://localhost:666/health

# Get statistics
curl http://localhost:666/api/stats

# Get heatmap data
curl http://localhost:666/api/heatmap

# Get alerts
curl http://localhost:666/api/alerts
```

---

## 🏃 Running Both Servers

For full integration, run both servers simultaneously:

### Option 1: Two Terminal Windows

**Terminal 1 - Camera Feed Server**:
```bash
cd backend
python camera_feed_server.py
```

**Terminal 2 - Data API Server**:
```bash
cd backend
python data_api_server.py
```

### Option 2: Batch Script (Windows)

Create `start_backend.bat`:
```batch
@echo off
echo Starting CrowdVision AI Backend Servers...

start "Camera Feed Server" cmd /k "cd backend && python camera_feed_server.py"
timeout /t 2
start "Data API Server" cmd /k "cd backend && python data_api_server.py"

echo Backend servers started!
echo Camera Feed: http://localhost:999
echo Data API: http://localhost:666
pause
```

### Option 3: Shell Script (Linux/Mac)

Create `start_backend.sh`:
```bash
#!/bin/bash

echo "Starting CrowdVision AI Backend Servers..."

# Start camera feed server in background
cd backend
python camera_feed_server.py &
CAMERA_PID=$!

# Wait a bit
sleep 2

# Start data API server in background
python data_api_server.py &
API_PID=$!

echo "Backend servers started!"
echo "Camera Feed Server PID: $CAMERA_PID"
echo "Data API Server PID: $API_PID"
echo "Camera Feed: http://localhost:999"
echo "Data API: http://localhost:666"

# Wait for user to stop
read -p "Press Enter to stop servers..."

# Kill processes
kill $CAMERA_PID
kill $API_PID
```

---

## 📡 API Endpoints Reference

### Camera Feed Server (Port 999)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/camera/status` | GET | Camera status |
| WebSocket `/` | WS | Live camera stream |

**WebSocket Events**:
- `connect` - Client connection
- `start_camera` - Start streaming
- `stop_camera` - Stop streaming
- `camera_frame` - Frame data (emitted)
- `camera_error` - Error notification

### Data API Server (Port 666)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/stats` | GET | Current statistics |
| `/api/stats` | POST | Update statistics |
| `/api/heatmap` | GET | Heatmap data |
| `/api/alerts` | GET | Get alerts |
| `/api/alerts` | POST | Create alert |
| `/api/alerts/:id/acknowledge` | POST | Acknowledge alert |
| `/api/alerts/:id/resolve` | POST | Resolve alert |
| `/api/history` | GET | Historical data |
| `/api/analytics` | GET | Analytics data |
| `/api/cameras` | GET | Get cameras |
| `/api/cameras` | POST | Add camera |
| `/api/cameras/:id` | PUT | Update camera |
| `/api/cameras/:id` | DELETE | Delete camera |

---

## 🔧 Configuration

Edit `config.json` to customize settings:

```json
{
  "detection": {
    "model_path": "yolov8m.pt",
    "confidence_threshold": 0.5,
    "detection_skip_frames": 2
  },
  "cameras": [
    {
      "id": "camera_1",
      "camera_id": 0,
      "threshold": 20
    }
  ]
}
```

---

## 🐛 Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'ultralytics'"

**Solution**:
```bash
pip install ultralytics
```

### Issue: "Failed to open camera 0"

**Solutions**:
1. Check if webcam is connected
2. Try different camera IDs: `camera_id=1` or `camera_id=2`
3. Check if another application is using the camera
4. On Linux, check permissions: `sudo chmod 666 /dev/video0`

### Issue: "Port already in use"

**Solution**:
```bash
# Windows - Find and kill process using port
netstat -ano | findstr :999
taskkill /PID <PID> /F

# Linux/Mac - Find and kill process
lsof -i :999
kill -9 <PID>
```

### Issue: Low FPS / Slow Performance

**Solutions**:
1. **Enable GPU**: Install CUDA and PyTorch with GPU support
2. **Reduce resolution**: Edit config.json, set lower frame_width/height
3. **Increase frame skip**: Set `detection_skip_frames: 3` or higher
4. **Use smaller model**: Change to `yolov8s.pt` (faster but less accurate)

### Issue: "CUDA out of memory"

**Solution**:
```python
# In camera_feed_server.py or live_camera_detection.py
# Change model initialization to use CPU
self.use_cuda = False
```

---

## 📊 Performance Tips

1. **GPU Acceleration**: Install CUDA for 5-10x faster detection
2. **Frame Skipping**: Process every 2-3 frames for smoother performance
3. **Resolution**: Use 640x640 for YOLOv8 input (optimal)
4. **Model Selection**:
   - `yolov8n.pt` - Fastest, least accurate
   - `yolov8s.pt` - Fast, good accuracy
   - `yolov8m.pt` - **Recommended** - Balanced
   - `yolov8l.pt` - Slow, high accuracy
   - `yolov8x.pt` - Slowest, highest accuracy

---

## 🔐 Security Notes

**For Development**:
- CORS is set to `*` (allow all origins)
- No authentication required

**For Production**:
1. Configure specific CORS origins
2. Add API authentication (JWT tokens)
3. Use HTTPS/WSS instead of HTTP/WS
4. Add rate limiting
5. Implement input validation

---

## 📝 Next Steps

1. ✅ Backend installed and tested
2. ⏭️ Integrate with frontend (Next.js)
3. ⏭️ Test end-to-end flow
4. ⏭️ Deploy to production

---

## 🆘 Need Help?

- Check console logs for error messages
- Verify all dependencies are installed: `pip list`
- Test Python version: `python --version` (should be 3.8+)
- Check if ports are available: `netstat -an | findstr :999`

---

## 📚 Additional Resources

- [YOLOv8 Documentation](https://docs.ultralytics.com/)
- [OpenCV Documentation](https://docs.opencv.org/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Flask-SocketIO Documentation](https://flask-socketio.readthedocs.io/)
