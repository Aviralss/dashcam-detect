import Navigation from "@/components/Navigation";
import FileUpload from "@/components/FileUpload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Image } from "lucide-react";

const Upload = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Upload Media</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Upload dashcam videos or images for pothole detection analysis
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Video Upload */}
            <FileUpload
              accept="video/*"
              maxSize={500 * 1024 * 1024} // 500MB
              title="Video Upload"
              description="Upload dashcam videos for batch pothole detection"
              icon={Video}
              supportedFormats="Supports MP4, AVI, MOV (max 500MB)"
            />

            {/* Image Upload */}
            <FileUpload
              accept="image/*"
              maxSize={50 * 1024 * 1024} // 50MB
              title="Image Upload"
              description="Upload road images for single-frame analysis"
              icon={Image}
              supportedFormats="Supports JPG, PNG, WEBP (max 50MB)"
            />
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