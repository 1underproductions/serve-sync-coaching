
import { DollarSign, Package } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { HourlyRateForm } from "./HourlyRateForm";
import { PackageList } from "./PackageList";
import { PackageForm } from "./PackageForm";
import { usePackages } from "@/hooks/usePackages";

const PackageSettings = () => {
  const { profile } = useAuth();
  const hourlyRate = profile?.hourly_rate || 0;
  
  const {
    packages,
    isLoading,
    editingPackage,
    setEditingPackage,
    handleSubmit,
    editPackage,
    deletePackage
  } = usePackages(hourlyRate);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="mr-2 h-5 w-5 text-tennis-green-600" />
          <span>Pricing Information</span>
        </CardTitle>
        <CardDescription>
          Set your hourly rate and create package offerings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <HourlyRateForm />

        <div className="space-y-4">
          <PackageList 
            packages={packages}
            isLoading={isLoading}
            onEdit={editPackage} 
            onDelete={deletePackage} 
          />
          
          <PackageForm 
            editingPackage={editingPackage}
            setEditingPackage={setEditingPackage}
            onSubmit={handleSubmit}
            packages={packages}
            hourlyRate={hourlyRate}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PackageSettings;
