import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Upload as UploadIcon, Video, Image, X, FileCheck, Eye, EyeOff } from "lucide-react";
import { useRoboflowDetection } from "@/hooks/useRoboflowDetection";

interface FileUploadProps {
  accept: string;
  maxSize: number;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  supportedFormats: string;
}

interface DetectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
}

interface UploadedFile {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  processedImageUrl?: string;
  detections?: DetectionBox[];
  showOriginal?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  accept, 
  maxSize, 
  title, 
  description, 
  icon: Icon, 
  supportedFormats 
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const { isDetecting, isConfigured, detectPotholes } = useRoboflowDetection();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const processImageWithDetection = async (file: File): Promise<{ processedImageUrl: string; detections: DetectionBox[] }> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      img.onload = async () => {
        const canvas = canvasRef.current;
        if (!canvas) {
          reject(new Error('Canvas not available'));
          return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Set canvas size to image size
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;

        // Draw original image
        ctx.drawImage(img, 0, 0);

        try {
          console.log('Starting Roboflow detection on image...');
          
          // Create a temporary video element for the Roboflow hook
          const tempVideo = document.createElement('video');
          tempVideo.width = img.naturalWidth || img.width;
          tempVideo.height = img.naturalHeight || img.height;
          
          // Create a temporary canvas to capture the image as video frame
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = tempVideo.width;
          tempCanvas.height = tempVideo.height;
          const tempCtx = tempCanvas.getContext('2d');
          if (tempCtx) {
            tempCtx.drawImage(img, 0, 0);
          }
          
          // Use the canvas as video source
          const stream = tempCanvas.captureStream();
          tempVideo.srcObject = stream;
          
          // Wait for video to be ready
          await tempVideo.play();
          
          const detections = await detectPotholes(tempVideo);
          console.log(`Detection complete. Found ${detections.length} potential potholes`);
          
          // Draw detection boxes on the canvas
          detections.forEach(detection => {
            const color = detection.severity === 'high' ? '#ef4444' : 
                          detection.severity === 'medium' ? '#f97316' : '#22c55e';
            
            ctx.strokeStyle = color;
            ctx.fillStyle = color + '20';
            ctx.lineWidth = 3;
            
            // Draw rectangle
            ctx.strokeRect(detection.x, detection.y, detection.width, detection.height);
            ctx.fillRect(detection.x, detection.y, detection.width, detection.height);
            
            // Draw label
            ctx.fillStyle = color;
            ctx.font = '14px Arial';
            const label = `Pothole (${Math.round(detection.confidence * 100)}%)`;
            const labelWidth = ctx.measureText(label).width;
            
            ctx.fillRect(detection.x, detection.y - 20, labelWidth + 8, 20);
            ctx.fillStyle = 'white';
            ctx.fillText(label, detection.x + 4, detection.y - 6);
          });

          // Convert canvas to blob URL
          canvas.toBlob((processedBlob) => {
            if (processedBlob) {
              const processedImageUrl = URL.createObjectURL(processedBlob);
              resolve({ processedImageUrl, detections });
            } else {
              reject(new Error('Failed to create processed image'));
            }
          });
          
        } catch (error) {
          console.error('Detection failed:', error);
          // Return original image if detection fails
          canvas.toBlob((processedBlob) => {
            if (processedBlob) {
              const processedImageUrl = URL.createObjectURL(processedBlob);
              resolve({ processedImageUrl, detections: [] });
            } else {
              reject(new Error('Failed to create processed image'));
            }
          });
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const processVideoWithDetection = async (file: File): Promise<{ processedImageUrl: string; detections: DetectionBox[] }> => {
    return new Promise((resolve, reject) => {
      const video = videoRef.current || document.createElement('video');
      video.onloadeddata = async () => {
        const canvas = canvasRef.current;
        if (!canvas) {
          reject(new Error('Canvas not available'));
          return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Set canvas size to video size
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Seek to middle of video for detection
        video.currentTime = video.duration / 2;
        
        await new Promise(resolve => {
          video.onseeked = resolve;
        });

        // Draw video frame
        ctx.drawImage(video, 0, 0);

        try {
          console.log('Starting Roboflow detection on video frame...');
          
          const detections = await detectPotholes(video);
          console.log(`Detection complete. Found ${detections.length} potential potholes`);
          
          // Draw detection boxes
          detections.forEach(detection => {
            const color = detection.severity === 'high' ? '#ef4444' : 
                          detection.severity === 'medium' ? '#f97316' : '#22c55e';
            
            ctx.strokeStyle = color;
            ctx.fillStyle = color + '20';
            ctx.lineWidth = 3;
            
            ctx.strokeRect(detection.x, detection.y, detection.width, detection.height);
            ctx.fillRect(detection.x, detection.y, detection.width, detection.height);
            
            ctx.fillStyle = color;
            ctx.font = '14px Arial';
            const label = `Pothole (${Math.round(detection.confidence * 100)}%)`;
            const labelWidth = ctx.measureText(label).width;
            
            ctx.fillRect(detection.x, detection.y - 20, labelWidth + 8, 20);
            ctx.fillStyle = 'white';
            ctx.fillText(label, detection.x + 4, detection.y - 6);
          });

          canvas.toBlob((processedBlob) => {
            if (processedBlob) {
              const processedImageUrl = URL.createObjectURL(processedBlob);
              resolve({ processedImageUrl, detections });
            } else {
              reject(new Error('Failed to create processed image'));
            }
          });
          
        } catch (error) {
          console.error('Detection failed:', error);
          canvas.toBlob((processedBlob) => {
            if (processedBlob) {
              const processedImageUrl = URL.createObjectURL(processedBlob);
              resolve({ processedImageUrl, detections: [] });
            } else {
              reject(new Error('Failed to create processed image'));
            }
          });
        }
      };
      
      video.onerror = () => reject(new Error('Failed to load video'));
      video.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
        return false;
      }
      return true;
    });

    for (const file of validFiles) {
      const newFile: UploadedFile = {
        file,
        progress: 0,
        status: 'uploading',
        showOriginal: false
      };

      setUploadedFiles(prev => [...prev, newFile]);

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(async () => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          // Process file with Roboflow detection if configured
          let processedData: { processedImageUrl: string; detections: DetectionBox[] } | undefined;
          
          if (isConfigured) {
            try {
              toast.info(`Processing ${file.name} for pothole detection...`);
              if (file.type.startsWith('image/')) {
                processedData = await processImageWithDetection(file);
              } else if (file.type.startsWith('video/')) {
                processedData = await processVideoWithDetection(file);
              }
              if (processedData) {
                toast.success(`${file.name} processed successfully! Found ${processedData.detections.length} potential potholes.`);
              }
            } catch (error) {
              console.error('Processing failed:', error);
              toast.error(`Failed to process ${file.name} for pothole detection`);
            }
          } else {
            toast.warning('Please configure your Roboflow model in Settings to enable detection');
          }
          
          setUploadedFiles(prev => 
            prev.map(f => 
              f.file === file 
                ? { 
                    ...f, 
                    progress: 100, 
                    status: 'completed',
                    processedImageUrl: processedData?.processedImageUrl,
                    detections: processedData?.detections || []
                  }
                : f
            )
          );
          
          if (!processedData) {
            toast.success(`${file.name} uploaded successfully`);
          }
        } else {
          setUploadedFiles(prev => 
            prev.map(f => 
              f.file === file 
                ? { ...f, progress }
                : f
            )
          );
        }
      }, 200);
    }
  }, [maxSize, isConfigured, detectPotholes]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeFile = useCallback((fileToRemove: File) => {
    setUploadedFiles(prev => {
      const fileToRemoveData = prev.find(f => f.file === fileToRemove);
      if (fileToRemoveData?.processedImageUrl) {
        URL.revokeObjectURL(fileToRemoveData.processedImageUrl);
      }
      return prev.filter(f => f.file !== fileToRemove);
    });
  }, []);

  const toggleImageView = useCallback((file: File) => {
    setUploadedFiles(prev => 
      prev.map(f => 
        f.file === file 
          ? { ...f, showOriginal: !f.showOriginal }
          : f
      )
    );
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="hover:shadow-lg transition-smooth">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-smooth cursor-pointer ${
            isDragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = accept;
            input.multiple = true;
            input.onchange = (e) => {
              const target = e.target as HTMLInputElement;
              handleFileSelect(target.files);
            };
            input.click();
          }}
        >
          <UploadIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground mb-2">
            Drop files here or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            {supportedFormats}
          </p>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="mt-4 space-y-4">
            <h4 className="text-sm font-medium text-foreground">Uploaded Files</h4>
            {uploadedFiles.map((uploadedFile, index) => (
              <div key={index} className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {uploadedFile.file.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(uploadedFile.file.size)}
                    </span>
                    {uploadedFile.status === 'completed' && uploadedFile.processedImageUrl && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6"
                        onClick={() => toggleImageView(uploadedFile.file)}
                        title={uploadedFile.showOriginal ? "Show processed image" : "Show original image"}
                      >
                        {uploadedFile.showOriginal ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </Button>
                    )}
                    {uploadedFile.status === 'completed' ? (
                      <FileCheck className="w-4 h-4 text-green-500" />
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(uploadedFile.file);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {uploadedFile.status === 'uploading' && (
                  <Progress value={uploadedFile.progress} className="h-2" />
                )}
                
                {uploadedFile.status === 'completed' && (uploadedFile.file.type.startsWith('image/') || uploadedFile.file.type.startsWith('video/')) && (
                  <div className="mt-3">
                    {uploadedFile.processedImageUrl ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {uploadedFile.showOriginal ? `Original ${uploadedFile.file.type.startsWith('video/') ? 'Video Frame' : 'Image'}` : "Processed with Roboflow Detection"}
                          </span>
                          {uploadedFile.detections && uploadedFile.detections.length > 0 && (
                            <span className="text-primary font-medium">
                              {uploadedFile.detections.length} potential pothole{uploadedFile.detections.length !== 1 ? 's' : ''} detected
                            </span>
                          )}
                        </div>
                        <img 
                          src={uploadedFile.processedImageUrl}
                          alt="Processed with detections"
                          className="w-full max-w-md mx-auto rounded-md border border-border"
                          style={{ maxHeight: '300px', objectFit: 'contain' }}
                        />
                      </div>
                    ) : (
                      <div className="text-center text-xs text-muted-foreground py-2">
                        {isConfigured ? "Processing for pothole detection..." : "Configure Roboflow model in Settings"}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <video ref={videoRef} style={{ display: 'none' }} />
      </CardContent>
    </Card>
  );
};

export default FileUpload;