from fastapi import FastAPI, File, UploadFile
from ultralytics import YOLO
import cv2
import numpy as np
import pytesseract

app = FastAPI()

# 🔥 Load models (use correct paths if needed)
car_model = YOLO("yolo8_last_version_car(must).pt")
plate_model = YOLO("plattes_detect_model.pt")

# 🔥 Tesseract path (Windows)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    try:
        # Read image
        image_bytes = await file.read()
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return {"error": "Invalid image"}

        # YOLO inference
        car_results = car_model(img)[0]
        plate_results = plate_model(img)[0]

        plate_texts = []

        # If no detections
        if plate_results.boxes is None:
            return {
                "cars_detected": len(car_results.boxes),
                "plates_detected": 0,
                "plate_texts": []
            }

        h, w = img.shape[:2]

        for box in plate_results.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])

            # 🔥 Clamp coordinates (VERY IMPORTANT FIX)
            x1 = max(0, min(x1, w - 1))
            x2 = max(0, min(x2, w - 1))
            y1 = max(0, min(y1, h - 1))
            y2 = max(0, min(y2, h - 1))

            # Crop plate
            plate_crop = img[y1:y2, x1:x2]

            if plate_crop is None or plate_crop.size == 0:
                continue

            # OCR preprocessing (improves accuracy)
            gray = cv2.cvtColor(plate_crop, cv2.COLOR_BGR2GRAY)
            gray = cv2.resize(gray, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
            _, gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

            # OCR
            text = pytesseract.image_to_string(gray, config="--psm 7")

            if text.strip():
                plate_texts.append(text.strip())

        return {
            "cars_detected": len(car_results.boxes),
            "plates_detected": len(plate_results.boxes),
            "plate_texts": plate_texts
        }

    except Exception as e:
        return {"error": str(e)}