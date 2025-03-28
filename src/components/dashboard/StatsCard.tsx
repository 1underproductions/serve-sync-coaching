
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: string | number;
    positive?: boolean;
  };
  className?: string;
}

const StatsCard = ({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: StatsCardProps) => {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="p-2 bg-tennis-green-50 rounded-full text-tennis-green-700">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <CardDescription className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {trend && (
              <span className={trend.positive ? "text-green-600" : "text-red-600"}>
                {trend.positive ? "↑" : "↓"} {trend.value}
              </span>
            )}
            {description}
          </CardDescription>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
