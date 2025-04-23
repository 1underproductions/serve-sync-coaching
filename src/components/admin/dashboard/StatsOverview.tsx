
import { Users, Calendar, CreditCard, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsOverviewProps {
  totalSignups: number;
  stats?: {
    pendingVerifications?: number;
    activeCoaches?: number;
    totalRevenue?: string;
  };
}

export const StatsOverview = ({ totalSignups, stats = {} }: StatsOverviewProps) => {
  const { pendingVerifications = 3, activeCoaches = 18, totalRevenue = "$8,245" } = stats;
  
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
      
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pending Verifications</p>
            <p className="text-2xl font-bold">{pendingVerifications}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-full">
            <Calendar className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active Coaches</p>
            <p className="text-2xl font-bold">{activeCoaches}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="bg-amber-100 p-3 rounded-full">
            <CreditCard className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold">{totalRevenue}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
