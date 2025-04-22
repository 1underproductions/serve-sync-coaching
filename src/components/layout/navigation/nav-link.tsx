
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  name: string;
  path: string;
  icon: LucideIcon;
  isActive: boolean;
}

export const NavLink = ({ name, path, icon: Icon, isActive }: NavLinkProps) => {
  return (
    <Link
      to={path}
      className={cn(
        "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
        isActive 
          ? "bg-tennis-green-50 text-tennis-green-700 font-medium" 
          : "text-gray-700 hover:bg-gray-100"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{name}</span>
    </Link>
  );
};
