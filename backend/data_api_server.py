"""
Data API Server - REST API for Crowd Analytics and Statistics
==============================================================

This server provides REST API endpoints for crowd analytics, statistics,
heatmap data, and alert management.

Port: 666
Protocol: HTTP/REST

Features:
- Real-time crowd statistics
- Heatmap data generation
- Alert management
- Historical data
- Camera configuration
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
import random
import json
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# In-memory data storage (replace with database in production)
crowd_stats = {
    'total_people': 0,
    'active_cameras': 0,
    'risk_level': 'Safe',
    'active_alerts': 0,
    'last_updated': datetime.now().isoformat()
}

alerts = []
camera_configs = []
historical_data = []

def generate_heatmap_data():
    """Generate heatmap data based on current crowd statistics"""
    # This is a simplified version - in production, this would come from actual detection data
    heatmap_points = []
    
    # Generate sample heatmap points (replace with real data from detection)
    for i in range(10):
        heatmap_points.append({
            'lat': 28.6139 + (random.random() - 0.5) * 0.01,  # Sample coordinates
            'lng': 77.2090 + (random.random() - 0.5) * 0.01,
            'intensity': random.randint(1, 10),
            'radius': random.randint(50, 200),
            'camera_id': f'camera_{i % 3}'
        })
    
    return heatmap_points

def calculate_risk_level(total_people):
    """Calculate risk level based on total people count"""
    if total_people == 0:
        return 'Safe', (0, 255, 0)
    elif total_people < 10:
        return 'Low', (0, 255, 128)
    elif total_people < 20:
        return 'Medium', (0, 255, 255)
    elif total_people < 30:
        return 'High', (0, 165, 255)
    else:
        return 'Critical', (0, 0, 255)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'data-api-server',
        'port': 666,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/detect', methods=['POST'])
def detect_crowd():
    """
    Crowd detection endpoint
    Receives image data and returns detection results
    
    Note: This is a mock implementation. For real detection,
    integrate with the camera feed server or YOLOv8 model.
    """
    try:
        data = request.json
        image = data.get('image')
        camera_id = data.get('camera_id', 'unknown')
        
        if not image:
            return jsonify({
                'error': 'No image provided'
            }), 400
        
        print(f"[DETECT] Processing image from camera: {camera_id}")
        
        # Mock detection results
        # In production, this would call YOLOv8 model or forward to camera feed server
        count = random.randint(0, 15)
        
        # Determine risk level
        if count == 0:
            risk_level = 'low'
        elif count < 5:
            risk_level = 'low'
        elif count < 10:
            risk_level = 'medium'
        else:
            risk_level = 'high'
        
        # Generate mock bounding boxes
        bounding_boxes = []
        for i in range(count):
            bounding_boxes.append({
                'x': random.random() * 0.7 + 0.1,
                'y': random.random() * 0.6 + 0.1,
                'width': 0.08 + random.random() * 0.05,
                'height': 0.12 + random.random() * 0.08,
                'confidence': 0.6 + random.random() * 0.4
            })
        
        result = {
            'count': count,
            'riskLevel': risk_level,
            'boundingBoxes': bounding_boxes,
            'timestamp': datetime.now().isoformat(),
            'camera_id': camera_id
        }
        
        print(f"[DETECT] Result: {count} people, risk: {risk_level}")
        
        # Update crowd stats
        crowd_stats['total_people'] = count
        crowd_stats['risk_level'], _ = calculate_risk_level(count)
        crowd_stats['last_updated'] = datetime.now().isoformat()
        
        return jsonify(result)
    
    except Exception as e:
        print(f"[DETECT] Error: {str(e)}")
        return jsonify({
            'error': str(e)
        }), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get current crowd statistics"""
    return jsonify({
        'success': True,
        'data': crowd_stats,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/stats', methods=['POST'])
def update_stats():
    """Update crowd statistics (called by camera feed server)"""
    try:
        data = request.json
        
        crowd_stats['total_people'] = data.get('total_people', 0)
        crowd_stats['active_cameras'] = data.get('active_cameras', 0)
        crowd_stats['risk_level'], _ = calculate_risk_level(crowd_stats['total_people'])
        crowd_stats['last_updated'] = datetime.now().isoformat()
        
        # Store in historical data
        historical_data.append({
            'timestamp': datetime.now().isoformat(),
            'total_people': crowd_stats['total_people'],
            'risk_level': crowd_stats['risk_level']
        })
        
        # Keep only last 1000 entries
        if len(historical_data) > 1000:
            historical_data.pop(0)
        
        return jsonify({
            'success': True,
            'message': 'Statistics updated successfully'
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/heatmap', methods=['GET'])
def get_heatmap():
    """Get heatmap data for crowd density visualization"""
    try:
        heatmap_data = generate_heatmap_data()
        
        return jsonify({
            'success': True,
            'data': {
                'points': heatmap_data,
                'total_points': len(heatmap_data),
                'timestamp': datetime.now().isoformat()
            }
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    """Get active alerts"""
    # Filter for active alerts only
    active_alerts = [alert for alert in alerts if alert.get('status') == 'active']
    
    return jsonify({
        'success': True,
        'data': {
            'alerts': active_alerts,
            'total': len(active_alerts),
            'timestamp': datetime.now().isoformat()
        }
    })

@app.route('/api/alerts', methods=['POST'])
def create_alert():
    """Create a new alert"""
    try:
        data = request.json
        
        alert = {
            'id': f'alert_{len(alerts) + 1}',
            'severity': data.get('severity', 'medium'),
            'message': data.get('message', 'Crowd density alert'),
            'camera_id': data.get('camera_id', 'unknown'),
            'location': data.get('location', 'Unknown location'),
            'people_count': data.get('people_count', 0),
            'status': 'active',
            'created_at': datetime.now().isoformat(),
            'acknowledged': False
        }
        
        alerts.append(alert)
        crowd_stats['active_alerts'] = len([a for a in alerts if a['status'] == 'active'])
        
        return jsonify({
            'success': True,
            'data': alert
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/alerts/<alert_id>/acknowledge', methods=['POST'])
def acknowledge_alert(alert_id):
    """Acknowledge an alert"""
    for alert in alerts:
        if alert['id'] == alert_id:
            alert['acknowledged'] = True
            alert['acknowledged_at'] = datetime.now().isoformat()
            
            return jsonify({
                'success': True,
                'message': 'Alert acknowledged'
            })
    
    return jsonify({
        'success': False,
        'error': 'Alert not found'
    }), 404

@app.route('/api/alerts/<alert_id>/resolve', methods=['POST'])
def resolve_alert(alert_id):
    """Resolve an alert"""
    for alert in alerts:
        if alert['id'] == alert_id:
            alert['status'] = 'resolved'
            alert['resolved_at'] = datetime.now().isoformat()
            crowd_stats['active_alerts'] = len([a for a in alerts if a['status'] == 'active'])
            
            return jsonify({
                'success': True,
                'message': 'Alert resolved'
            })
    
    return jsonify({
        'success': False,
        'error': 'Alert not found'
    }), 404

@app.route('/api/history', methods=['GET'])
def get_history():
    """Get historical crowd data"""
    # Get time range from query parameters
    hours = request.args.get('hours', default=24, type=int)
    
    # Filter historical data by time range
    cutoff_time = datetime.now() - timedelta(hours=hours)
    
    filtered_data = [
        entry for entry in historical_data
        if datetime.fromisoformat(entry['timestamp']) > cutoff_time
    ]
    
    return jsonify({
        'success': True,
        'data': {
            'entries': filtered_data,
            'total': len(filtered_data),
            'time_range_hours': hours,
            'timestamp': datetime.now().isoformat()
        }
    })

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    """Get analytics data for charts and graphs"""
    # Calculate analytics from historical data
    if not historical_data:
        return jsonify({
            'success': True,
            'data': {
                'avg_people': 0,
                'max_people': 0,
                'min_people': 0,
                'trend': 'stable',
                'hourly_data': []
            }
        })
    
    people_counts = [entry['total_people'] for entry in historical_data]
    
    analytics = {
        'avg_people': sum(people_counts) / len(people_counts) if people_counts else 0,
        'max_people': max(people_counts) if people_counts else 0,
        'min_people': min(people_counts) if people_counts else 0,
        'trend': 'increasing' if len(people_counts) > 1 and people_counts[-1] > people_counts[0] else 'decreasing',
        'hourly_data': historical_data[-24:] if len(historical_data) >= 24 else historical_data
    }
    
    return jsonify({
        'success': True,
        'data': analytics,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/cameras', methods=['GET'])
def get_cameras():
    """Get all camera configurations"""
    return jsonify({
        'success': True,
        'data': {
            'cameras': camera_configs,
            'total': len(camera_configs)
        }
    })

@app.route('/api/cameras', methods=['POST'])
def add_camera():
    """Add a new camera configuration"""
    try:
        data = request.json
        
        camera = {
            'id': f'camera_{len(camera_configs) + 1}',
            'name': data.get('name', f'Camera {len(camera_configs) + 1}'),
            'location': data.get('location', 'Unknown'),
            'latitude': data.get('latitude', 0),
            'longitude': data.get('longitude', 0),
            'coverage_radius': data.get('coverage_radius', 100),
            'threshold': data.get('threshold', 20),
            'status': 'active',
            'created_at': datetime.now().isoformat()
        }
        
        camera_configs.append(camera)
        
        return jsonify({
            'success': True,
            'data': camera
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/cameras/<camera_id>', methods=['PUT'])
def update_camera(camera_id):
    """Update camera configuration"""
    try:
        data = request.json
        
        for camera in camera_configs:
            if camera['id'] == camera_id:
                camera.update(data)
                camera['updated_at'] = datetime.now().isoformat()
                
                return jsonify({
                    'success': True,
                    'data': camera
                })
        
        return jsonify({
            'success': False,
            'error': 'Camera not found'
        }), 404
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/cameras/<camera_id>', methods=['DELETE'])
def delete_camera(camera_id):
    """Delete camera configuration"""
    global camera_configs
    
    camera_configs = [c for c in camera_configs if c['id'] != camera_id]
    
    return jsonify({
        'success': True,
        'message': 'Camera deleted successfully'
    })

if __name__ == '__main__':
    print("=" * 60)
    print("📊 Data API Server Starting...")
    print("=" * 60)
    print(f"📡 Port: 666")
    print(f"🌐 Base URL: http://localhost:666")
    print(f"💚 Health check: http://localhost:666/health")
    print(f"📈 Stats endpoint: http://localhost:666/api/stats")
    print(f"🗺️  Heatmap endpoint: http://localhost:666/api/heatmap")
    print(f"🚨 Alerts endpoint: http://localhost:666/api/alerts")
    print("=" * 60)
    
    # Run server
    app.run(host='0.0.0.0', port=666, debug=True)
