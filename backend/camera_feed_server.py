"""
Camera Feed Server - WebSocket Server for Live Camera Streaming
================================================================

This server provides real-time camera feed streaming with crowd detection overlays.
It uses Flask-SocketIO for WebSocket communication with the frontend.

Port: 999
Protocol: WebSocket + HTTP

Features:
- Live camera feed streaming
- Real-time crowd detection
- Multiple camera support
- Performance monitoring
- Health check endpoint
"""

from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import cv2
import base64
import threading
import time
import os
import sys
from datetime import datetime

# Import the live camera detection system
sys.path.append(os.path.dirname(__file__))
from live_camera_detection import LiveCameraDetection

app = Flask(__name__)
app.config['SECRET_KEY'] = 'crowdvision-ai-secret-key'
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Global variables
camera_detector = None
streaming = False
camera_thread = None
current_camera_id = 0

def encode_frame(frame):
    """Encode frame to base64 for WebSocket transmission"""
    try:
        # Encode frame as JPEG
        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
        # Convert to base64
        frame_base64 = base64.b64encode(buffer).decode('utf-8')
        return frame_base64
    except Exception as e:
        print(f"Error encoding frame: {e}")
        return None

def camera_stream_thread():
    """Background thread for camera streaming"""
    global camera_detector, streaming
    
    print("🎥 Camera stream thread started")
    
    try:
        # Initialize camera
        cap = cv2.VideoCapture(current_camera_id)
        
        if not cap.isOpened():
            print(f"❌ Failed to open camera {current_camera_id}")
            socketio.emit('camera_error', {'error': f'Failed to open camera {current_camera_id}'})
            return
        
        # Set camera properties
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
        cap.set(cv2.CAP_PROP_FPS, 30)
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        
        print("✅ Camera opened successfully")
        
        frame_count = 0
        fps_start_time = time.time()
        current_fps = 0
        
        while streaming:
            ret, frame = cap.read()
            
            if not ret:
                print("❌ Failed to read frame")
                break
            
            frame_count += 1
            
            # Detect people in frame
            detections = camera_detector.detect_people(frame)
            
            # Update tracking
            tracks = camera_detector.update_tracking(detections)
            
            # Merge nearby rectangles
            groups = camera_detector.merge_nearby_rectangles(tracks)
            
            # Calculate metrics
            metrics = camera_detector.calculate_crowd_metrics(groups, frame.shape)
            
            # Draw visualizations
            frame = camera_detector.draw_merged_groups(frame, groups)
            
            # Calculate FPS
            if time.time() - fps_start_time >= 1.0:
                current_fps = frame_count / (time.time() - fps_start_time)
                frame_count = 0
                fps_start_time = time.time()
            
            # Add FPS overlay
            cv2.putText(frame, f"FPS: {current_fps:.1f}", (10, 30),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
            # Encode frame
            frame_base64 = encode_frame(frame)
            
            if frame_base64:
                # Emit frame and metrics to all connected clients
                socketio.emit('camera_frame', {
                    'frame': frame_base64,
                    'metrics': {
                        'total_people': metrics['total_people'],
                        'num_groups': metrics['num_groups'],
                        'density_level': metrics['density_level'],
                        'fps': current_fps,
                        'timestamp': datetime.now().isoformat()
                    }
                })
            
            # Small delay to control frame rate
            time.sleep(0.03)  # ~30 FPS
        
        cap.release()
        print("🛑 Camera stream stopped")
        
    except Exception as e:
        print(f"❌ Camera stream error: {e}")
        import traceback
        traceback.print_exc()
        socketio.emit('camera_error', {'error': str(e)})

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'camera-feed-server',
        'port': 999,
        'streaming': streaming,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/camera/status', methods=['GET'])
def camera_status():
    """Get camera status"""
    return jsonify({
        'streaming': streaming,
        'camera_id': current_camera_id,
        'model_loaded': camera_detector is not None and camera_detector.model is not None
    })

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print(f"✅ Client connected: {request.sid}")
    emit('connection_response', {'status': 'connected', 'message': 'Connected to camera feed server'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    print(f"👋 Client disconnected: {request.sid}")

@socketio.on('start_camera')
def handle_start_camera(data):
    """Start camera streaming"""
    global streaming, camera_thread, camera_detector, current_camera_id
    
    print("🎬 Start camera request received")
    
    if streaming:
        emit('camera_response', {'status': 'already_streaming', 'message': 'Camera is already streaming'})
        return
    
    try:
        # Get camera ID from request
        current_camera_id = data.get('camera_id', 0)
        
        # Initialize detector if not already initialized
        if camera_detector is None:
            print("🔄 Initializing camera detector...")
            camera_detector = LiveCameraDetection(camera_id=current_camera_id)
            
            if not camera_detector.load_model():
                emit('camera_error', {'error': 'Failed to load detection model'})
                return
        
        # Start streaming
        streaming = True
        camera_thread = threading.Thread(target=camera_stream_thread)
        camera_thread.daemon = True
        camera_thread.start()
        
        emit('camera_response', {'status': 'started', 'message': 'Camera streaming started'})
        print("✅ Camera streaming started")
        
    except Exception as e:
        print(f"❌ Error starting camera: {e}")
        emit('camera_error', {'error': str(e)})

@socketio.on('stop_camera')
def handle_stop_camera():
    """Stop camera streaming"""
    global streaming
    
    print("🛑 Stop camera request received")
    
    if not streaming:
        emit('camera_response', {'status': 'not_streaming', 'message': 'Camera is not streaming'})
        return
    
    streaming = False
    emit('camera_response', {'status': 'stopped', 'message': 'Camera streaming stopped'})
    print("✅ Camera streaming stopped")

if __name__ == '__main__':
    print("=" * 60)
    print("🎥 Camera Feed Server Starting...")
    print("=" * 60)
    print(f"📡 Port: 999")
    print(f"🌐 WebSocket endpoint: ws://localhost:999")
    print(f"💚 Health check: http://localhost:999/health")
    print("=" * 60)
    
    # Run server
    socketio.run(app, host='0.0.0.0', port=999, debug=True, allow_unsafe_werkzeug=True)
