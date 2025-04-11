
import { PackageData } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

type PackageListProps = {
  packages: PackageData[];
  onEdit: (packageId: string) => void;
  onDelete: (packageId: string) => void;
};

export const PackageList = ({ packages, onEdit, onDelete }: PackageListProps) => {
  if (packages.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg bg-muted/20">
        <Package className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
        <h3 className="font-medium mb-1">No packages yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Create your first package below to offer discounts for multiple sessions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Your Package Offerings</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {packages.map((pkg) => (
          <div 
            key={pkg.id} 
            className="border rounded-lg p-4 relative hover:border-tennis-green-500 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{pkg.name}</h4>
                <p className="text-sm text-muted-foreground">{pkg.sessions} sessions</p>
                {pkg.description && (
                  <p className="text-sm mt-1">{pkg.description}</p>
                )}
              </div>
              {pkg.discount > 0 && (
                <Badge variant="custom" className="bg-tennis-blue-100 text-tennis-blue-800">
                  {pkg.discount}% off
                </Badge>
              )}
            </div>
            
            <div className="mt-2 flex items-baseline">
              <span className="text-xl font-bold text-tennis-green-700">${pkg.price}</span>
              <span className="text-sm text-muted-foreground ml-1">total</span>
            </div>
            
            <div className="flex gap-2 mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onEdit(pkg.id)}
                className="text-xs"
              >
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onDelete(pkg.id)}
                className="text-xs text-destructive hover:text-destructive"
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
