import { useState, useCallback, useRef } from 'react';
import { pipeline } from '@huggingface/transformers';

interface DetectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
}

interface Detection {
  label: string;
  score: number;
  box: {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
  };
}

export const useYOLODetection = () => {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const pipelineRef = useRef<any>(null);

  const loadModel = useCallback(async () => {
    if (pipelineRef.current) return;
    
    setIsLoading(true);
    try {
      console.log('Loading AI model...');
      // Use a simpler, more reliable model
      let detector;
      try {
          // Try WebGPU first with a timeout (20s)
          const webgpuPromise = pipeline(
            'object-detection',
            'onnx-community/yolov8n-ONNX',
            { device: 'webgpu' }
          );

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('WebGPU timeout')), 20000)
          );

          detector = await Promise.race([webgpuPromise, timeoutPromise]);
          console.log('Model loaded with WebGPU');
        } catch (webgpuError) {
          console.log('WebGPU failed, trying WebAssembly (WASM) backend:', webgpuError);
          try {
            detector = await pipeline(
              'object-detection',
              'onnx-community/yolov8n-ONNX',
              { device: 'wasm' as any }
            );
            console.log('Model loaded with WebAssembly (WASM)');
          } catch (wasmError) {
            console.log('WASM failed, falling back to CPU:', wasmError);
            // Fallback to CPU
            detector = await pipeline(
              'object-detection',
              'onnx-community/yolov8n-ONNX',
              { device: 'cpu' }
            );
            console.log('Model loaded with CPU');
          }
        }
      
      pipelineRef.current = detector;
      setIsModelLoaded(true);
      console.log('AI model ready for detection');
    } catch (error) {
      console.error('Failed to load AI model:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const detectPotholes = useCallback(async (
    videoElement: HTMLVideoElement
  ): Promise<DetectionBox[]> => {
    if (!pipelineRef.current || !videoElement || videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
      return [];
    }

    try {
      // Create canvas to capture frame
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = videoElement.videoWidth || 640;
      canvas.height = videoElement.videoHeight || 480;
      
      // Draw current video frame to canvas
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      // Convert to blob for model input
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(resolve as any, 'image/jpeg', 0.8);
      });
      
      if (!blob) return [];

      return await processDetection(blob, canvas.width, canvas.height);
        
    } catch (error) {
      console.error('Detection failed:', error);
      return [];
    }
  }, []);

  const detectPotholesInImage = useCallback(async (
    imageElement: HTMLImageElement
  ): Promise<DetectionBox[]> => {
    if (!pipelineRef.current) {
      console.error('Model not loaded');
      return [];
    }

    try {
      console.log('Processing image for pothole detection...');
      
      // Create canvas to capture image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = imageElement.naturalWidth || imageElement.width;
      canvas.height = imageElement.naturalHeight || imageElement.height;
      
      // Draw image to canvas
      ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
      
      // Convert to blob for model input
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(resolve as any, 'image/jpeg', 0.8);
      });
      
      if (!blob) return [];

      return await processDetection(blob, canvas.width, canvas.height);
        
    } catch (error) {
      console.error('Image detection failed:', error);
      return [];
    }
  }, []);

  const processDetection = useCallback(async (
    blob: Blob, 
    width: number, 
    height: number
  ): Promise<DetectionBox[]> => {
    if (!pipelineRef.current) return [];

    try {
      // Run object detection
      const detections = await pipelineRef.current(blob) as Detection[];
      console.log(`Found ${detections.length} objects in frame`);
      
      // Enhanced pothole detection logic
      const roadAnomalyKeywords = ['pothole', 'hole', 'crack', 'damage', 'bump', 'construction', 'barrier', 'cone', 'manhole', 'cover'];
      const surfaceKeywords = ['surface', 'ground', 'road', 'pavement', 'asphalt'];
      
      console.log('All detections:', detections.map(d => ({ label: d.label, score: d.score.toFixed(2) })));

      // Primary: look for road anomalies, surface irregularities, and suspicious objects
      const primary = detections
        .filter(detection => {
          const label = detection.label.toLowerCase();
          const isRoadAnomaly = roadAnomalyKeywords.some(keyword => label.includes(keyword));
          const isSurfaceIrregularity = surfaceKeywords.some(keyword => label.includes(keyword));
          
          // More aggressive detection for potential potholes
          const isUnusualObject = detection.score > 0.3 &&
            !['person', 'people', 'man', 'woman', 'car', 'truck', 'bus', 'motorcycle', 'bicycle', 
              'traffic light', 'stop sign', 'tree', 'building', 'sky', 'cloud'].some(common => label.includes(common));
          
          // Accept any detection that could be a road anomaly
          return (isRoadAnomaly || isSurfaceIrregularity || isUnusualObject) && detection.score > 0.25;
        })
        .map(detection => {
          const { xmin, ymin, xmax, ymax } = detection.box;
          const detectionWidth = xmax - xmin;
          const detectionHeight = ymax - ymin;

          let severity: 'low' | 'medium' | 'high' = 'low';
          const area = detectionWidth * detectionHeight;
          const normalizedArea = area / (width * height);

          if (detection.score > 0.7 && normalizedArea > 0.01) {
            severity = 'high';
          } else if (detection.score > 0.5 || normalizedArea > 0.005) {
            severity = 'medium';
          }

          return {
            x: xmin,
            y: ymin,
            width: detectionWidth,
            height: detectionHeight,
            confidence: detection.score,
            severity,
          } as DetectionBox;
        });

      if (primary.length > 0) {
        console.log(`Using ${primary.length} primary anomaly detections`);
        return primary;
      }

      // Fallback: if no anomalies found, use more aggressive detection
      const fallback = detections
        .filter(d => {
          const label = d.label.toLowerCase();
          return d.score > 0.3 && 
            !['person', 'people', 'man', 'woman', 'face'].some(exclude => label.includes(exclude));
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(detection => {
          const { xmin, ymin, xmax, ymax } = detection.box;
          const detectionWidth = xmax - xmin;
          const detectionHeight = ymax - ymin;

          let severity: 'low' | 'medium' | 'high' = detection.score > 0.8 ? 'medium' : 'low';
          const area = detectionWidth * detectionHeight;
          const normalizedArea = area / (width * height);
          if (detection.score > 0.85 && normalizedArea > 0.01) severity = 'high';

          return {
            x: xmin,
            y: ymin,
            width: detectionWidth,
            height: detectionHeight,
            confidence: detection.score,
            severity,
          } as DetectionBox;
        });

      console.log(`Primary anomalies not found. Showing ${fallback.length} fallback detections.`);
      return fallback;
    } catch (error) {
      console.error('Detection processing failed:', error);
      return [];
    }
  }, []);

  return {
    isModelLoaded,
    isLoading,
    loadModel,
    detectPotholes,
    detectPotholesInImage
  };
};