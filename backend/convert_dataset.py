import scipy.io
import os
import cv2
from pathlib import Path

def convert_shanghaitech_to_yolo(base_dir, dataset_part, split):
    """
    base_dir: 'ShanghaiTech_Crowd_Counting_Dataset'
    dataset_part: 'part_A_final' or 'part_B_final'
    split: 'train_data' or 'test_data'
    """
    img_dir = Path(base_dir) / dataset_part / split / 'images'
    gt_dir = Path(base_dir) / dataset_part / split / 'ground_truth'
    
    # YOLO output structure
    yolo_labels_dir = Path(base_dir) / 'yolo_labels' / dataset_part / split
    yolo_labels_dir.mkdir(parents=True, exist_ok=True)
    
    img_files = list(img_dir.glob('*.jpg'))
    print(f"Converting {len(img_files)} images from {dataset_part} {split}...")
    
    for img_path in img_files:
        # Load image to get dimensions
        img = cv2.imread(str(img_path))
        if img is None:
            print(f"Error loading {img_path}")
            continue
        h, w, _ = img.shape
        
        # Load .mat file
        mat_path = gt_dir / f"GT_{img_path.name.replace('.jpg', '.mat')}"
        if not mat_path.exists():
            print(f"Ground truth not found for {img_path.name}")
            continue
            
        mat = scipy.io.loadmat(str(mat_path))
        # Part A and B structure: image_info[0,0][0,0][0] are the points
        points = mat['image_info'][0,0][0,0][0]
        
        yolo_label_path = yolo_labels_dir / f"{img_path.stem}.txt"
        with open(yolo_label_path, 'w') as f:
            for pt in points:
                x, y = pt
                # Normalize coordinates
                xn = x / w
                yn = y / h
                # YOLOv8 expects: <class_id> <x_center> <y_center> <width> <height>
                # Using dummy width/height for point-like detection (e.g., 0.01)
                # Class 0: Person
                f.write(f"0 {xn} {yn} 0.01 0.01\n")

if __name__ == "__main__":
    base = r"E:\Projects\CrowdVision-AI\ShanghaiTech_Crowd_Counting_Dataset"
    
    # Convert Part A
    convert_shanghaitech_to_yolo(base, 'part_A_final', 'train_data')
    convert_shanghaitech_to_yolo(base, 'part_A_final', 'test_data')
    
    # Convert Part B
    convert_shanghaitech_to_yolo(base, 'part_B_final', 'train_data')
    convert_shanghaitech_to_yolo(base, 'part_B_final', 'test_data')
    
    print("Conversion completed!")
