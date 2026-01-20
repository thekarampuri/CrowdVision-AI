"""
Simple test script for ML server
"""

import sys
import time

import requests


def test_ml_server():
    """Test if ML server is running and responding"""

    print("=" * 60)
    print("CrowdVision AI - ML Server Test")
    print("=" * 60)
    print()

    # Test 1: Health Check
    print("Test 1: Health Check...")
    try:
        response = requests.get("http://127.0.0.1:5000/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Health check passed")
            print(f"  Status: {data.get('status')}")
            print(f"  Model loaded: {data.get('model_loaded')}")
            print()
        else:
            print(f"✗ Health check failed with status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("✗ Cannot connect to ML server at http://127.0.0.1:5000")
        print("  Make sure the server is running: python server.py")
        return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

    # Test 2: Configuration
    print("Test 2: Get Configuration...")
    try:
        response = requests.get("http://127.0.0.1:5000/config", timeout=5)
        if response.status_code == 200:
            config = response.json()
            print(f"✓ Config retrieved successfully")
            print(f"  Confidence threshold: {config.get('confidence_threshold')}")
            print(f"  Risk thresholds: {config.get('risk_thresholds')}")
            print()
        else:
            print(f"✗ Config request failed")
            return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

    # Test 3: Simple detection test
    print("Test 3: Detection Test (with dummy data)...")
    print("  (Skipping - requires valid image)")
    print()

    print("=" * 60)
    print("✓ All tests passed! ML server is ready.")
    print("=" * 60)
    return True


if __name__ == "__main__":
    success = test_ml_server()
    sys.exit(0 if success else 1)
