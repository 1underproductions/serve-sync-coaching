import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  CalendarClock, 
  Users, 
  DollarSign, 
  User, 
  Menu,
  Bell,
  Search,
  LogOut,
  Home,
  BarChart,
  Settings,
  X,
  HelpCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: Home },
  { name: "Schedule", path: "/schedule", icon: CalendarClock },
  { name: "Players", path: "/players", icon: Users },
  { name: "Payments", path: "/payments", icon: DollarSign },
  { name: "Analytics", path: "/analytics", icon: BarChart },
  { name: "Settings", path: "/settings", icon: Settings },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, profile, isLoading } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      await signOut();
      // Navigation and toast handled in the signOut function
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getInitials = () => {
    if (!profile?.full_name) return "U";
    return profile.full_name
      .split(" ")
      .map(name => name[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-white">
      <div className="container flex h-16 items-center justify-between px-4">
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="p-2 rounded-md hover:bg-gray-100">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-[80vh]">
            <div className="p-4 border-b flex items-center justify-between">
              <Link to="/dashboard" className="flex items-center" onClick={() => setIsDrawerOpen(false)}>
                <span className="text-xl font-bold text-tennis-green-600">Tennexis</span>
              </Link>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-5 w-5" />
                </Button>
              </DrawerClose>
            </div>
            <div className="p-4 space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || 
                  (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
                  
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-3 rounded-md transition-colors w-full",
                      isActive 
                        ? "bg-tennis-green-50 text-tennis-green-700 font-medium" 
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              <div className="pt-4 mt-4 border-t">
                <button 
                  onClick={() => {
                    setIsDrawerOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center space-x-3 px-3 py-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
        
        <div className="md:hidden flex-1 flex justify-center">
          <Link to="/dashboard" className="flex items-center">
            <span className="text-xl font-bold text-tennis-green-600">Tennexis</span>
          </Link>
        </div>
        
        <div className="hidden md:flex flex-1 max-w-md relative">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search players, sessions..." 
              className="w-full pl-10 py-2 pr-4 rounded-md border border-input bg-transparent text-sm" 
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
              3
            </span>
          </Button>
          
          <Link to="/helpdesk">
            <Button variant="ghost" size="icon">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </Link>
          
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 bg-tennis-green-100">
                <span className="font-medium text-tennis-green-800">{getInitials()}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{profile?.full_name || 'User'}</DropdownMenuLabel>
              <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
                {profile?.email || 'Loading...'}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/helpdesk" className="cursor-pointer">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Helpdesk</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
