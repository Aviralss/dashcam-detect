import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload as UploadIcon, Video, Image } from "lucide-react";

const Upload = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Upload Media</h1>
            <p className="text-muted-foreground">
              Upload dashcam videos or images for pothole detection analysis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Video Upload */}
            <Card className="hover:shadow-lg transition-smooth">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-primary" />
                  Video Upload
                </CardTitle>
                <CardDescription>
                  Upload dashcam videos for batch pothole detection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-smooth cursor-pointer">
                  <UploadIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drop video files here or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports MP4, AVI, MOV (max 500MB)
                  </p>
                </div>
                <Button className="w-full mt-4">
                  Select Video Files
                </Button>
              </CardContent>
            </Card>

            {/* Image Upload */}
            <Card className="hover:shadow-lg transition-smooth">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5 text-primary" />
                  Image Upload
                </CardTitle>
                <CardDescription>
                  Upload road images for single-frame analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-smooth cursor-pointer">
                  <UploadIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drop image files here or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports JPG, PNG, WEBP (max 50MB)
                  </p>
                </div>
                <Button className="w-full mt-4">
                  Select Image Files
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Uploads */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Recent Uploads</CardTitle>
              <CardDescription>
                Your recent upload history and processing status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">No recent uploads</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload your first video or image to get started
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Upload;