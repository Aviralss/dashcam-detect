import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Menu,
  MapPin, 
  Upload, 
  Video, 
  FileText, 
  Settings, 
  Bell,
  User,
  LogOut,
} from "lucide-react";

const MobileNavigation = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const navItems = [
    { label: "Dashboard", path: "/" },
    { label: "Upload", path: "/upload", icon: Upload },
    { label: "Live Camera", path: "/live-camera", icon: Video },
    { label: "Reports", path: "/reports", icon: FileText },
    { label: "Settings", path: "/settings", icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
  };

  const userDisplayName = user?.user_metadata?.display_name || user?.email || 'User';

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 mb-8" 
            onClick={() => setOpen(false)}
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">PotholeTracker</h1>
          </Link>

          {/* Navigation Items */}
          <div className="flex-1 space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.label}
                variant={location.pathname === item.path ? "default" : "ghost"}
                className="w-full justify-start"
                asChild
                onClick={() => setOpen(false)}
              >
                <Link to={item.path}>
                  {item.icon && <item.icon className="w-4 h-4 mr-3" />}
                  {item.label}
                </Link>
              </Button>
            ))}
          </div>

          {/* User Section */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground">{userDisplayName}</span>
            </div>
            
            <Button variant="ghost" className="w-full justify-start">
              <Bell className="w-4 h-4 mr-3" />
              Notifications
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavigation;