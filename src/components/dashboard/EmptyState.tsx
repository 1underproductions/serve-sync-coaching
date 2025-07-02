
import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <Card className="flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
      <CardContent className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-full w-fit mx-auto text-gray-400">
          {icon}
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 max-w-sm">{description}</p>
        </div>
        {action && <div className="pt-2">{action}</div>}
      </CardContent>
    </Card>
  );
};

export default EmptyState;
