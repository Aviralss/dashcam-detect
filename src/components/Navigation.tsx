import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "react-router-dom";
import { 
  MapPin, 
  Upload, 
  Video, 
  FileText, 
  Settings, 
  Bell,
  User
} from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { label: "Dashboard", path: "/" },
    { label: "Upload", path: "/upload", icon: Upload },
    { label: "Live Camera", path: "/live-camera", icon: Video },
    { label: "Reports", path: "/reports", icon: FileText },
    { label: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <nav className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-smooth">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">PotholeTracker</h1>
        </Link>

        {/* Navigation Items */}
        <div className="flex items-center gap-2">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant={location.pathname === item.path ? "default" : "ghost"}
              className="relative"
              asChild
            >
              <Link to={item.path}>
                {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                {item.label}
              </Link>
            </Button>
          ))}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              3
            </Badge>
          </Button>
          
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback className="bg-primary text-primary-foreground">
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground">Admin</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;