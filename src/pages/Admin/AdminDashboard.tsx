
import { useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Info, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/useAuth";
import { StatsOverview } from "@/components/admin/dashboard/StatsOverview";
import { WaitlistTab } from "@/components/admin/dashboard/WaitlistTab";
import { PlatformOverviewTab } from "@/components/admin/dashboard/PlatformOverviewTab";
import { useWaitlistData } from "@/hooks/useWaitlistData";

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const {
    waitlistSignups,
    isLoading,
    refreshing,
    error,
    debugInfo,
    fetchWaitlist,
    handleRefresh,
  } = useWaitlistData();

  useEffect(() => {
    if (isAdmin) {
      fetchWaitlist();
      const refreshInterval = setInterval(() => {
        fetchWaitlist();
      }, 30000);
      return () => {
        clearInterval(refreshInterval);
      };
    }
  }, [isAdmin, fetchWaitlist]);

  return (
    <AdminLayout 
      title="Admin Dashboard"
      description="System administration for Tennexis platform"
    >
      <Alert className="mb-6 bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle>Admin Control Panel</AlertTitle>
        <AlertDescription>
          Waitlist signups collected below. You can export coach signups as CSV for import into another tool (e.g., Mailgun or Mailchimp) to send emails in bulk.
        </AlertDescription>
      </Alert>
      
      <StatsOverview totalSignups={waitlistSignups.length} />
      
      <Tabs defaultValue="waitlist" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="waitlist">Coach Waitlist</TabsTrigger>
            <TabsTrigger value="platform">Platform Overview</TabsTrigger>
          </TabsList>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <TabsContent value="waitlist">
          <WaitlistTab
            isLoading={isLoading}
            error={error}
            waitlistSignups={waitlistSignups}
            debugInfo={debugInfo}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />
        </TabsContent>
        <TabsContent value="platform">
          <PlatformOverviewTab />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminDashboard;
