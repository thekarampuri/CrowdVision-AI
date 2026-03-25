# AI Based Crowd Watcher for Public Safety - ML Inference Server

Flask-based machine learning inference server for real-time crowd detection using YOLOv8.

## 📋 Overview

This server provides REST API endpoints for crowd detection and person counting using the YOLOv8 model. It processes images from camera feeds, detects people, calculates crowd density, and returns risk assessments.

![Crowd Detection Example](../assets/dashboard_live.png)

## 🏗️ Architecture

```
ml-server/
├── app.py                      # Main Flask application
├── requirements.txt            # Python dependencies
├── models/
│   ├── yolov8n.pt             # YOLOv8 nano model weights
│   └── model_config.json      # Model configuration
├── utils/
│   └── image_utils.py         # Image processing utilities
└── README.md                   # This file
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd ml-server
pip install -r requirements.txt
```

### 2. Verify Model File

Ensure `yolov8m.pt` is in the `models/` directory:

```bash
ls models/yolov8n.pt
```

### 3. Start the Server

```bash
python app.py
```

The server will start on `http://localhost:5000`

### 4. Verify Server is Running

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "model_path": "path/to/yolov8n.pt",
  "timestamp": "2024-01-15T10:30:00"
}
```

## 📡 API Endpoints

### 1. Health Check

**Endpoint:** `GET /health`

**Description:** Check if the server and model are loaded

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "model_path": "/path/to/model.pt",
  "timestamp": "2024-01-15T10:30:00.123456"
}
```

---

### 2. Crowd Detection

**Endpoint:** `POST /detect`

**Description:** Detect people in an image and return crowd analysis

**Request Body:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "cameraId": "camera_001"
}
```

**Response:**
```json
{
  "count": 15,
  "riskLevel": "medium",
  "detections": [
    {
      "bbox": [100, 50, 200, 150],
      "confidence": 0.85,
      "class": "person",
      "center": [150, 100]
    }
  ],
  "gatherings": 2,
  "hasGathering": true,
  "timestamp": "2024-01-15T10:30:00",
  "cameraId": "camera_001",
  "imageSize": {
    "width": 1280,
    "height": 720
  }
}
```

**Risk Levels:**
- `low`: 0-10 people (Safe)
- `medium`: 11-25 people (Warning)
- `high`: 26+ people (Critical)

---

### 3. Get Configuration

**Endpoint:** `GET /config`

**Description:** Get current server configuration

**Response:**
```json
{
  "confidence_threshold": 0.5,
  "iou_threshold": 0.4,
  "risk_thresholds": {
    "low": [0, 10],
    "medium": [11, 25],
    "high": [26, 999]
  },
  "model_path": "/path/to/yolov8n.pt",
  "person_class_id": 0
}
```

---

### 4. Update Configuration

**Endpoint:** `POST /config`

**Description:** Update server configuration dynamically

**Request Body:**
```json
{
  "confidence_threshold": 0.6,
  "iou_threshold": 0.45,
  "risk_thresholds": {
    "low": [0, 15],
    "medium": [16, 30],
    "high": [31, 999]
  }
}
```

**Response:**
```json
{
  "success": true,
  "config": {
    "confidence_threshold": 0.6,
    "iou_threshold": 0.45,
    "risk_thresholds": {
      "low": [0, 15],
      "medium": [16, 30],
      "high": [31, 999]
    }
  }
}
```

## 🧪 Testing

### Test with cURL

```bash
# Health check
curl http://localhost:5000/health

# Get configuration
curl http://localhost:5000/config

# Test detection (requires base64 image)
curl -X POST http://localhost:5000/detect \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/jpeg;base64,YOUR_BASE64_IMAGE",
    "cameraId": "test_camera"
  }'
```

### Test with Python

```python
import requests
import base64

# Read and encode image
with open("test_image.jpg", "rb") as f:
    img_base64 = base64.b64encode(f.read()).decode()

# Send request
response = requests.post(
    "http://localhost:5000/detect",
    json={
        "image": f"data:image/jpeg;base64,{img_base64}",
        "cameraId": "test_camera"
    }
)

result = response.json()
print(f"Detected {result['count']} people")
print(f"Risk Level: {result['riskLevel']}")
```

## 🔧 Configuration

### Model Parameters

Edit these values in `app.py`:

```python
CONFIDENCE_THRESHOLD = 0.5  # Minimum confidence for detections (0.0-1.0)
IOU_THRESHOLD = 0.4         # IoU threshold for NMS
PERSON_CLASS_ID = 0         # COCO class ID for person
```

### Risk Thresholds

Customize crowd density thresholds:

```python
RISK_THRESHOLDS = {
    "low": (0, 10),      # 0-10 people
    "medium": (11, 25),  # 11-25 people
    "high": (26, 999),   # 26+ people
}
```

### Gathering Detection

Configure gathering detection sensitivity in `app.py`:

```python
def detect_gatherings(boxes, threshold=100):
    # threshold: Maximum distance (pixels) between people to be considered a gathering
    # Increase for looser grouping, decrease for tighter grouping
```

## 🔗 Integration with Next.js

The Next.js API already calls this server. Verify the endpoint in:

`AI Based Crowd Watcher for Public Safety/app/api/detect-crowd/route.ts`

```typescript
const mlResponse = await fetch("http://127.0.0.1:5000/detect", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ image, cameraId })
})
```

## 📊 Model Information

**Model:** YOLOv8m (Medium)
- **Architecture:** YOLOv8
- **Size:** ~50 MB
- **Parameters:** 25.9M
- **Speed:** ~200ms on CPU
- **mAP50:** 50.2% (Significantly higher than Nano)
- **Input Size:** 640x640
- **Classes:** 80 COCO classes (filtered to 'person' only)

## 🐛 Troubleshooting

### Model Not Loading

**Error:** `Failed to load model`

**Solution:**
1. Verify model file exists: `ls models/yolov8n.pt`
2. Check file permissions
3. Reinstall ultralytics: `pip install ultralytics --upgrade`

### Port Already in Use

**Error:** `Address already in use`

**Solution:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Linux/Mac

# Kill the process
taskkill /PID <PID> /F        # Windows
kill -9 <PID>                 # Linux/Mac
```

### Low Detection Accuracy

**Solutions:**
1. Lower confidence threshold: `CONFIDENCE_THRESHOLD = 0.3`
2. Use larger model: `yolov8s.pt` or `yolov8m.pt`
3. Ensure good lighting in camera feeds
4. Check image quality (resolution, compression)

### High Memory Usage

**Solutions:**
1. Use smaller model: `yolov8n.pt` (default)
2. Reduce batch size
3. Process images at lower resolution
4. Clear cache periodically

## 🚀 Performance Optimization

### GPU Acceleration

Install CUDA-enabled PyTorch:

```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

The model will automatically use GPU if available.

### Reduce Latency

1. **Lower resolution:** Resize images to 416x416 instead of 640x640
2. **Adjust confidence:** Higher threshold = faster inference
3. **Disable gathering detection:** Comment out gathering detection in `/detect` endpoint
4. **Use threading:** Flask runs with `threaded=True` by default

### Production Deployment

For production, use Gunicorn:

```bash
pip install gunicorn

gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 📝 Logs

Server logs include:
- Request timestamps
- Camera IDs
- Detection counts
- Risk levels
- Processing time
- Errors and warnings

Example log output:
```
INFO - [camera_001] Processing detection request...
INFO - [camera_001] Image decoded: (720, 1280, 3)
INFO - [camera_001] Detection complete: 15 people, risk=medium, gatherings=2
```

## 🔐 Security Notes

⚠️ **Important:**
- This server has **no authentication** by default
- Only run on trusted networks (localhost or internal network)
- For production, add API key authentication
- Consider rate limiting for public deployments

## 📚 Additional Resources

- [YOLOv8 Documentation](https://docs.ultralytics.com/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [OpenCV Python Tutorials](https://docs.opencv.org/4.x/d6/d00/tutorial_py_root.html)

## 🤝 Support

For issues or questions:
1. Check server logs: `python app.py`
2. Verify health endpoint: `curl http://localhost:5000/health`
3. Test with sample image
4. Check model file integrity

## 📄 License

This ML server is part of the AI Based Crowd Watcher for Public Safety project.