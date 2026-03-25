# AI Based Crowd Watcher for Public Safety - Complete Setup Guide

This guide will walk you through setting up the complete AI Based Crowd Watcher for Public Safety system from scratch.

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Quick Start (5 Minutes)](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [Testing the System](#testing-the-system)
5. [Troubleshooting](#troubleshooting)
6. [Production Deployment](#production-deployment)

---

## 🖥️ System Requirements

### Minimum Requirements
- **OS**: Windows 10/11, Ubuntu 20.04+, macOS 10.15+
- **CPU**: Intel i5 or AMD equivalent
- **RAM**: 8GB (16GB recommended)
- **Storage**: 5GB free space
- **Internet**: Required for Firebase and API access

### Software Requirements
- **Node.js**: v18.0.0 or higher
- **Python**: v3.8 to v3.11 (v3.11 recommended)
- **npm/pnpm**: Latest version
- **pip**: Latest version
- **Git**: For version control

### Optional (For Better Performance)
- **NVIDIA GPU**: For faster ML inference
- **CUDA 11.8+**: For GPU acceleration

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
# Navigate to project directory
cd E:\Projects\AI Based Crowd Watcher for Public Safety

# Install frontend dependencies
npm install

# Install ML server dependencies
cd ml-server
pip install -r requirements.txt
cd ..
```

### Step 2: Start ML Server

**Windows:**
```bash
cd ml-server
start_server.bat
```

**Linux/Mac:**
```bash
cd ml-server
chmod +x start_server.sh
./start_server.sh
```

### Step 3: Start Next.js Frontend

Open a new terminal:
```bash
cd E:\Projects\AI Based Crowd Watcher for Public Safety
npm run dev
```

### Step 4: Access the Application

- **Web Dashboard**: http://localhost:3000
- **ML API Health**: http://localhost:5000/health

---

## 🔧 Detailed Setup

### Part 1: Frontend Setup

#### 1.1 Install Node.js Dependencies

```bash
cd E:\Projects\AI Based Crowd Watcher for Public Safety

# Using npm
npm install

# OR using pnpm (faster)
pnpm install
```

#### 1.2 Configure Firebase (Already Done)

The Firebase configuration is already set up in `lib/firebase.ts`:
- Project ID: `AI Based Crowd Watcher for Public Safety-7e13f`
- Authentication enabled
- Firestore database configured

#### 1.3 Environment Variables (Optional)

Create `.env.local` if you need custom settings:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_ML_SERVER_URL=http://localhost:5000
```

#### 1.4 Start Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

---

### Part 2: ML Server Setup

#### 2.1 Create Python Virtual Environment (Recommended)

```bash
cd ml-server

# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

#### 2.2 Install Python Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

This will install:
- `ultralytics` (YOLOv8)
- `opencv-python` (Image processing)
- `flask` (Web server)
- `flask-cors` (CORS support)
- `numpy` (Numerical operations)
- `torch` & `torchvision` (PyTorch)

#### 2.3 Verify Model File

Ensure the YOLOv8 model is in the correct location:

```bash
# Check if model exists
ls models/yolov8n.pt  # Linux/Mac
dir models\yolov8n.pt  # Windows
```

The model file should be approximately 6 MB in size.

#### 2.4 Test ML Server

```bash
# Start the server
python app.py
```

You should see:
```
============================================================
AI Based Crowd Watcher for Public Safety - ML Inference Server
============================================================
Model: E:\Projects\AI Based Crowd Watcher for Public Safety\ml-server\models\yolov8n.pt
Confidence Threshold: 0.5
IOU Threshold: 0.4
Risk Thresholds: {'low': (0, 10), 'medium': (11, 25), 'high': (26, 999)}
============================================================
✓ YOLOv8 model loaded successfully
 * Running on http://0.0.0.0:5000
```

#### 2.5 Run Test Suite

```bash
python test_server.py
```

Expected output:
```
╔==========================================================╗
║          AI Based Crowd Watcher for Public Safety - ML Server Tests                ║
╚==========================================================╝

============================================================
TEST 1: Health Check
============================================================
Status Code: 200
Response: {
  "status": "healthy",
  "model_loaded": true
}
✓ Health check PASSED
```

---

### Part 3: Firebase Configuration

#### 3.1 Verify Firebase Setup

The project is already connected to Firebase. Verify in browser console:

```javascript
// Open http://localhost:3000 and check browser console
// You should see Firebase initialization logs
```

#### 3.2 Firestore Database Structure

The following collections are automatically created:
- `/alerts` - Crowd detection alerts
- `/cameras` - Camera configurations
- `/users` - User profiles and settings

#### 3.3 Authentication Setup

Firebase Authentication is configured with:
- Email/Password sign-in enabled
- Protected dashboard routes
- Session management

---

## 🧪 Testing the System

### Test 1: Health Check

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "timestamp": "2024-01-15T10:30:00"
}
```

### Test 2: ML Detection API

Create a test script `test_detection.py`:

```python
import requests
import base64

# Read test image
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

print(response.json())
```

### Test 3: Frontend Integration

1. Open http://localhost:3000
2. Navigate to Login page
3. Create an account or log in
4. Go to Dashboard → Cameras
5. Enable webcam feed
6. Verify real-time detection boxes appear

### Test 4: Alert System

1. Go to Dashboard → Alerts
2. Create a scenario with 26+ people (high risk)
3. Verify alert appears in Firestore
4. Check alert shows in the Alerts page

---

## 🐛 Troubleshooting

### Issue 1: ML Server Won't Start

**Symptom:** `ModuleNotFoundError: No module named 'ultralytics'`

**Solution:**
```bash
cd ml-server
pip install ultralytics opencv-python flask flask-cors
```

---

### Issue 2: Model Not Loading

**Symptom:** `Failed to load model: [Errno 2] No such file or directory`

**Solution:**
```bash
# Verify model path
cd ml-server
ls models/yolov8n.pt

# If missing, download YOLOv8n
pip install ultralytics
python -c "from ultralytics import YOLO; YOLO('yolov8n.pt')"
```

---

### Issue 3: Port Already in Use

**Symptom:** `OSError: [Errno 98] Address already in use`

**Solution:**

**Windows:**
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
lsof -i :5000
kill -9 <PID>
```

---

### Issue 4: CORS Error in Browser

**Symptom:** `Access to fetch at 'http://localhost:5000/detect' has been blocked by CORS`

**Solution:**
- Verify `flask-cors` is installed: `pip install flask-cors`
- Check `app.py` has `CORS(app)` after Flask initialization
- Restart ML server

---

### Issue 5: Low Detection Accuracy

**Symptom:** Model not detecting people properly

**Solutions:**
1. Lower confidence threshold in `ml-server/app.py`:
   ```python
   CONFIDENCE_THRESHOLD = 0.3  # Lower from 0.5
   ```

2. Use a larger model:
   ```bash
   # Download YOLOv8s (small) instead of YOLOv8n (nano)
   python -c "from ultralytics import YOLO; YOLO('yolov8s.pt')"
   ```

3. Ensure good lighting in camera feeds

---

### Issue 6: Firebase Connection Error

**Symptom:** `Firebase: Error (auth/network-request-failed)`

**Solution:**
- Check internet connection
- Verify Firebase config in `lib/firebase.ts`
- Check Firebase project status at https://console.firebase.google.com

---

### Issue 7: Webcam Not Working

**Symptom:** Camera feed shows black screen

**Solution:**
- Allow browser camera permissions
- Check if another app is using the camera
- Try different browser (Chrome recommended)
- Verify camera device ID in browser console

---

## 🚀 Production Deployment

### Option 1: Deploy on Vercel (Frontend)

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Deploy
```bash
vercel --prod
```

#### Step 3: Configure Environment Variables
In Vercel dashboard:
- Add `NEXT_PUBLIC_ML_SERVER_URL` pointing to your ML server

---

### Option 2: Deploy ML Server on Cloud

#### Option A: AWS EC2

```bash
# Connect to EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Clone repository
git clone <your-repo-url>
cd AI Based Crowd Watcher for Public Safety/ml-server

# Install dependencies
sudo apt update
sudo apt install python3-pip
pip3 install -r requirements.txt

# Run with Gunicorn (production server)
pip3 install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

#### Option B: Docker Deployment

Create `ml-server/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

EXPOSE 5000

CMD ["python", "app.py"]
```

Build and run:
```bash
docker build -t crowdvision-ml .
docker run -p 5000:5000 crowdvision-ml
```

---

### Production Checklist

- [ ] Environment variables configured
- [ ] Firebase production credentials
- [ ] ML server accessible via HTTPS
- [ ] CORS configured for production domain
- [ ] API rate limiting enabled
- [ ] Error monitoring (Sentry, etc.)
- [ ] Database backups scheduled
- [ ] SSL certificates installed
- [ ] Load balancing configured (if needed)
- [ ] Logging and monitoring setup

---

## 📊 Performance Optimization

### Frontend Optimization

1. **Enable Next.js Production Mode**
   ```bash
   npm run build
   npm start
   ```

2. **Optimize Images**
   - Use Next.js Image component
   - Enable WebP format
   - Implement lazy loading

3. **Enable Caching**
   - Configure CDN (Cloudflare, CloudFront)
   - Set appropriate cache headers

---

### ML Server Optimization

1. **Use GPU Acceleration**
   ```bash
   # Install CUDA-enabled PyTorch
   pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
   ```

2. **Batch Processing**
   - Process multiple frames together
   - Reduce API calls

3. **Model Optimization**
   - Use TensorRT for NVIDIA GPUs
   - Export to ONNX format
   - Quantize model (INT8)

4. **Caching**
   - Cache model in memory
   - Use Redis for results caching

---

## 🔐 Security Best Practices

### 1. API Security

```python
# Add API key authentication to ML server
from functools import wraps

def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if api_key != os.getenv('API_KEY'):
            return jsonify({'error': 'Invalid API key'}), 401
        return f(*args, **kwargs)
    return decorated_function

@app.route('/detect', methods=['POST'])
@require_api_key
def detect_crowd():
    # ... existing code
```

### 2. Firebase Security Rules

Update `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /alerts/{alertId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

### 3. Rate Limiting

```python
from flask_limiter import Limiter

limiter = Limiter(
    app,
    key_func=lambda: request.remote_addr,
    default_limits=["100 per hour"]
)

@app.route('/detect', methods=['POST'])
@limiter.limit("30 per minute")
def detect_crowd():
    # ... existing code
```

---

## 📚 Additional Resources

- [YOLOv8 Documentation](https://docs.ultralytics.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Flask Documentation](https://flask.palletsprojects.com/)

---

## 🆘 Getting Help

1. **Check Logs**
   - Frontend: Browser console and terminal
   - ML Server: Terminal output
   - Firebase: Firebase Console

2. **Common Error Codes**
   - `400`: Bad request (check image format)
   - `500`: Server error (check ML server logs)
   - `503`: Service unavailable (ML server not running)

3. **Debug Mode**
   ```bash
   # Run ML server in debug mode
   cd ml-server
   python app.py --debug
   ```

---

## 🎉 Success!

If all tests pass, you should now have:
- ✅ Next.js frontend running on http://localhost:3000
- ✅ ML inference server running on http://localhost:5000
- ✅ Firebase authentication and database connected
- ✅ Real-time crowd detection working
- ✅ Alert system operational

**Next Steps:**
1. Customize risk thresholds for your use case
2. Add real IP cameras (RTSP streams)
3. Build the Android mobile app
4. Deploy to production

---

**Last Updated:** January 2024  
**Version:** 1.0.0