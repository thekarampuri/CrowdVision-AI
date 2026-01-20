import base64
import io
import logging

import cv2
import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)


def base64_to_cv2(base64_string):
    """
    Convert base64 encoded string to OpenCV image

    Args:
        base64_string (str): Base64 encoded image string

    Returns:
        numpy.ndarray: OpenCV image (BGR format)
    """
    try:
        # Remove data URL prefix if present
        if "," in base64_string:
            base64_string = base64_string.split(",")[1]

        # Decode base64 to bytes
        img_bytes = base64.b64decode(base64_string)

        # Convert to numpy array
        nparr = np.frombuffer(img_bytes, np.uint8)

        # Decode to OpenCV image
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise ValueError("Failed to decode image")

        return img

    except Exception as e:
        logger.error(f"Error converting base64 to cv2 image: {str(e)}")
        raise


def cv2_to_base64(image, format=".jpg", quality=90):
    """
    Convert OpenCV image to base64 encoded string

    Args:
        image (numpy.ndarray): OpenCV image
        format (str): Image format (.jpg, .png)
        quality (int): JPEG quality (1-100)

    Returns:
        str: Base64 encoded image string
    """
    try:
        # Encode image to bytes
        if format == ".jpg":
            encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), quality]
        else:
            encode_param = []

        _, buffer = cv2.imencode(format, image, encode_param)

        # Convert to base64
        img_base64 = base64.b64encode(buffer).decode("utf-8")

        return f"data:image/jpeg;base64,{img_base64}"

    except Exception as e:
        logger.error(f"Error converting cv2 image to base64: {str(e)}")
        raise


def resize_image(image, target_size=(640, 640), maintain_aspect=True):
    """
    Resize image to target size

    Args:
        image (numpy.ndarray): Input image
        target_size (tuple): Target (width, height)
        maintain_aspect (bool): Maintain aspect ratio with letterboxing

    Returns:
        numpy.ndarray: Resized image
    """
    try:
        if maintain_aspect:
            # Letterbox resize (maintains aspect ratio)
            h, w = image.shape[:2]
            target_w, target_h = target_size

            # Calculate scaling factor
            scale = min(target_w / w, target_h / h)
            new_w = int(w * scale)
            new_h = int(h * scale)

            # Resize image
            resized = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_LINEAR)

            # Create letterbox canvas
            canvas = np.full((target_h, target_w, 3), 114, dtype=np.uint8)

            # Calculate padding
            top = (target_h - new_h) // 2
            left = (target_w - new_w) // 2

            # Place resized image on canvas
            canvas[top : top + new_h, left : left + new_w] = resized

            return canvas
        else:
            # Simple resize (may distort)
            return cv2.resize(image, target_size, interpolation=cv2.INTER_LINEAR)

    except Exception as e:
        logger.error(f"Error resizing image: {str(e)}")
        raise


def normalize_image(image, mean=None, std=None):
    """
    Normalize image pixel values

    Args:
        image (numpy.ndarray): Input image
        mean (list): Mean values for each channel
        std (list): Standard deviation for each channel

    Returns:
        numpy.ndarray: Normalized image
    """
    try:
        # Convert to float
        img_float = image.astype(np.float32) / 255.0

        if mean is not None and std is not None:
            mean = np.array(mean, dtype=np.float32)
            std = np.array(std, dtype=np.float32)
            img_float = (img_float - mean) / std

        return img_float

    except Exception as e:
        logger.error(f"Error normalizing image: {str(e)}")
        raise


def draw_detections(image, detections, show_confidence=True, thickness=2):
    """
    Draw bounding boxes and labels on image

    Args:
        image (numpy.ndarray): Input image
        detections (list): List of detection dictionaries
        show_confidence (bool): Show confidence scores
        thickness (int): Box line thickness

    Returns:
        numpy.ndarray: Image with drawn detections
    """
    try:
        img_copy = image.copy()

        for det in detections:
            bbox = det["bbox"]
            confidence = det.get("confidence", 0)
            class_name = det.get("class", "person")

            x1, y1, x2, y2 = map(int, bbox)

            # Draw bounding box
            color = (0, 255, 0)  # Green for person
            cv2.rectangle(img_copy, (x1, y1), (x2, y2), color, thickness)

            # Draw label
            if show_confidence:
                label = f"{class_name}: {confidence:.2f}"
            else:
                label = class_name

            label_size, _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
            label_w, label_h = label_size

            # Draw label background
            cv2.rectangle(
                img_copy, (x1, y1 - label_h - 10), (x1 + label_w, y1), color, -1
            )

            # Draw label text
            cv2.putText(
                img_copy,
                label,
                (x1, y1 - 5),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (255, 255, 255),
                1,
            )

        return img_copy

    except Exception as e:
        logger.error(f"Error drawing detections: {str(e)}")
        raise


def validate_image(image):
    """
    Validate image format and properties

    Args:
        image (numpy.ndarray): Input image

    Returns:
        dict: Validation result with status and message
    """
    try:
        if image is None:
            return {"valid": False, "error": "Image is None"}

        if not isinstance(image, np.ndarray):
            return {"valid": False, "error": "Image is not a numpy array"}

        if len(image.shape) != 3:
            return {"valid": False, "error": "Image must have 3 dimensions"}

        if image.shape[2] != 3:
            return {"valid": False, "error": "Image must have 3 channels (RGB/BGR)"}

        height, width = image.shape[:2]
        if height < 10 or width < 10:
            return {"valid": False, "error": "Image dimensions too small"}

        if height > 10000 or width > 10000:
            return {"valid": False, "error": "Image dimensions too large"}

        return {
            "valid": True,
            "width": width,
            "height": height,
            "channels": image.shape[2],
            "dtype": str(image.dtype),
        }

    except Exception as e:
        return {"valid": False, "error": str(e)}


def create_heatmap(image, detections, radius=50):
    """
    Create a heatmap overlay showing crowd density

    Args:
        image (numpy.ndarray): Base image
        detections (list): List of detection dictionaries
        radius (int): Heat radius around each person

    Returns:
        numpy.ndarray: Image with heatmap overlay
    """
    try:
        h, w = image.shape[:2]
        heatmap = np.zeros((h, w), dtype=np.float32)

        # Add heat for each detection
        for det in detections:
            center = det.get("center", None)
            if center is None:
                bbox = det["bbox"]
                center = [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2]

            cx, cy = map(int, center)

            # Create circular heat kernel
            y_coords, x_coords = np.ogrid[-cy : h - cy, -cx : w - cx]
            mask = x_coords * x_coords + y_coords * y_coords <= radius * radius
            heatmap[mask] += 1

        # Normalize heatmap
        if heatmap.max() > 0:
            heatmap = heatmap / heatmap.max()

        # Apply colormap
        heatmap_colored = cv2.applyColorMap(
            (heatmap * 255).astype(np.uint8), cv2.COLORMAP_JET
        )

        # Blend with original image
        overlay = cv2.addWeighted(image, 0.6, heatmap_colored, 0.4, 0)

        return overlay

    except Exception as e:
        logger.error(f"Error creating heatmap: {str(e)}")
        raise


def get_image_stats(image):
    """
    Get statistical information about the image

    Args:
        image (numpy.ndarray): Input image

    Returns:
        dict: Image statistics
    """
    try:
        stats = {
            "shape": image.shape,
            "dtype": str(image.dtype),
            "min": int(image.min()),
            "max": int(image.max()),
            "mean": float(image.mean()),
            "std": float(image.std()),
            "size_bytes": image.nbytes,
            "size_mb": round(image.nbytes / (1024 * 1024), 2),
        }

        return stats

    except Exception as e:
        logger.error(f"Error getting image stats: {str(e)}")
        return {}
