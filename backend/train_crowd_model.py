from ultralytics import YOLO
import os

# Define absolute paths to avoid confusion
SHANGHAITECH_DIR = r"E:\Projects\CrowdVision-AI\ShanghaiTech_Crowd_Counting_Dataset"
DATA_YAML = os.path.join(SHANGHAITECH_DIR, "data_shanghaitech_a.yaml")

def train_model():
    print(f"🚀 Starting YOLOv8 training using ShanghaiTech Part A at: {SHANGHAITECH_DIR}")
    
    # 1. Load a pre-trained model
    # 'yolov8n.pt' is the smallest and fastest model (nano). 
    # Use 'yolov8m.pt' (medium) or 'yolov8l.pt' (large) for better accuracy but slower speed.
    model = YOLO("yolov8n.pt") 

    # 2. Train the model
    # imgsz=640: Image size
    # epochs=50: Number of training passes. Adjust as needed (e.g., 100).
    # batch=16: Batch size. Reduce if you run out of GPU memory.
    # device=0: Use GPU 0. Use 'cpu' if no GPU available.
    # Auto-detect device and configure parameters
    import torch
    
    if torch.cuda.is_available():
        device = 0
        batch_size = 2   # Reduced to 2 for maximum stability on 4GB VRAM
        workers = 2      # Reduced workers to save system RAM
        device_name = torch.cuda.get_device_name(0)
        print(f"✅ GPU Detected: {device_name}")
        print(f"   - Configured for GPU training (Device 0)")
        print(f"   - Adjusted batch size to {batch_size}")
    else:
        device = 'cpu'
        batch_size = 16
        workers = 0      # Windows CPU fix
        print("⚠️ No GPU detected. Training on CPU (this will be slow).")

    try:
        results = model.train(
            data=DATA_YAML,
            epochs=50,
            imgsz=480,       # Reduced from 640 to 480 to save VRAM
            batch=batch_size,
            name="crowd_density_yolov8",
            device=device,
            workers=workers,
            plots=False      # Disable plotting to bypass 'PyDataFrame' error
        )
        
        print("✅ Training completed successfully!")
        print(f"💾 Model saved to: {results.save_dir}")
        
    except Exception as e:
        print(f"❌ Training failed: {e}")
        print("\nPossible fixes:")
        print("1. If CUDA OOM (Out of Memory), reduce 'batch' size (e.g., batch=16 or 8).")
        print("2. Ensure PyTorch is installed with CUDA support.")

if __name__ == "__main__":
    train_model()
