import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Database, 
  Camera,
  MapPin,
  Zap
} from "lucide-react";

const Settings = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
            <p className="text-muted-foreground">
              Configure your PotholeTracker system preferences
            </p>
          </div>

          <div className="space-y-6">
            {/* Detection Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Detection Settings
                </CardTitle>
                <CardDescription>
                  Configure AI model parameters and detection sensitivity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="sensitivity">Detection Sensitivity</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sensitivity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (High Precision)</SelectItem>
                        <SelectItem value="medium">Medium (Balanced)</SelectItem>
                        <SelectItem value="high">High (High Recall)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confidence">Confidence Threshold</Label>
                    <Input 
                      id="confidence"
                      type="number" 
                      placeholder="0.75"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Real-time Processing</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable continuous analysis of live feeds
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-report High Severity</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically notify authorities for severe potholes
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Camera Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary" />
                  Camera Configuration
                </CardTitle>
                <CardDescription>
                  Manage connected dashcam devices and video settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="resolution">Video Resolution</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select resolution" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="720p">720p (Faster Processing)</SelectItem>
                        <SelectItem value="1080p">1080p (Balanced)</SelectItem>
                        <SelectItem value="4k">4K (Best Quality)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="framerate">Frame Rate</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frame rate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 FPS</SelectItem>
                        <SelectItem value="24">24 FPS</SelectItem>
                        <SelectItem value="30">30 FPS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Record Detection Events</Label>
                    <p className="text-sm text-muted-foreground">
                      Save video clips when potholes are detected
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Configure alert preferences and notification channels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Notifications</Label>
                    <Input 
                      id="email"
                      type="email" 
                      placeholder="admin@example.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="webhook">Webhook URL</Label>
                    <Input 
                      id="webhook"
                      placeholder="https://api.example.com/webhooks"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email notifications for new detections
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Browser push notifications for critical alerts
                      </p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMS Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Text message alerts for high severity potholes
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Database Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  Data Management
                </CardTitle>
                <CardDescription>
                  Configure data storage and retention policies  
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="retention">Data Retention (days)</Label>
                    <Input 
                      id="retention"
                      type="number" 
                      placeholder="365"
                      min="30"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="backup">Backup Frequency</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-delete Resolved Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically delete resolved pothole reports after retention period
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            {/* Authority Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Authority Integration
                </CardTitle>
                <CardDescription>
                  Configure automatic reporting to local authorities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="authority-email">Authority Contact Email</Label>
                  <Input 
                    id="authority-email"
                    type="email" 
                    placeholder="roads@city.gov"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="authority-api">Authority API Endpoint</Label>
                  <Input 
                    id="authority-api"
                    placeholder="https://api.cityroads.gov/reports"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-report to Authorities</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically send reports to configured authorities
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Save Settings */}
            <div className="flex justify-end">
              <Button size="lg">
                <SettingsIcon className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;