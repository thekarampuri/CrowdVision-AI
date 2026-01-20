import base64
import json
import os
import time

import cv2
import requests


def test_health_check():
    """Test server health endpoint"""
    print("\n" + "=" * 60)
    print("TEST 1: Health Check")
    print("=" * 60)

    try:
        response = requests.get("http://localhost:5000/health", timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")

        if response.status_code == 200 and response.json().get("model_loaded"):
            print("✓ Health check PASSED")
            return True
        else:
            print("✗ Health check FAILED")
            return False

    except requests.exceptions.ConnectionError:
        print("✗ ERROR: Could not connect to server")
        print("  Make sure the server is running on http://localhost:5000")
        return False
    except Exception as e:
        print(f"✗ ERROR: {str(e)}")
        return False


def test_config_endpoint():
    """Test configuration endpoint"""
    print("\n" + "=" * 60)
    print("TEST 2: Get Configuration")
    print("=" * 60)

    try:
        response = requests.get("http://localhost:5000/config", timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")

        if response.status_code == 200:
            print("✓ Config endpoint PASSED")
            return True
        else:
            print("✗ Config endpoint FAILED")
            return False

    except Exception as e:
        print(f"✗ ERROR: {str(e)}")
        return False


def test_detection_with_sample_image():
    """Test detection with a sample image"""
    print("\n" + "=" * 60)
    print("TEST 3: Detection with Sample Image")
    print("=" * 60)

    # Create a sample test image (blank with text)
    test_image = create_test_image()

    # Convert image to base64
    _, buffer = cv2.imencode(".jpg", test_image)
    img_base64 = base64.b64encode(buffer).decode("utf-8")
    img_data_url = f"data:image/jpeg;base64,{img_base64}"

    print(f"Image size: {test_image.shape}")
    print(f"Base64 length: {len(img_base64)} characters")

    try:
        payload = {"image": img_data_url, "cameraId": "test_camera_001"}

        print("\nSending detection request...")
        start_time = time.time()

        response = requests.post(
            "http://localhost:5000/detect", json=payload, timeout=30
        )

        end_time = time.time()
        inference_time = (end_time - start_time) * 1000  # Convert to ms

        print(f"Status Code: {response.status_code}")
        print(f"Inference Time: {inference_time:.2f}ms")

        if response.status_code == 200:
            result = response.json()
            print(f"\nDetection Results:")
            print(f"  People Count: {result['count']}")
            print(f"  Risk Level: {result['riskLevel']}")
            print(f"  Gatherings: {result['gatherings']}")
            print(f"  Has Gathering: {result['hasGathering']}")
            print(f"  Camera ID: {result['cameraId']}")
            print(f"  Image Size: {result['imageSize']}")
            print(f"  Detections: {len(result['detections'])}")

            if result["detections"]:
                print(f"\nFirst Detection:")
                det = result["detections"][0]
                print(f"  BBox: {det['bbox']}")
                print(f"  Confidence: {det['confidence']}")
                print(f"  Class: {det['class']}")

            print("\n✓ Detection endpoint PASSED")
            return True
        else:
            print(f"✗ Detection endpoint FAILED")
            print(f"Error: {response.text}")
            return False

    except requests.exceptions.Timeout:
        print("✗ ERROR: Request timed out (>30s)")
        return False
    except Exception as e:
        print(f"✗ ERROR: {str(e)}")
        return False


def test_detection_with_real_video():
    """Test detection with video file if available"""
    print("\n" + "=" * 60)
    print("TEST 4: Detection with Real Video (Optional)")
    print("=" * 60)

    video_path = "../crowd_gathering.mp4"

    if not os.path.exists(video_path):
        print("⊘ Video file not found, skipping this test")
        print(f"  Looking for: {video_path}")
        return None

    try:
        cap = cv2.VideoCapture(video_path)

        if not cap.isOpened():
            print("✗ Could not open video file")
            return False

        # Read first frame
        ret, frame = cap.read()
        if not ret:
            print("✗ Could not read frame from video")
            cap.release()
            return False

        print(f"Video frame size: {frame.shape}")

        # Convert frame to base64
        _, buffer = cv2.imencode(".jpg", frame)
        img_base64 = base64.b64encode(buffer).decode("utf-8")
        img_data_url = f"data:image/jpeg;base64,{img_base64}"

        # Send to API
        payload = {"image": img_data_url, "cameraId": "test_video_camera"}

        print("Sending video frame for detection...")
        start_time = time.time()

        response = requests.post(
            "http://localhost:5000/detect", json=payload, timeout=30
        )

        end_time = time.time()
        inference_time = (end_time - start_time) * 1000

        cap.release()

        if response.status_code == 200:
            result = response.json()
            print(f"\nVideo Frame Detection Results:")
            print(f"  People Count: {result['count']}")
            print(f"  Risk Level: {result['riskLevel']}")
            print(f"  Inference Time: {inference_time:.2f}ms")
            print(f"  Gatherings: {result['gatherings']}")

            print("\n✓ Video frame detection PASSED")
            return True
        else:
            print(f"✗ Video frame detection FAILED")
            print(f"Error: {response.text}")
            return False

    except Exception as e:
        print(f"✗ ERROR: {str(e)}")
        return False


def test_update_config():
    """Test updating server configuration"""
    print("\n" + "=" * 60)
    print("TEST 5: Update Configuration")
    print("=" * 60)

    try:
        # Get current config
        response = requests.get("http://localhost:5000/config", timeout=5)
        original_config = response.json()
        print("Original configuration retrieved")

        # Update config
        new_config = {"confidence_threshold": 0.6, "iou_threshold": 0.45}

        print(f"\nUpdating config with: {json.dumps(new_config, indent=2)}")

        response = requests.post(
            "http://localhost:5000/config", json=new_config, timeout=5
        )

        print(f"Status Code: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            print(f"Updated Config: {json.dumps(result['config'], indent=2)}")

            # Restore original config
            restore_config = {
                "confidence_threshold": original_config["confidence_threshold"],
                "iou_threshold": original_config["iou_threshold"],
            }

            requests.post("http://localhost:5000/config", json=restore_config)
            print("\nOriginal configuration restored")

            print("✓ Config update PASSED")
            return True
        else:
            print("✗ Config update FAILED")
            return False

    except Exception as e:
        print(f"✗ ERROR: {str(e)}")
        return False


def create_test_image():
    """Create a simple test image"""
    # Create blank image (640x640, white background)
    img = cv2.imread("../crowd_gathering.mp4", cv2.IMREAD_COLOR)
    if img is None:
        img = 255 * np.ones((640, 640, 3), dtype=np.uint8)

        # Add text
        text = "CrowdVision AI Test Image"
        font = cv2.FONT_HERSHEY_SIMPLEX
        cv2.putText(img, text, (50, 320), font, 1, (0, 0, 0), 2)

    return img


def print_summary(results):
    """Print test summary"""
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)

    total_tests = len([r for r in results if r is not None])
    passed_tests = sum([1 for r in results if r is True])
    failed_tests = sum([1 for r in results if r is False])
    skipped_tests = sum([1 for r in results if r is None])

    print(f"Total Tests: {total_tests}")
    print(f"✓ Passed: {passed_tests}")
    print(f"✗ Failed: {failed_tests}")
    print(f"⊘ Skipped: {skipped_tests}")
    print("=" * 60)

    if failed_tests == 0 and passed_tests > 0:
        print("🎉 All tests PASSED!")
    elif failed_tests > 0:
        print("⚠️  Some tests FAILED. Check the output above.")
    else:
        print("❌ No tests were successful.")

    print("=" * 60 + "\n")


def main():
    """Run all tests"""
    print("\n")
    print("╔" + "=" * 58 + "╗")
    print("║" + " " * 10 + "CrowdVision AI - ML Server Tests" + " " * 15 + "║")
    print("╚" + "=" * 58 + "╝")

    results = []

    # Run tests
    results.append(test_health_check())
    results.append(test_config_endpoint())
    results.append(test_detection_with_sample_image())
    results.append(test_detection_with_real_video())
    results.append(test_update_config())

    # Print summary
    print_summary(results)


if __name__ == "__main__":
    main()
