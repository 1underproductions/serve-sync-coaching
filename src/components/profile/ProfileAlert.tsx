
import { Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ProfileAlertProps {
  show: boolean;
}

export const ProfileAlert = ({ show }: ProfileAlertProps) => {
  if (!show) return null;
  
  return (
    <Alert className="bg-blue-50 border-blue-200">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-800">Complete your profile</AlertTitle>
      <AlertDescription className="text-blue-700">
        Welcome to Tennexis! Please take a moment to complete your profile information below. 
        A complete profile helps build trust with your players and increases booking opportunities.
      </AlertDescription>
    </Alert>
  );
};
