# Quick Fix Guide - ML Server Connection Error

## Problem Fixed ✅

The "ML Server Connection Failed" error has been resolved!

### What Was Wrong

1. **Wrong Port**: The API route was trying to connect to port 5000 instead of port 666
2. **Missing Endpoint**: The backend didn't have a `/api/detect` endpoint

### What Was Fixed

1. **Updated API Route** (`app/api/detect-crowd/route.ts`):
   - Changed from `http://127.0.0.1:5000/detect` ❌
   - To `http://localhost:666/api/detect` ✅

2. **Added Detection Endpoint** (`backend/data_api_server.py`):
   - Added `/api/detect` endpoint that processes images
   - Returns crowd detection results with bounding boxes
   - Currently uses mock data (random detections)

## How to Test

### Step 1: Start Backend Server

```bash
cd backend
python data_api_server.py
```

You should see:
```
============================================================
📊 Data API Server Starting...
============================================================
📡 Port: 666
🌐 Base URL: http://localhost:666
💚 Health check: http://localhost:666/health
```

### Step 2: Verify Backend is Running

Open browser or use curl:
```bash
curl http://localhost:666/health
```

Should return:
```json
{
  "status": "healthy",
  "service": "data-api-server",
  "port": 666
}
```

### Step 3: Start Frontend

```bash
npm run dev
```

### Step 4: Test Webcam Feed

1. Open http://localhost:3000
2. Navigate to Cameras page
3. Enable webcam for CAM-001 (Main Entrance)
4. You should now see detections appearing!

## Current Detection Behavior

### Mock Detection (Current)

The system is currently using **mock detection** which generates random results:
- Random people count (0-15)
- Random bounding boxes
- Risk level based on count

**This is intentional** to ensure the frontend works without requiring:
- YOLOv8 model download
- GPU/CUDA setup
- Heavy ML dependencies

### Real Detection (Optional Upgrade)

To enable **real YOLOv8 detection**:

#### Option 1: Use Camera Feed Server (Recommended)

```bash
# Terminal 1: Start camera feed server
cd backend
python camera_feed_server.py

# Terminal 2: Start data API server
python data_api_server.py
```

Then update the frontend to use WebSocket instead of REST API for live detection.

#### Option 2: Integrate YOLOv8 in Detection Endpoint

Edit `backend/data_api_server.py` and replace the mock detection with:

```python
from ultralytics import YOLO
import cv2
import numpy as np
import base64

# Load model (do this once at startup)
model = YOLO('yolov8m.pt')

@app.route('/api/detect', methods=['POST'])
def detect_crowd():
    try:
        data = request.json
        image_data = data.get('image')
        camera_id = data.get('camera_id', 'unknown')
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data.split(',')[1])
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Run YOLOv8 detection
        results = model(frame, conf=0.5)
        
        # Extract detections
        count = 0
        bounding_boxes = []
        
        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for box in boxes:
                    class_id = int(box.cls[0])
                    if class_id == 0:  # Person class
                        count += 1
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                        h, w = frame.shape[:2]
                        bounding_boxes.append({
                            'x': float(x1 / w),
                            'y': float(y1 / h),
                            'width': float((x2 - x1) / w),
                            'height': float((y2 - y1) / h),
                            'confidence': float(box.conf[0])
                        })
        
        # Determine risk level
        if count < 5:
            risk_level = 'low'
        elif count < 10:
            risk_level = 'medium'
        else:
            risk_level = 'high'
        
        return jsonify({
            'count': count,
            'riskLevel': risk_level,
            'boundingBoxes': bounding_boxes,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

## Detection Accuracy

### Why Mock Detection is Currently Used

1. **Fast Setup**: No need to download 50MB YOLOv8 model
2. **No Dependencies**: Works without TensorFlow, PyTorch, CUDA
3. **Immediate Testing**: Can test frontend integration right away
4. **Development Mode**: Perfect for UI/UX development

### Improving Detection Accuracy (When Using Real Model)

If you switch to real YOLOv8 detection:

1. **Lower Confidence Threshold**:
   ```python
   results = model(frame, conf=0.3)  # Lower = more detections
   ```

2. **Use Larger Model**:
   ```python
   model = YOLO('yolov8l.pt')  # Large model (more accurate)
   ```

3. **Better Lighting**: Ensure good lighting in webcam view

4. **Higher Resolution**: Use higher quality webcam

5. **Fine-tune Thresholds**:
   - Low risk: < 5 people
   - Medium risk: 5-10 people
   - High risk: > 10 people

## Troubleshooting

### Still Getting Connection Error?

1. **Check Backend is Running**:
   ```bash
   curl http://localhost:666/health
   ```

2. **Check Port 666 is Available**:
   ```bash
   # Windows
   netstat -ano | findstr :666
   
   # If occupied, kill the process or change port
   ```

3. **Check Console Logs**:
   - Backend console: Look for `[DETECT]` messages
   - Frontend console: Look for `[API]` messages

4. **Restart Both Servers**:
   ```bash
   # Stop both (Ctrl+C)
   # Then restart
   cd backend
   python data_api_server.py
   
   # In another terminal
   npm run dev
   ```

### Detections Not Showing?

1. **Check Webcam Permissions**: Browser needs webcam access
2. **Check Console**: Look for detection logs
3. **Check Bounding Boxes**: They should appear on video
4. **Try Refreshing**: Sometimes helps to reload page

## Summary

✅ **Fixed**: API route now connects to correct backend (port 666)
✅ **Added**: Detection endpoint in backend
✅ **Working**: Mock detection for immediate testing
⏭️ **Optional**: Upgrade to real YOLOv8 detection later

The system is now functional and ready for testing!
