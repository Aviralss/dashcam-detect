import Navigation from "@/components/Navigation";
import LiveCameraFeed from "@/components/LiveCameraFeed";
import { useNotifications } from "@/hooks/useNotifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Clock, AlertTriangle } from "lucide-react";

const LiveCamera = () => {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Live Camera</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Real-time pothole detection from vehicle dashcam</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            {/* Main Camera Feed */}
            <div className="xl:col-span-2">
              <LiveCameraFeed />
            </div>

            {/* Sidebar with Alerts */}
            <div className="space-y-4 sm:space-y-6">
              {/* Recent Detections */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Recent Detections
                    </CardTitle>
                    {unreadCount > 0 && (
                      <Badge variant="destructive">{unreadCount}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] sm:h-[400px]">
                    <div className="space-y-3">
                      {notifications.slice(0, 20).map((notification) => (
                        <div key={notification.id} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                                  notification.type === 'detection' ? 'text-orange-500' :
                                  notification.type === 'repair' ? 'text-green-500' : 'text-red-500'
                                }`} />
                                <div>
                                  <p className="text-sm font-medium">{notification.message}</p>
                                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {new Date(notification.created_at).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <Badge variant={
                              notification.type === 'detection' ? 'default' : 
                              notification.type === 'repair' ? 'secondary' : 'destructive'
                            } className="ml-2 text-xs">
                              {notification.type}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  {unreadCount > 0 && (
                    <Button size="sm" variant="outline" onClick={markAllAsRead} className="w-full mt-4">
                      Mark All as Read
                    </Button>
                  )}
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