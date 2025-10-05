import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DetectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  label?: string;
}

interface CustomYOLOConfig {
  modelType: 'roboflow' | 'huggingface' | 'custom';
  modelEndpoint?: string;
  apiKey?: string;
}

export const useCustomYOLO = (config: CustomYOLOConfig) => {
  const [isDetecting, setIsDetecting] = useState(false);

  const detectObjects = useCallback(async (
    videoElement: HTMLVideoElement
  ): Promise<DetectionBox[]> => {
    if (!videoElement || videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
      return [];
    }

    setIsDetecting(true);

    try {
      // Capture frame from video
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = videoElement.videoWidth || 640;
      canvas.height = videoElement.videoHeight || 480;
      
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      console.log('Sending frame to custom YOLO model...');

      // Call edge function
      const { data, error } = await supabase.functions.invoke('yolo-detection', {
        body: {
          imageData,
          modelType: config.modelType,
          modelEndpoint: config.modelEndpoint,
          apiKey: config.apiKey,
        },
      });

      if (error) {
        console.error('Detection error:', error);
        return [];
      }

      console.log(`Received ${data.detections?.length || 0} detections`);
      return data.detections || [];
        
    } catch (error) {
      console.error('Detection failed:', error);
      return [];
    } finally {
      setIsDetecting(false);
    }
  }, [config]);

  const detectInImage = useCallback(async (
    imageElement: HTMLImageElement
  ): Promise<DetectionBox[]> => {
    setIsDetecting(true);

    try {
      // Convert image to base64
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = imageElement.naturalWidth || imageElement.width;
      canvas.height = imageElement.naturalHeight || imageElement.height;
      
      ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      console.log('Sending image to custom YOLO model...');

      // Call edge function
      const { data, error } = await supabase.functions.invoke('yolo-detection', {
        body: {
          imageData,
          modelType: config.modelType,
          modelEndpoint: config.modelEndpoint,
          apiKey: config.apiKey,
        },
      });

      if (error) {
        console.error('Detection error:', error);
        return [];
      }

      return data.detections || [];
        
    } catch (error) {
      console.error('Image detection failed:', error);
      return [];
    } finally {
      setIsDetecting(false);
    }
  }, [config]);

  return {
    isDetecting,
    detectObjects,
    detectInImage,
  };
};
