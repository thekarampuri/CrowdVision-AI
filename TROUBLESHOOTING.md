# Troubleshooting Guide - ML Server Connection Issues

## Issue: "ML Server Connection Failed"

This error occurs because the webcam-feed component is trying to call a non-existent API route `/api/detect-crowd`. 

## Root Causes

1. **Missing API Route**: The component expects `/api/detect-crowd` but it doesn't exist
2. **Backend Not Running**: The Python backend servers may not be started
3. **Wrong Integration**: The component should use the backend client we created

## Solutions

### Solution 1: Start Backend Servers (Quick Fix)

The backend servers need to be running for detection to work:

```bash
# Navigate to backend directory
cd backend

# Start both servers
start_backend.bat
```

**Verify servers are running**:
- Camera Feed Server: http://localhost:999/health
- Data API Server: http://localhost:666/health

### Solution 2: Update Webcam Component (Recommended)

The `webcam-feed.tsx` component needs to be updated to use our backend client instead of calling a non-existent API route.

**Current Issue** (Line 166):
```typescript
const response = await fetch("/api/detect-crowd", {  // ❌ This doesn't exist
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ image: imageData, cameraId: camera.id }),
})
```

**Should be**:
```typescript
// Use the backend client we created
import { getCameraFeedClient } from '@/lib/backend-client';

const client = getCameraFeedClient();
client.onFrame((data) => {
  // Use the frame data from backend
  setDetections({
    count: data.metrics.total_people,
    riskLevel: data.metrics.density_level,
    boundingBoxes: [] // Backend sends processed frames
  });
});
```

### Solution 3: Create API Proxy Route (Alternative)

If you want to keep the current component structure, create an API route that proxies to the backend:

**File**: `app/api/detect-crowd/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { image, cameraId } = await request.json();
    
    // Forward to Python backend
    const backendUrl = process.env.NEXT_PUBLIC_DATA_API_URL || 'http://localhost:666';
    const response = await fetch(`${backendUrl}/api/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image, cameraId }),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Detection API error:', error);
    return NextResponse.json(
      { error: error.message || 'Detection failed' },
      { status: 500 }
    );
  }
}
```

## Detection Accuracy Issues

### Why Detection May Be Poor

1. **Model Not Loaded**: YOLOv8 model may not be downloaded yet
2. **Wrong Confidence Threshold**: Default threshold may be too high/low
3. **Image Quality**: Webcam resolution or lighting issues
4. **Model Size**: Using wrong YOLOv8 model variant

### Improving Detection Accuracy

#### 1. Check Model Status

```bash
cd backend
python
>>> from ultralytics import YOLO
>>> model = YOLO('yolov8m.pt')
>>> # Model will download if not present
```

#### 2. Adjust Confidence Threshold

Edit `backend/config.json`:
```json
{
  "detection": {
    "confidence_threshold": 0.3,  // Lower = more detections (was 0.5)
    "iou_threshold": 0.45
  }
}
```

Or edit `backend/live_camera_detection.py` (Line 50):
```python
self.confidence_threshold = 0.3  # Lower threshold for more detections
```

#### 3. Use Better Model

**Current**: `yolov8m.pt` (medium, balanced)

**Options**:
- `yolov8n.pt` - Nano (fastest, least accurate)
- `yolov8s.pt` - Small (fast, good accuracy)
- `yolov8m.pt` - Medium (balanced) ✅ Current
- `yolov8l.pt` - Large (slow, high accuracy)
- `yolov8x.pt` - Extra large (slowest, highest accuracy)

**To change model**, edit `backend/live_camera_detection.py` (Line 44):
```python
def __init__(self, model_path='yolov8l.pt', camera_id=0):  # Use large model
```

#### 4. Improve Lighting

- Ensure good lighting in the camera view
- Avoid backlighting
- Use consistent lighting conditions

#### 5. Test with Sample Video

Test detection accuracy with a known video:

```bash
cd backend
python advanced_crowd_detection.py --video data/video/test.mp4 --output outputs/result.mp4
```

Check `outputs/result.mp4` to see detection quality.

## Quick Diagnostic Checklist

- [ ] Backend servers running (ports 999 and 666)
- [ ] YOLOv8 model downloaded (~50MB)
- [ ] Webcam permissions granted
- [ ] Good lighting conditions
- [ ] Confidence threshold appropriate (0.3-0.5)
- [ ] Using appropriate model size

## Testing Detection

### Test 1: Backend Health

```bash
curl http://localhost:999/health
curl http://localhost:666/health
```

Should return `{"status": "healthy", ...}`

### Test 2: Model Loading

```bash
cd backend
python -c "from ultralytics import YOLO; model = YOLO('yolov8m.pt'); print('Model loaded!')"
```

### Test 3: Live Detection

```bash
cd backend
python live_camera_detection.py
```

Should open CV2 window with detection overlays.

## Expected Behavior

**Good Detection**:
- Detects people with 70%+ confidence
- Bounding boxes around people
- Accurate people count
- Smooth tracking across frames

**Poor Detection**:
- Missing obvious people
- False positives (detecting non-people)
- Flickering bounding boxes
- Inaccurate count

## Performance Tuning

### For Better Accuracy (Slower)
```python
# backend/live_camera_detection.py
self.confidence_threshold = 0.3  # Lower threshold
self.detection_skip_frames = 0   # Process every frame
model = YOLO('yolov8l.pt')       # Larger model
```

### For Better Speed (Less Accurate)
```python
# backend/live_camera_detection.py
self.confidence_threshold = 0.6  # Higher threshold
self.detection_skip_frames = 3   # Skip more frames
model = YOLO('yolov8n.pt')       # Smaller model
```

## Next Steps

1. **Start backend servers** - Most critical
2. **Update webcam component** - Use backend client
3. **Test detection** - Verify accuracy
4. **Tune parameters** - Adjust thresholds
5. **Monitor performance** - Check FPS and accuracy

## Need More Help?

- Check backend console logs for errors
- Verify model is loaded: Look for "✅ YOLOv8 medium model loaded successfully!"
- Test with sample video first
- Check webcam resolution and lighting
- Try different YOLOv8 model sizes
