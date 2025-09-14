import { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePotholes } from '@/hooks/usePotholes';
import { toast } from '@/hooks/use-toast';
import { Camera, Square, Settings, MapPin } from 'lucide-react';

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
  const { createPothole } = usePotholes();

  // Simulate GPS tracking
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      setCurrentLocation(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  // Mock YOLOv8 detection simulation
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      // Simulate random pothole detection
      if (Math.random() < 0.1) { // 10% chance every 2 seconds
        const detection: DetectionBox = {
          x: Math.random() * 400,
          y: Math.random() * 300 + 100,
          width: 50 + Math.random() * 100,
          height: 30 + Math.random() * 60,
          confidence: 0.7 + Math.random() * 0.3,
          severity: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
        };
        
        setDetections(prev => [...prev.slice(-4), detection]);
        setStats(prev => ({ ...prev, totalDetected: prev.totalDetected + 1 }));
        
        // Create pothole in database
        createDetectedPothole(detection);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isStreaming]);

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
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Could not access camera. Using simulation mode.",
        variant: "destructive"
      });
      // Start simulation without camera
      setIsStreaming(true);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setDetections([]);
  }, []);

  // Draw detection boxes on canvas
  useEffect(() => {
    if (!canvasRef.current || detections.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach(detection => {
      const color = detection.severity === 'high' ? '#dc2626' : 
                   detection.severity === 'medium' ? '#f59e0b' : '#16a34a';
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(detection.x, detection.y, detection.width, detection.height);
      
      // Draw confidence label
      ctx.fillStyle = color;
      ctx.fillRect(detection.x, detection.y - 20, 80, 20);
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.fillText(`${(detection.confidence * 100).toFixed(1)}%`, detection.x + 5, detection.y - 5);
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
              <Button size="sm" variant="outline">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-[360px] object-cover"
              autoPlay
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
              width={640}
              height={480}
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
          
          <div className="flex gap-2 mt-4">
            {!isStreaming ? (
              <Button onClick={startCamera} className="flex-1">
                <Camera className="h-4 w-4 mr-2" />
                Start Feed
              </Button>
            ) : (
              <Button onClick={stopCamera} variant="destructive" className="flex-1">
                <Square className="h-4 w-4 mr-2" />
                Stop Feed
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detection Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{stats.totalDetected}</div>
            <div className="text-xs text-muted-foreground">Potholes Detected</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{stats.fps}</div>
            <div className="text-xs text-muted-foreground">FPS</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{stats.accuracy}%</div>
            <div className="text-xs text-muted-foreground">Accuracy</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiveCameraFeed;