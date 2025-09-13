import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Play, Square, Settings, AlertTriangle } from "lucide-react";

const LiveCamera = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Live Camera Feed</h1>
            <p className="text-muted-foreground">
              Real-time pothole detection from connected dashcam devices
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Video Feed */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Video className="w-5 h-5 text-primary" />
                      Camera Feed #1
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-success text-success-foreground">Live</Badge>
                      <Button variant="ghost" size="icon">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    Main dashcam - Vehicle ID: VH001
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-card rounded-lg border border-border flex items-center justify-center">
                    <div className="text-center">
                      <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">Camera feed will appear here</p>
                      <div className="flex gap-2 justify-center">
                        <Button>
                          <Play className="w-4 h-4 mr-2" />
                          Start Feed
                        </Button>
                        <Button variant="outline">
                          <Square className="w-4 h-4 mr-2" />
                          Stop
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detection Panel */}
            <div className="space-y-6">
              {/* Real-time Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detection Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Potholes Today</span>
                    <Badge variant="secondary">3</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">High Severity</span>
                    <Badge className="bg-severity-high text-white">1</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Processing FPS</span>
                    <Badge variant="outline">24 fps</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Detection Accuracy</span>
                    <Badge className="bg-success text-success-foreground">94.2%</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Detections */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Detections</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-severity-high/10 rounded-lg border border-severity-high/20">
                    <AlertTriangle className="w-4 h-4 text-severity-high mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Large pothole detected</p>
                      <p className="text-xs text-muted-foreground">2 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-severity-medium/10 rounded-lg border border-severity-medium/20">
                    <AlertTriangle className="w-4 h-4 text-severity-medium mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Medium pothole detected</p>
                      <p className="text-xs text-muted-foreground">5 minutes ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Camera Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Camera Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Detection Sensitivity
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Video className="w-4 h-4 mr-2" />
                    Video Quality
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Alert Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LiveCamera;