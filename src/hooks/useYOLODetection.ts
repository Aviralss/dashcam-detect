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
      // Using YOLO model for better object detection
      let detector;
      try {
        // Try WebGPU first
        detector = await pipeline(
          'object-detection',
          'Xenova/yolov9-c',
          { 
            device: 'webgpu',
            dtype: 'fp32'
          }
        );
      } catch (webgpuError) {
        console.log('WebGPU failed, falling back to CPU:', webgpuError);
        // Fallback to CPU if WebGPU fails
        detector = await pipeline(
          'object-detection',
          'Xenova/yolov9-c',
          { device: 'cpu' }
        );
      }
      
      pipelineRef.current = detector;
      setIsModelLoaded(true);
    } catch (error) {
      console.error('Failed to load YOLO model:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const detectPotholes = useCallback(async (
    videoElement: HTMLVideoElement
  ): Promise<DetectionBox[]> => {
    if (!pipelineRef.current || !videoElement) {
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

      // Run detection
      const detections = await pipelineRef.current(blob) as Detection[];
      
      // Filter and convert detections to our format
      // Look for objects that might indicate road damage or anomalies
      const roadDamageLabels = ['pothole', 'crack', 'damage', 'hole', 'road', 'construction', 'barrier', 'cone'];
      
      return detections
        .filter(detection => {
          // Filter for relevant labels or unusual objects on roads
          const isRelevant = roadDamageLabels.some(label => 
            detection.label.toLowerCase().includes(label)
          );
          // Include any object that appears anomalous on road surfaces
          const isPossibleRoadAnomaly = ['vehicle', 'car', 'truck', 'person'].every(commonLabel => 
            !detection.label.toLowerCase().includes(commonLabel)
          ) && detection.score > 0.6;
          
          return (isRelevant || isPossibleRoadAnomaly) && detection.score > 0.4;
        })
        .map(detection => {
          const { xmin, ymin, xmax, ymax } = detection.box;
          const width = xmax - xmin;
          const height = ymax - ymin;
          
          // Determine severity based on size and confidence
          let severity: 'low' | 'medium' | 'high' = 'low';
          const area = width * height;
          const normalizedArea = area / (canvas.width * canvas.height);
          
          if (detection.score > 0.8 && normalizedArea > 0.01) {
            severity = 'high';
          } else if (detection.score > 0.7 || normalizedArea > 0.005) {
            severity = 'medium';
          }
          
          return {
            x: xmin,
            y: ymin,
            width,
            height,
            confidence: detection.score,
            severity
          };
        });
        
    } catch (error) {
      console.error('Detection failed:', error);
      return [];
    }
  }, []);

  return {
    isModelLoaded,
    isLoading,
    loadModel,
    detectPotholes
  };
};