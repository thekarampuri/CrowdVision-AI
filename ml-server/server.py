import base64
import logging
import os
from datetime import datetime

import cv2
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS
from ultralytics import YOLO

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load YOLOv8 model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "yolov8n.pt")
logger.info(f"Loading YOLOv8 model from: {MODEL_PATH}")

try:
    model = YOLO(MODEL_PATH)
    logger.info("✓ YOLOv8 model loaded successfully")
except Exception as e:
    logger.error(f"✗ Failed to load model: {str(e)}")
    model = None

# Configuration
CONFIDENCE_THRESHOLD = 0.5
PERSON_CLASS_ID = 0

# Risk thresholds
RISK_THRESHOLDS = {
    "low": (0, 0),
    "medium": (1, 9),
    "high": (10, 999),
}


def base64_to_image(base64_string):
    """Convert base64 string to OpenCV image"""
    try:
        if "base64," in base64_string:
            base64_string = base64_string.split("base64,")[1]

        img_bytes = base64.b64decode(base64_string)
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except Exception as e:
        logger.error(f"Error converting base64 to image: {str(e)}")
        return None


def calculate_risk_level(person_count):
    """Calculate risk level based on person count"""
    if person_count >= RISK_THRESHOLDS["high"][0]:
        return "high"
    elif person_count >= RISK_THRESHOLDS["medium"][0]:
        return "medium"
    else:
        return "low"


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    status = {
        "status": "healthy" if model is not None else "unhealthy",
        "model_loaded": model is not None,
        "model_path": MODEL_PATH,
        "timestamp": datetime.now().isoformat(),
    }
    return jsonify(status), 200 if model is not None else 503


@app.route("/detect", methods=["POST"])
def detect_crowd():
    """Main detection endpoint"""
    try:
        if model is None:
            logger.error("Model not loaded")
            return jsonify({"error": "Model not loaded"}), 500

        data = request.get_json()

        if not data or "image" not in data:
            logger.error("No image provided in request")
            return jsonify({"error": "No image provided"}), 400

        image_base64 = data["image"]
        camera_id = data.get("cameraId", "unknown")

        logger.info(f"[{camera_id}] Processing detection request...")

        # Convert base64 to image
        image = base64_to_image(image_base64)

        if image is None:
            logger.error("Failed to decode image")
            return jsonify({"error": "Invalid image data"}), 400

        logger.info(f"[{camera_id}] Image decoded: {image.shape}")

        # Run YOLOv8 inference
        results = model(
            image,
            conf=CONFIDENCE_THRESHOLD,
            classes=[PERSON_CLASS_ID],
            verbose=False,
        )

        # Extract detections
        detections = []
        person_count = 0

        if len(results) > 0 and results[0].boxes is not None:
            boxes = results[0].boxes

            for box in boxes:
                x1, y1, x2, y2 = map(float, box.xyxy[0].tolist())
                confidence = float(box.conf[0])

                detection = {
                    "bbox": [x1, y1, x2, y2],
                    "confidence": round(confidence, 3),
                    "class": "person",
                }

                detections.append(detection)
                person_count += 1

        # Calculate risk level
        risk_level = calculate_risk_level(person_count)

        # Prepare response
        response = {
            "count": person_count,
            "riskLevel": risk_level,
            "detections": detections,
            "timestamp": datetime.now().isoformat(),
            "cameraId": camera_id,
        }

        logger.info(
            f"[{camera_id}] Detection complete: {person_count} people, risk={risk_level}"
        )

        return jsonify(response), 200

    except Exception as e:
        logger.error(f"Detection error: {str(e)}", exc_info=True)
        return jsonify({"error": "Detection failed", "message": str(e)}), 500


@app.route("/config", methods=["GET"])
def get_config():
    """Get current server configuration"""
    config = {
        "confidence_threshold": CONFIDENCE_THRESHOLD,
        "risk_thresholds": RISK_THRESHOLDS,
        "model_path": MODEL_PATH,
    }
    return jsonify(config), 200


if __name__ == "__main__":
    logger.info("=" * 60)
    logger.info("CrowdVision AI - ML Inference Server")
    logger.info("=" * 60)
    logger.info(f"Model: {MODEL_PATH}")
    logger.info(f"Confidence Threshold: {CONFIDENCE_THRESHOLD}")
    logger.info(f"Risk Thresholds: {RISK_THRESHOLDS}")
    logger.info("=" * 60)

    # Run Flask server
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)
