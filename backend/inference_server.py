from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import cv2
import numpy as np
import base64
import os

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# Load the trained model
MODEL_PATH = r"E:\Projects\CrowdVision-AI\runs\detect\crowd_density_yolov811\weights\best.pt"
model = YOLO(MODEL_PATH)

@app.route('/detect', methods=['POST'])
def detect():
    try:
        data = request.json
        image_data = data.get('image')
        
        if not image_data:
            return jsonify({"error": "No image provided"}), 400
            
        # Decode base64 image
        if ',' in image_data:
            image_data = image_data.split(',')[1]
            
        img_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Run inference
        results = model(img, conf=0.25) # Adjust confidence threshold as needed
        
        detections = []
        result = results[0]
        
        h, w, _ = img.shape
        
        for box in result.boxes:
            # Get coordinates in normalized format (0-1)
            b = box.xywhn[0].tolist() # [x_center, y_center, width, height]
            conf = float(box.conf[0])
            
            # Convert center xy to top-left xy for frontend
            detections.append({
                "x": b[0] - b[2]/2,
                "y": b[1] - b[3]/2,
                "width": b[2],
                "height": b[3],
                "confidence": conf
            })
            
        count = len(detections)
        riskLevel = "low"
        if count > 10: riskLevel = "high"
        elif count > 5: riskLevel = "medium"
        
        return jsonify({
            "count": count,
            "riskLevel": riskLevel,
            "boundingBoxes": detections
        })
        
    except Exception as e:
        print(f"Error during detection: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000)
