import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, CheckCircle, MapPin, Bell } from "lucide-react";
import { usePotholes } from "@/hooks/usePotholes";
import { useNotifications } from "@/hooks/useNotifications";

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'high':
      return 'border-l-severity-high';
    case 'medium':
      return 'border-l-severity-medium';
    case 'low':
      return 'border-l-severity-low';
    default:
      return 'border-l-muted';
  }
};

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case 'high':
      return <Badge variant="destructive" className="text-xs">High</Badge>;
    case 'medium':
      return <Badge className="bg-warning text-warning-foreground text-xs">Medium</Badge>;
    case 'low':
      return <Badge className="bg-success text-success-foreground text-xs">Low</Badge>;
    default:
      return <Badge variant="secondary" className="text-xs">Unknown</Badge>;
  }
};

const PotholeSidebar = () => {
  const { potholes, updatePothole } = usePotholes();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();

  const handleMarkRepaired = async (id: string) => {
    try {
      await updatePothole(id, { status: 'repaired' });
    } catch (error) {
      console.error('Error marking pothole as repaired:', error);
    }
  };

  return (
    <div className="w-80 bg-sidebar border-l border-sidebar-border h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-lg font-semibold text-sidebar-foreground mb-2">Recent Detections</h2>
        <p className="text-sm text-sidebar-foreground/70">
          {potholes.length} potholes detected
        </p>
      </div>

      {/* Pothole Reports */}
      <ScrollArea className="flex-1 custom-scrollbar">
        <div className="p-4 space-y-3">
          {potholes.slice(0, 10).map((pothole) => (
            <Card 
              key={pothole.id} 
              className={`bg-sidebar-accent border-l-4 ${getSeverityColor(pothole.severity)} hover:bg-sidebar-accent/80 transition-smooth cursor-pointer`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sidebar-accent-foreground text-sm">
                    {pothole.title}
                  </h3>
                  <div className="flex items-center gap-1">
                    {getSeverityBadge(pothole.severity)}
                  </div>
                </div>
                
                <p className="text-sm text-sidebar-foreground/70 mb-3">
                  {pothole.description}
                </p>
                
                <div className="flex items-center gap-2 mb-3 text-xs text-sidebar-foreground/60">
                  <MapPin className="w-3 h-3" />
                  <span>{pothole.latitude.toFixed(4)}, {pothole.longitude.toFixed(4)}</span>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-xs flex-1">
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  {pothole.status !== 'repaired' ? (
                    <Button 
                      size="sm" 
                      className="text-xs flex-1"
                      onClick={() => handleMarkRepaired(pothole.id)}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Mark Repaired
                    </Button>
                  ) : (
                    <div className="text-xs text-success flex items-center justify-center flex-1">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Repaired
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Notifications Section */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sidebar-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <Badge className="bg-primary text-primary-foreground text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground"
              onClick={markAllAsRead}
            >
              Clear All
            </Button>
          )}
        </div>
        
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {notifications.slice(0, 5).map((notification) => (
            <div 
              key={notification.id}
              className="flex items-start gap-2 p-2 bg-sidebar-accent/50 rounded-md"
            >
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notification.read ? 'bg-muted' : 'bg-primary'}`} />
              <div>
                <p className="text-xs text-sidebar-foreground/80">
                  {notification.message}
                </p>
                <p className="text-xs text-sidebar-foreground/50">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </div>
              <Bell className="w-3 h-3 text-muted-foreground flex-shrink-0 mt-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PotholeSidebar;