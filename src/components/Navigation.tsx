import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MobileNavigation from "@/components/MobileNavigation";
import { 
  MapPin, 
  Upload, 
  Video, 
  FileText, 
  Settings, 
  Bell,
  User,
  LogOut,
  ChevronDown
} from "lucide-react";

const Navigation = () => {
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
  };

  const userDisplayName = user?.user_metadata?.display_name || user?.email || 'User';

  return (
    <nav className="bg-background border-b border-border px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Mobile Menu */}
        <MobileNavigation />

        {/* Logo and Brand */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-smooth">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-foreground">PotholeTracker</h1>
        </Link>

        {/* Desktop Navigation Items */}
        <div className="hidden md:flex items-center gap-2">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant={location.pathname === item.path ? "default" : "ghost"}
              className="relative"
              asChild
            >
              <Link to={item.path}>
                {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            </Button>
          ))}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="icon" className="relative hidden sm:flex">
            <Bell className="w-5 h-5" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              3
            </Badge>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-medium text-foreground">{userDisplayName}</span>
                <ChevronDown className="w-4 h-4 hidden sm:inline" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center gap-2 w-full">
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;