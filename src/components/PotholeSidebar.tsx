import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Eye, CheckCircle, MapPin, Clock } from "lucide-react";

// Sample pothole data
const potholeReports = [
  {
    id: 1,
    title: "Pothole #1",
    description: "Large pothole on main road",
    severity: "high",
    timestamp: "1d ago",
    location: "Main Street, Downtown",
    coordinates: { lat: 28.6129, lng: 77.2295 }
  },
  {
    id: 2,
    title: "Pothole #2", 
    description: "Medium pothole detected via live camera",
    severity: "medium",
    timestamp: "1d ago",
    location: "Oak Avenue, Midtown",
    coordinates: { lat: 28.6139, lng: 77.2085 }
  },
  {
    id: 3,
    title: "Pothole #3",
    description: "Small pothole on side street",
    severity: "low",
    timestamp: "1d ago",
    location: "Pine Street, Residential",
    coordinates: { lat: 28.6149, lng: 77.2195 }
  }
];

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
  return (
    <div className="w-80 bg-sidebar border-l border-sidebar-border h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-lg font-semibold text-sidebar-foreground mb-2">Recent Detections</h2>
        <p className="text-sm text-sidebar-foreground/70">
          {potholeReports.length} potholes detected today
        </p>
      </div>

      {/* Pothole Reports */}
      <ScrollArea className="flex-1 custom-scrollbar">
        <div className="p-4 space-y-3">
          {potholeReports.map((pothole) => (
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
                    <span className="text-xs text-sidebar-foreground/50 ml-2">
                      {pothole.timestamp}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-sidebar-foreground/70 mb-3">
                  {pothole.description}
                </p>
                
                <div className="flex items-center gap-2 mb-3 text-xs text-sidebar-foreground/60">
                  <MapPin className="w-3 h-3" />
                  <span>{pothole.location}</span>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-xs flex-1">
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <Button size="sm" className="text-xs flex-1">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Mark Repaired
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Notifications Section */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sidebar-foreground">Notifications</h3>
          <Button variant="ghost" size="sm" className="text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground">
            Clear All
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-start gap-2 p-2 bg-sidebar-accent/50 rounded-md">
            <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
            <div>
              <p className="text-xs text-sidebar-foreground/80">
                New pothole detected on Main Street
              </p>
              <p className="text-xs text-sidebar-foreground/50">2 minutes ago</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2 p-2 bg-sidebar-accent/50 rounded-md">
            <div className="w-2 h-2 bg-warning rounded-full mt-1.5 flex-shrink-0"></div>
            <div>
              <p className="text-xs text-sidebar-foreground/80">
                Authority notified about Pine Street pothole
              </p>
              <p className="text-xs text-sidebar-foreground/50">5 minutes ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PotholeSidebar;