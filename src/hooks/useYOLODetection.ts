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
        // Try WebGPU first with a timeout
        const webgpuPromise = pipeline(
          'object-detection',
          'onnx-community/yolov8n-ONNX',
          { device: 'webgpu' }
        );
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('WebGPU timeout')), 30000)
        );
        
        detector = await Promise.race([webgpuPromise, timeoutPromise]);
        console.log('Model loaded with WebGPU');
      } catch (webgpuError) {
        console.log('WebGPU failed, falling back to CPU:', webgpuError);
        // Fallback to CPU
        detector = await pipeline(
          'object-detection',
          'onnx-community/yolov8n-ONNX',
          { device: 'cpu' }
        );
        console.log('Model loaded with CPU');
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

      // Run object detection
      const detections = await pipelineRef.current(blob) as Detection[];
      console.log(`Found ${detections.length} objects in frame`);
      
      // Filter for road anomalies and convert to our format
      const roadAnomalyKeywords = ['pothole', 'hole', 'crack', 'damage', 'bump', 'construction', 'barrier', 'cone'];
      
      return detections
        .filter(detection => {
          // Look for unusual objects or potential road damage indicators
          const label = detection.label.toLowerCase();
          const isRoadAnomaly = roadAnomalyKeywords.some(keyword => label.includes(keyword));
          const isUnusualObject = detection.score > 0.6 && 
            !['person', 'car', 'truck', 'bus', 'motorcycle', 'bicycle'].some(common => label.includes(common));
          
          return (isRoadAnomaly || isUnusualObject) && detection.score > 0.3;
        })
        .map(detection => {
          const { xmin, ymin, xmax, ymax } = detection.box;
          const width = xmax - xmin;
          const height = ymax - ymin;
          
          // Determine severity based on size and confidence
          let severity: 'low' | 'medium' | 'high' = 'low';
          const area = width * height;
          const normalizedArea = area / (canvas.width * canvas.height);
          
          if (detection.score > 0.7 && normalizedArea > 0.01) {
            severity = 'high';
          } else if (detection.score > 0.5 || normalizedArea > 0.005) {
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