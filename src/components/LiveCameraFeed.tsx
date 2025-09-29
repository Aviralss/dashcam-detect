import { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePotholes } from '@/hooks/usePotholes';
import { useYOLODetection } from '@/hooks/useYOLODetection';
import { toast } from '@/hooks/use-toast';
import { Camera, Square, Settings, MapPin, Download, RotateCcw, Smartphone } from 'lucide-react';

interface DetectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
}

const LiveCameraFeed = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [detections, setDetections] = useState<DetectionBox[]>([]);
  const [stats, setStats] = useState({
    totalDetected: 0,
    fps: 30,
    accuracy: 94.2
  });
  const [currentLocation, setCurrentLocation] = useState({ lat: 28.6129, lng: 77.2295 });
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment'); // Default to back camera
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [simulationMode, setSimulationMode] = useState(false);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // Generate random detections for simulation mode
  const generateRandomDetections = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return [];
    
    const canvas = canvasRef.current;
    const numDetections = Math.floor(Math.random() * 4) + 1; // 1-4 detections
    const detections: DetectionBox[] = [];
    
    for (let i = 0; i < numDetections; i++) {
      const width = Math.random() * 100 + 50; // 50-150px wide
      const height = Math.random() * 80 + 40;  // 40-120px tall
      const x = Math.random() * (canvas.width - width);
      const y = Math.random() * (canvas.height - height);
      
      const severities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const confidence = Math.random() * 0.4 + 0.6; // 0.6-1.0 confidence
      
      detections.push({
        x,
        y,
        width,
        height,
        confidence,
        severity
      });
    }
    
    return detections;
  }, []);

  // Simulation loop
  useEffect(() => {
    if (!simulationMode || !isStreaming) {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
      return;
    }

    // Start simulation
    const runSimulation = () => {
      const newDetections = generateRandomDetections();
      if (newDetections.length > 0) {
        setDetections(newDetections);
        setStats(prev => ({
          ...prev,
          totalDetected: prev.totalDetected + newDetections.length,
        }));
        
        // Create pothole records for some detections
        if (Math.random() > 0.7) { // 30% chance to create a pothole record
          const randomDetection = newDetections[Math.floor(Math.random() * newDetections.length)];
          createDetectedPothole(randomDetection);
        }
      }
    };

    simulationIntervalRef.current = setInterval(runSimulation, 2000); // Every 2 seconds
    
    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
    };
  }, [simulationMode, isStreaming, generateRandomDetections]);

  const { createPothole } = usePotholes();
  const { isModelLoaded, isLoading, loadModel, detectPotholes } = useYOLODetection();

  // Get available cameras on component mount
  useEffect(() => {
    const getCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        setAvailableCameras(cameras);
      } catch (error) {
        console.error('Error getting cameras:', error);
      }
    };
    getCameras();
  }, []);

  // Real GPS tracking
  useEffect(() => {
    const requestLocation = async () => {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setLocationPermission(permission.state);
        
        if (permission.state === 'granted') {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setCurrentLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude
              });
            },
            (error) => {
              console.error('Geolocation error:', error);
              toast({
                title: "Location Error",
                description: "Could not get your location. Using default location.",
                variant: "destructive"
              });
            }
          );
        }
      } catch (error) {
        console.error('Permission check error:', error);
      }
    };

    requestLocation();

    if (!isStreaming) return;

    // Update location every 5 seconds when streaming
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.error('Geolocation watch error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      }
    );

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isStreaming]);

  // Real YOLO detection with improved synchronization (disabled in simulation mode)
  useEffect(() => {
    console.log('Detection useEffect triggered:', {
      isStreaming,
      isModelLoaded,
      hasVideo: !!videoRef.current,
      simulationMode
    });
    
    if (!isStreaming || !isModelLoaded || !videoRef.current || simulationMode) {
      console.log('Detection loop not starting due to conditions:', {
        isStreaming,
        isModelLoaded,
        hasVideo: !!videoRef.current,
        simulationMode
      });
      return;
    }

    console.log('Starting real-time detection loop...');

    // Keep overlay canvas in sync with video dimensions
    const syncCanvasSize = () => {
      if (!videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (video.videoWidth && video.videoHeight) {
        // Match video dimensions exactly
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Scale canvas to match displayed video size
        const videoRect = video.getBoundingClientRect();
        canvas.style.width = `${videoRect.width}px`;
        canvas.style.height = `${videoRect.height}px`;
        
        console.log(`Canvas synced: ${canvas.width}x${canvas.height} (display: ${videoRect.width}x${videoRect.height})`);
      }
    };
    
    videoRef.current.addEventListener('loadedmetadata', syncCanvasSize);
    videoRef.current.addEventListener('resize', syncCanvasSize);
    syncCanvasSize();

    let cancelled = false;
    const cadenceMs = 200; // Faster detection at ~5 FPS

    const tick = async () => {
      if (cancelled || !videoRef.current || !canvasRef.current) {
        console.log('Detection tick cancelled or missing refs');
        return;
      }
      
      try {
        // Ensure we have current video data
        if (videoRef.current.readyState < 2) {
          console.log('Video not ready, retrying...');
          setTimeout(tick, cadenceMs);
          return;
        }
        
        // Sync canvas size before detection
        syncCanvasSize();
        
        console.log('Running YOLO detection...');
        const newDetections = await detectPotholes(videoRef.current);
        console.log(`Detection cycle: found ${newDetections.length} objects`);
        
        if (newDetections.length > 0) {
          // Keep last 10 detections for better visibility
          setDetections(prev => [...prev.slice(-9), ...newDetections]);
          setStats(prev => ({
            ...prev,
            totalDetected: prev.totalDetected + newDetections.length,
          }));
          
          // Create pothole records for high-confidence detections
          newDetections
            .filter(detection => detection.confidence > 0.6)
            .forEach(detection => {
              createDetectedPothole(detection);
            });
        } else {
          // Gradually fade out old detections instead of clearing immediately
          setDetections(prev => prev.slice(-5));
        }
      } catch (error) {
        console.error('Detection error:', error);
      } finally {
        if (!cancelled) setTimeout(tick, cadenceMs);
      }
    };

    tick();

    return () => {
      console.log('Cleaning up detection loop');
      cancelled = true;
      if (videoRef.current) {
        videoRef.current.removeEventListener('loadedmetadata', syncCanvasSize);
        videoRef.current.removeEventListener('resize', syncCanvasSize);
      }
    };
  }, [isStreaming, isModelLoaded, detectPotholes, simulationMode]);

  const createDetectedPothole = async (detection: DetectionBox) => {
    try {
      const severity = detection.confidence > 0.9 ? 'high' : 
                      detection.confidence > 0.8 ? 'medium' : 'low';
                      
      await createPothole({
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
        severity,
        title: `Pothole detected via live camera`,
        description: `AI detected pothole with ${(detection.confidence * 100).toFixed(1)}% confidence`,
        vehicle_id: 'DASHCAM-001',
        reported_at: new Date().toISOString()
      });

      toast({
        title: "New Pothole Detected",
        description: `Severity: ${severity} | Confidence: ${(detection.confidence * 100).toFixed(1)}%`
      });
    } catch (error) {
      console.error('Failed to create pothole:', error);
    }
  };

  const startCamera = useCallback(async () => {
    try {
      console.log('Starting camera with simulationMode:', simulationMode);
      
      // Request location permission first
      if (locationPermission !== 'granted') {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCurrentLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            setLocationPermission('granted');
          },
          (error) => {
            console.error('Location permission denied:', error);
            setLocationPermission('denied');
            toast({
              title: "Location Permission Required",
              description: "Please enable location access for accurate pothole mapping.",
              variant: "destructive"
            });
          }
        );
      }

      // Load YOLO model only if not in simulation mode
      if (!simulationMode && !isModelLoaded && !isLoading) {
        console.log('Loading YOLO model for live detection...');
        await loadModel();
        console.log('YOLO model loaded:', isModelLoaded);
      }

      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: facingMode
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        console.log('Camera stream started');
      }
    } catch (error) {
      console.error('Camera start error:', error);
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  }, [isModelLoaded, isLoading, loadModel, facingMode, locationPermission, simulationMode]);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setDetections([]);
  }, []);

  const switchCamera = useCallback(() => {
    if (isStreaming) {
      stopCamera();
      setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
      // Restart camera after a brief delay
      setTimeout(() => startCamera(), 100);
    } else {
      setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    }
  }, [isStreaming, startCamera, stopCamera]);

  // Draw detection boxes on canvas with enhanced visibility
  useEffect(() => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Always clear first
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (detections.length === 0) return;

    console.log(`Drawing ${detections.length} detection boxes`);

    detections.forEach((detection, index) => {
      // Enhanced color coding: Red = High, Yellow = Medium, Green = Low
      const colors = {
        high: { stroke: '#ef4444', fill: '#ef4444' },     // Bright red
        medium: { stroke: '#eab308', fill: '#eab308' },   // Bright yellow  
        low: { stroke: '#22c55e', fill: '#22c55e' }       // Bright green
      };
      
      const color = colors[detection.severity];

      // Draw thick, visible rectangle
      ctx.strokeStyle = color.stroke;
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      ctx.strokeRect(detection.x, detection.y, detection.width, detection.height);

      // Add a slight glow effect
      ctx.shadowColor = color.stroke;
      ctx.shadowBlur = 10;
      ctx.strokeRect(detection.x, detection.y, detection.width, detection.height);
      ctx.shadowBlur = 0;

      // Draw confidence label with background
      const confidence = `${(detection.confidence * 100).toFixed(0)}%`;
      const labelWidth = ctx.measureText(confidence).width + 10;
      const labelHeight = 20;
      
      // Label background
      ctx.fillStyle = color.fill;
      ctx.fillRect(detection.x, detection.y - labelHeight, labelWidth, labelHeight);
      
      // Label text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(confidence, detection.x + 5, detection.y - 6);
      
      // Severity indicator
      ctx.fillStyle = 'white';
      ctx.font = 'bold 10px Arial';
      ctx.fillText(detection.severity.toUpperCase(), detection.x + 5, detection.y + 15);
      
      console.log(`Drew detection ${index}: ${detection.severity} at (${detection.x.toFixed(0)}, ${detection.y.toFixed(0)}) ${detection.width.toFixed(0)}x${detection.height.toFixed(0)}`);
    });
  }, [detections]);

  return (
    <div className="space-y-6">
      {/* Camera Feed */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Live Camera Feed
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={isStreaming ? "default" : "secondary"}>
                {isStreaming ? "Live" : "Offline"}
              </Badge>
              <Badge variant={simulationMode ? "destructive" : "outline"} className="text-xs">
                {simulationMode ? "Simulation" : "AI Detection"}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {facingMode === 'environment' ? 'Back' : 'Front'} Camera
              </Badge>
              <Badge variant={locationPermission === 'granted' ? "default" : "secondary"} className="text-xs">
                GPS: {locationPermission === 'granted' ? 'On' : 'Off'}
              </Badge>
              {availableCameras.length > 1 && (
                <Button size="sm" variant="outline" onClick={switchCamera}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-[250px] sm:h-[300px] md:h-[360px] lg:h-[400px] object-cover"
              autoPlay
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              style={{ 
                objectFit: 'cover',
                mixBlendMode: 'normal'
              }}
            />
            {!isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Camera feed not active</p>
                </div>
              </div>
            )}
            {/* Location overlay */}
            <div className="absolute bottom-4 left-4 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            {!isStreaming ? (
              <Button onClick={startCamera} disabled={isLoading && !simulationMode} className="flex-1">
                {isLoading && !simulationMode ? (
                  <>
                    <Download className="h-4 w-4 mr-2 animate-spin" />
                    Loading AI Model...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Start {simulationMode ? 'Simulation' : 'AI Detection'}
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={stopCamera} variant="destructive" className="flex-1">
                <Square className="h-4 w-4 mr-2" />
                Stop Feed
              </Button>
            )}
            
            {/* Simulation Toggle */}
            <Button 
              onClick={() => setSimulationMode(!simulationMode)} 
              variant={simulationMode ? "default" : "outline"}
              className="sm:w-auto"
            >
              {simulationMode ? "🎯 Live AI" : "🎮 Simulation"}
            </Button>
            
            {availableCameras.length > 1 && (
              <Button onClick={switchCamera} variant="outline" size="sm" className="sm:w-auto">
                <Smartphone className="h-4 w-4 mr-2" />
                Switch Camera
              </Button>
            )}
            {locationPermission !== 'granted' && (
              <Button 
                onClick={() => navigator.geolocation.getCurrentPosition(() => setLocationPermission('granted'))}
                variant="outline" 
                size="sm" 
                className="sm:w-auto"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Enable GPS
              </Button>
            )}
          </div>

          {!simulationMode && isModelLoaded && (
            <div className="mt-2 text-xs text-green-600 text-center">
              ✓ AI Model Ready for Detection
            </div>
          )}
          
          {simulationMode && (
            <div className="mt-2 text-xs text-orange-600 text-center">
              🎮 Simulation Mode - Showing Random Detections
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detection Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-primary">{stats.totalDetected}</div>
            <div className="text-xs text-muted-foreground">Potholes Detected</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-primary">{stats.fps}</div>
            <div className="text-xs text-muted-foreground">FPS</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-primary">{stats.accuracy}%</div>
            <div className="text-xs text-muted-foreground">Accuracy</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiveCameraFeed;