# ML Model Integration Guide

## Required Files for Pre-trained Model

To integrate your crowd detection model with the CrowdVision AI system, you'll need to provide the following files:

### 1. Model Files

Depending on your framework, provide ONE of these:

#### For TensorFlow.js:
- `model.json` - Model architecture
- `group1-shard1of1.bin` (or multiple shards) - Model weights

#### For ONNX:
- `crowd_detection_model.onnx` - Complete ONNX model file

#### For PyTorch (via REST API):
- `model.pt` or `model.pth` - PyTorch model weights
- `model_config.json` - Model configuration

### 2. Model Configuration File

Create a `model_config.json` file with the following structure:

```json
{
  "name": "Crowd Detection Model",
  "version": "1.0.0",
  "framework": "tensorflow|pytorch|onnx",
  "inputShape": [640, 640, 3],
  "outputFormat": "bounding_boxes",
  "classes": ["person"],
  "confidenceThreshold": 0.5,
  "iouThreshold": 0.4,
  "maxDetections": 50,
  "preprocessing": {
    "normalization": "0-1",
    "resizeMode": "letterbox"
  }
}
```

### 3. Label Map (if applicable)

If your model detects multiple classes, provide a `labels.txt` file:

```
person
crowd
vehicle
```

### 4. Model Metadata

Create a `README.md` in your model directory with:

- Model architecture (YOLOv8, Faster R-CNN, SSD, etc.)
- Training dataset information
- Performance metrics (mAP, inference time)
- Hardware requirements (GPU, CPU, RAM)
- Expected input format
- Output format description

## Integration Steps

### Step 1: Place Model Files

Put your model files in the `public/models/` directory:

```
public/
  models/
    crowd-detection/
      model.json
      group1-shard1of1.bin
      model_config.json
      labels.txt
      README.md
```

### Step 2: Update Detection API

Modify `app/api/detect-crowd/route.ts` to load your model:

```typescript
import * as tf from '@tensorflow/tfjs'

let model: tf.GraphModel | null = null

async function loadModel() {
  if (!model) {
    model = await tf.loadGraphModel('/models/crowd-detection/model.json')
  }
  return model
}

export async function POST(request: NextRequest) {
  const { image } = await request.json()
  
  // Load model
  const model = await loadModel()
  
  // Preprocess image
  const tensor = await preprocessImage(image)
  
  // Run inference
  const predictions = await model.predict(tensor)
  
  // Postprocess results
  const detections = postprocessPredictions(predictions)
  
  return NextResponse.json(detections)
}
```

### Step 3: Install Dependencies

Add required packages to your project:

```bash
npm install @tensorflow/tfjs @tensorflow/tfjs-node
# OR for ONNX
npm install onnxruntime-web
```

## Model Hosting Options

### Option 1: Client-Side (Browser)
- Place model in `public/models/`
- Load with TensorFlow.js or ONNX Runtime Web
- Pros: No server costs, fast inference
- Cons: Model visible to users, limited by browser performance

### Option 2: Server-Side (API Route)
- Deploy model to Next.js API route
- Use `@tensorflow/tfjs-node` or Python microservice
- Pros: Model protected, consistent performance
- Cons: Higher server costs

### Option 3: External API
- Deploy to specialized ML serving platform (TensorFlow Serving, TorchServe, etc.)
- Call from Next.js API route
- Pros: Scalable, GPU support
- Cons: Additional infrastructure

## Testing Your Model

After integration, test with:

1. Static images: `app/dashboard/cameras/test`
2. Webcam feed: `app/dashboard/cameras`
3. Performance monitoring: Check browser console for inference times

## Alert Configuration

Configure crowd density thresholds in `app/api/detect-crowd/route.ts`:

```typescript
const ALERT_THRESHOLDS = {
  low: 5,      // 1-5 people
  medium: 10,  // 6-10 people
  high: 11,    // 11+ people
}
```

## Need Help?

If you encounter issues:
1. Check model file paths
2. Verify input/output tensor shapes
3. Test model inference separately
4. Check browser console for errors
5. Review model performance metrics
