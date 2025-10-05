# Custom YOLOv8 Model Integration Guide

This guide explains how to integrate your custom trained YOLOv8 model with the dashcam detection web app for real-time pothole detection.

## Overview

The app supports three types of custom model integration:

1. **Roboflow** - Easiest option, upload your model and use their API
2. **Hugging Face** - Convert to ONNX and host on Hugging Face
3. **Custom API** - Deploy your own Flask/FastAPI server

## Option 1: Roboflow (Recommended for beginners)

### Steps:

1. **Export your YOLOv8 model:**
   ```bash
   # If you have a .pt file
   yolo export model=your_model.pt format=onnx
   ```

2. **Upload to Roboflow:**
   - Go to https://app.roboflow.com/
   - Create a new project
   - Upload your model or training data
   - Get your API endpoint (looks like: `https://detect.roboflow.com/your-project/1`)
   - Get your API key from settings

3. **Configure in the app:**
   - Click "Model Config" button in Live Camera page
   - Select "Roboflow" as model type
   - Enter your endpoint URL
   - Enter your API key
   - Click "Save Configuration"

4. **Start detection:**
   - Click "Start AI Detection"
   - Your custom model will now be used!

## Option 2: Hugging Face

### Steps:

1. **Convert YOLOv8 to ONNX:**
   ```bash
   pip install ultralytics onnx
   yolo export model=your_model.pt format=onnx opset=12
   ```

2. **Upload to Hugging Face:**
   ```bash
   pip install huggingface-hub
   huggingface-cli login
   
   # Create a new model repo
   # Upload your .onnx file to the repo
   ```

3. **Enable Inference API:**
   - Go to your model page on Hugging Face
   - Enable the Inference API
   - Get your API token from settings

4. **Configure in the app:**
   - Click "Model Config" button
   - Select "Hugging Face"
   - Enter endpoint: `https://api-inference.huggingface.co/models/your-username/your-model`
   - Enter your API token
   - Click "Save Configuration"

## Option 3: Custom API (Most flexible)

### Deploy with Flask:

```python
from flask import Flask, request, jsonify
from ultralytics import YOLO
import base64
import io
from PIL import Image
import numpy as np

app = Flask(__name__)
model = YOLO('your_model.pt')

@app.route('/detect', methods=['POST'])
def detect():
    data = request.json
    image_data = data['image']
    
    # Decode base64 image
    image_data = image_data.split(',')[1]
    image_bytes = base64.b64decode(image_data)
    image = Image.open(io.BytesIO(image_bytes))
    
    # Run detection
    results = model(image)
    
    # Format response
    detections = []
    for result in results:
        boxes = result.boxes
        for box in boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            detections.append({
                'x': x1,
                'y': y1,
                'width': x2 - x1,
                'height': y2 - y1,
                'confidence': float(box.conf[0]),
                'label': result.names[int(box.cls[0])]
            })
    
    return jsonify({'detections': detections})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

### Deploy with FastAPI:

```python
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import base64
import io
from PIL import Image

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = YOLO('your_model.pt')

@app.post("/detect")
async def detect(data: dict):
    image_data = data['image']
    
    # Decode base64 image
    image_data = image_data.split(',')[1]
    image_bytes = base64.b64decode(image_data)
    image = Image.open(io.BytesIO(image_bytes))
    
    # Run detection
    results = model(image)
    
    # Format response
    detections = []
    for result in results:
        boxes = result.boxes
        for box in boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            detections.append({
                'x': x1,
                'y': y1,
                'width': x2 - x1,
                'height': y2 - y1,
                'confidence': float(box.conf[0]),
                'label': result.names[int(box.cls[0])]
            })
    
    return {'detections': detections}
```

### Deploy to cloud:

**Railway:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

**Render:**
- Push code to GitHub
- Connect to Render
- Deploy as Web Service

**Heroku:**
```bash
heroku create your-app-name
git push heroku main
```

### Configure in the app:

- Click "Model Config" button
- Select "Custom API"
- Enter your deployed endpoint URL
- Enter API key if you added authentication
- Click "Save Configuration"

## Testing Your Integration

1. Start the camera feed
2. Point camera at road/pothole
3. Check browser console for detection logs
4. Verify detections are displayed with bounding boxes

## Troubleshooting

### Common Issues:

**No detections appearing:**
- Check browser console for errors
- Verify API endpoint is correct
- Test API endpoint with curl/Postman first

**CORS errors:**
- Ensure your API allows cross-origin requests
- Add proper CORS headers (shown in examples above)

**Rate limiting:**
- Roboflow free tier has limits
- Consider adding delays between detections
- Upgrade to paid plan if needed

**Poor accuracy:**
- Adjust confidence threshold in edge function
- Retrain model with more data
- Try different YOLOv8 model sizes (n/s/m/l/x)

## Response Format

Your API should return detections in this format:

```json
{
  "detections": [
    {
      "x": 100,
      "y": 150,
      "width": 50,
      "height": 40,
      "confidence": 0.92,
      "label": "pothole"
    }
  ]
}
```

## Need Help?

- Check the edge function: `supabase/functions/yolo-detection/index.ts`
- Review the hook: `src/hooks/useCustomYOLO.ts`
- See the UI: `src/components/ModelConfig.tsx`
