
import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsOverviewProps {
  totalSignups: number;
}

export const StatsOverview = ({ totalSignups }: StatsOverviewProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="bg-violet-100 p-3 rounded-full">
            <Users className="h-6 w-6 text-violet-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Signups</p>
            <p className="text-2xl font-bold">{totalSignups}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
