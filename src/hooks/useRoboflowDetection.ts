import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DetectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  class?: string;
  severity: 'low' | 'medium' | 'high';
}

interface RoboflowConfig {
  modelId: string;
  version: string;
}

export const useRoboflowDetection = () => {
  const [isDetecting, setIsDetecting] = useState(false);
  const { toast } = useToast();
  const [config, setConfig] = useState<RoboflowConfig>(() => {
    const saved = localStorage.getItem('roboflow_config');
    return saved ? JSON.parse(saved) : { modelId: '', version: '' };
  });

  const saveConfig = useCallback((newConfig: RoboflowConfig) => {
    setConfig(newConfig);
    localStorage.setItem('roboflow_config', JSON.stringify(newConfig));
  }, []);

  const detectPotholes = useCallback(async (videoElement: HTMLVideoElement): Promise<DetectionBox[]> => {
    if (!config.modelId || !config.version) {
      console.warn('Roboflow model not configured');
      return [];
    }

    setIsDetecting(true);
    try {
      // Capture frame from video
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return [];
      
      ctx.drawImage(videoElement, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8).split(',')[1]; // Get base64 without prefix

      // Call edge function
      const { data, error } = await supabase.functions.invoke('roboflow-detect', {
        body: {
          imageData,
          modelId: config.modelId,
          version: config.version
        }
      });

      if (error) {
        console.error('Roboflow detection error:', error);
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data?.detections || [];
    } catch (error) {
      console.error('Detection error:', error);
      return [];
    } finally {
      setIsDetecting(false);
    }
  }, [config]);

  return {
    isDetecting,
    config,
    saveConfig,
    detectPotholes,
    isConfigured: !!config.modelId && !!config.version
  };
};
