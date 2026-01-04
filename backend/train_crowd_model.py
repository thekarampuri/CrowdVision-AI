from ultralytics import YOLO
import os

# Define absolute paths to avoid confusion
DATASET_DIR = r"E:\Projects\CrowdVision-AI\Crowd density estimation.v1i.yolov8"
DATA_YAML = os.path.join(DATASET_DIR, "data.yaml")

def train_model():
    print(f"🚀 Starting YOLOv8 training using dataset at: {DATASET_DIR}")
    
    # 1. Load a pre-trained model
    # 'yolov8n.pt' is the smallest and fastest model (nano). 
    # Use 'yolov8m.pt' (medium) or 'yolov8l.pt' (large) for better accuracy but slower speed.
    model = YOLO("yolov8n.pt") 

    # 2. Train the model
    # imgsz=640: Image size
    # epochs=50: Number of training passes. Adjust as needed (e.g., 100).
    # batch=16: Batch size. Reduce if you run out of GPU memory.
    # device=0: Use GPU 0. Use 'cpu' if no GPU available.
    try:
        results = model.train(
            data=DATA_YAML,
            epochs=50,
            imgsz=640,
            batch=16,
            name="crowd_density_yolov8",
            device='cpu',  # Using CPU as no CUDA GPU was detected
            workers=0      # Fix for Windows process errors
        )
        
        print("✅ Training completed successfully!")
        print(f"💾 Model saved to: {results.save_dir}")
        
    except Exception as e:
        print(f"❌ Training failed: {e}")
        print("\nPossible fixes:")
        print("1. If CUDA OOM (Out of Memory), reduce 'batch' size (e.g., batch=8).")
        print("2. If no GPU is detected, change 'device=0' to 'device=\'cpu\''.")

if __name__ == "__main__":
    train_model()
