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
CORS(app)  # Enable CORS for Next.js API communication

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
IOU_THRESHOLD = 0.4
PERSON_CLASS_ID = 0  # COCO dataset class ID for 'person'

# Risk level thresholds
RISK_THRESHOLDS = {
    "low": (0, 0),      # 0 people (Safe)
    "medium": (1, 9),    # 1-9 people (Warning)
    "high": (10, 999),  # 10+ people (Critical)
}


def base64_to_image(base64_string):
    """
    Convert base64 string to OpenCV image
    """
    try:
        # Remove data URL prefix if present
        if "base64," in base64_string:
            base64_string = base64_string.split("base64,")[1]

        # Decode base64 to bytes
        img_bytes = base64.b64decode(base64_string)

        # Convert bytes to numpy array
        nparr = np.frombuffer(img_bytes, np.uint8)

        # Decode to OpenCV image
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        return img
    except Exception as e:
        logger.error(f"Error converting base64 to image: {str(e)}")
        return None


def calculate_risk_level(person_count):
    """
    Calculate risk level based on person count
    """
    if person_count >= RISK_THRESHOLDS["high"][0]:
        return "high"
    elif person_count >= RISK_THRESHOLDS["medium"][0]:
        return "medium"
    else:
        return "low"


def detect_gatherings(boxes, threshold=100):
    """
    Detect if people are gathering close together
    Returns list of gathering groups
    """
    if len(boxes) < 2:
        return []

    centers = []
    for box in boxes:
        x1, y1, x2, y2 = box["bbox"]
        cx = (x1 + x2) / 2
        cy = (y1 + y2) / 2
        centers.append((cx, cy))

    gatherings = []
    visited = set()

    for i, c1 in enumerate(centers):
        if i in visited:
            continue

        group = [i]
        for j, c2 in enumerate(centers):
            if i != j and j not in visited:
                dist = np.sqrt((c1[0] - c2[0]) ** 2 + (c1[1] - c2[1]) ** 2)
                if dist < threshold:
                    group.append(j)
                    visited.add(j)

        if len(group) >= 3:  # Consider it a gathering if 3+ people are close
            gatherings.append(group)
            visited.update(group)

    return gatherings


@app.route("/health", methods=["GET"])
def health_check():
    """
    Health check endpoint
    """
    status = {
        "status": "healthy" if model is not None else "unhealthy",
        "model_loaded": model is not None,
        "model_path": MODEL_PATH,
        "timestamp": datetime.now().isoformat(),
    }
    return jsonify(status), 200 if model is not None else 503


@app.route("/detect", methods=["POST"])
def detect_crowd():
    """
    Main detection endpoint
    Receives base64 image and returns crowd detection results
    """
    try:
        # Validate model is loaded
        if model is None:
            logger.error("Model not loaded")
            return jsonify({"error": "Model not loaded"}), 500

        # Parse request
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
            iou=IOU_THRESHOLD,
            classes=[PERSON_CLASS_ID],  # Only detect persons
            verbose=False,
        )

        # Extract detections
        detections = []
        person_count = 0

        if len(results) > 0 and results[0].boxes is not None:
            boxes = results[0].boxes

            for box in boxes:
                # Extract coordinates
                x1, y1, x2, y2 = map(float, box.xyxy[0].tolist())
                confidence = float(box.conf[0])

                detection = {
                    "bbox": [x1, y1, x2, y2],
                    "confidence": round(confidence, 3),
                    "class": "person",
                    "center": [(x1 + x2) / 2, (y1 + y2) / 2],
                }

                detections.append(detection)
                person_count += 1

        # Calculate risk level
        risk_level = calculate_risk_level(person_count)

        # Detect gatherings
        gatherings = detect_gatherings(detections)
        has_gathering = len(gatherings) > 0

        # Prepare response
        response = {
            "count": person_count,
            "riskLevel": risk_level,
            "detections": detections,
            "gatherings": len(gatherings),
            "hasGathering": has_gathering,
            "timestamp": datetime.now().isoformat(),
            "cameraId": camera_id,
            "imageSize": {"width": image.shape[1], "height": image.shape[0]},
        }

        logger.info(
            f"[{camera_id}] Detection complete: "
            f"{person_count} people, risk={risk_level}, "
            f"gatherings={len(gatherings)}"
        )

        return jsonify(response), 200

    except Exception as e:
        logger.error(f"Detection error: {str(e)}", exc_info=True)
        return jsonify({"error": "Detection failed", "message": str(e)}), 500


@app.route("/config", methods=["GET"])
def get_config():
    """
    Get current server configuration
    """
    config = {
        "confidence_threshold": CONFIDENCE_THRESHOLD,
        "iou_threshold": IOU_THRESHOLD,
        "risk_thresholds": RISK_THRESHOLDS,
        "model_path": MODEL_PATH,
        "person_class_id": PERSON_CLASS_ID,
    }
    return jsonify(config), 200


@app.route("/config", methods=["POST"])
def update_config():
    """
    Update server configuration dynamically
    """
    try:
        data = request.get_json()

        global CONFIDENCE_THRESHOLD, IOU_THRESHOLD, RISK_THRESHOLDS

        if "confidence_threshold" in data:
            CONFIDENCE_THRESHOLD = float(data["confidence_threshold"])

        if "iou_threshold" in data:
            IOU_THRESHOLD = float(data["iou_threshold"])

        if "risk_thresholds" in data:
            RISK_THRESHOLDS.update(data["risk_thresholds"])

        logger.info("Configuration updated successfully")
        return jsonify(
            {
                "success": True,
                "config": {
                    "confidence_threshold": CONFIDENCE_THRESHOLD,
                    "iou_threshold": IOU_THRESHOLD,
                    "risk_thresholds": RISK_THRESHOLDS,
                },
            }
        ), 200

    except Exception as e:
        logger.error(f"Config update error: {str(e)}")
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    logger.info("=" * 60)
    logger.info("CrowdVision AI - ML Inference Server")
    logger.info("=" * 60)
    logger.info(f"Model: {MODEL_PATH}")
    logger.info(f"Confidence Threshold: {CONFIDENCE_THRESHOLD}")
    logger.info(f"IOU Threshold: {IOU_THRESHOLD}")
    logger.info(f"Risk Thresholds: {RISK_THRESHOLDS}")
    logger.info("=" * 60)

    # Run Flask server
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)
