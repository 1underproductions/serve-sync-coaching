
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  onLogout: () => void;
}

export const LogoutButton = ({ onLogout }: LogoutButtonProps) => {
  return (
    <div className="mt-6 pt-6 border-t">
      <button 
        onClick={onLogout}
        className="flex w-full items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <LogOut className="h-5 w-5" />
        <span>Logout</span>
      </button>
    </div>
  );
};
