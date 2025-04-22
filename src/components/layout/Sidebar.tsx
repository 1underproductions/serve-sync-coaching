
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/useAuth";
import { navItems, adminNavItems } from "./navigation/nav-items";
import { NavLink } from "./navigation/nav-link";
import { BrandLogo } from "./navigation/brand-logo";
import { LogoutButton } from "./navigation/logout-button";

const Sidebar = () => {
  const location = useLocation();
  const { toast } = useToast();
  const { signOut, isAdmin } = useAuth();
  const currentPath = location.pathname;
  
  const handleLogout = async () => {
    try {
      await signOut();
      // Toast and navigation are handled in the signOut function
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="hidden md:flex flex-col h-screen border-r bg-white w-[240px] shrink-0">
      <BrandLogo isAdmin={isAdmin} />
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {!isAdmin && navItems.map((item) => {
          const isActive = currentPath === item.path || 
            (item.path !== "/dashboard" && currentPath.startsWith(item.path));
            
          return (
            <NavLink
              key={item.name}
              {...item}
              isActive={isActive}
            />
          );
        })}
        
        {isAdmin && adminNavItems.map((item) => {
          const isActive = currentPath === item.path || 
            (item.path !== "/admin" && currentPath.startsWith(item.path));
            
          return (
            <NavLink
              key={item.name}
              {...item}
              isActive={isActive}
            />
          );
        })}

        <LogoutButton onLogout={handleLogout} />
      </nav>
    </div>
  );
};

export default Sidebar;
