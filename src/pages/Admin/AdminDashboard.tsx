import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import WaitlistTable from "@/components/admin/WaitlistTable";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Users, Shield, Calendar, CheckCircle, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const [waitlistSignups, setWaitlistSignups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    waitlistCount: 0,
    pendingCount: 0,
    contactedCount: 0,
    rejectedCount: 0
  });
  const { toast } = useToast();

  const fetchWaitlist = async () => {
    try {
      console.log("Fetching waitlist data...");
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('waitlist_signups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching waitlist data:", error);
        setError(`Error fetching waitlist data: ${error.message}`);
        toast({
          title: "Error fetching waitlist data",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
        
      console.log("Waitlist data fetched:", data);
      
      if (data) {
        setWaitlistSignups(data);
        
        const pendingCount = data.filter(item => item.status === 'pending').length;
        const contactedCount = data.filter(item => item.status === 'contacted').length;
        const rejectedCount = data.filter(item => item.status === 'rejected').length;
        
        setStats({
          waitlistCount: data.length,
          pendingCount,
          contactedCount,
          rejectedCount
        });
      }
    } catch (error: any) {
      console.error("Error in fetchWaitlist:", error);
      setError(`Failed to fetch waitlist data: ${error.message}`);
      toast({
        title: "Something went wrong",
        description: "Could not fetch waitlist data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    console.log("Manual refresh triggered");
    setRefreshing(true);
    fetchWaitlist();
  };

  useEffect(() => {
    console.log("AdminDashboard mounted, fetching waitlist...");
    fetchWaitlist();
    
    const refreshInterval = setInterval(() => {
      console.log("Auto-refresh triggered");
      fetchWaitlist();
    }, 30000);
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  return (
    <AdminLayout 
      title="Admin Dashboard"
      description="System administration for Tennexis platform"
    >
      <Alert className="mb-6 bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle>Admin Control Panel</AlertTitle>
        <AlertDescription>
          Welcome to the Tennexis admin panel. Here you can manage waitlist signups, users, and platform settings.
        </AlertDescription>
      </Alert>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-violet-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Signups</p>
              <p className="text-2xl font-bold">{stats.waitlistCount}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-yellow-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{stats.pendingCount}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contacted</p>
              <p className="text-2xl font-bold">{stats.contactedCount}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-full">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="text-2xl font-bold">{stats.rejectedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
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
          <Card>
            <CardHeader>
              <CardTitle>Coach Waitlist Signups</CardTitle>
              <CardDescription>
                Manage coach applications who signed up through the waitlist form
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-tennis-green-600 mb-2"></div>
                  <div>Loading waitlist data...</div>
                </div>
              ) : error ? (
                <Alert variant="destructive" className="mb-4">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : waitlistSignups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No waitlist signups found yet. Coaches will appear here when they sign up.
                  <div className="mt-4">
                    <Button variant="outline" onClick={handleRefresh} size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Check Again
                    </Button>
                  </div>
                </div>
              ) : (
                <WaitlistTable 
                  signups={waitlistSignups} 
                  onStatusChange={fetchWaitlist}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="platform">
          <Card>
            <CardHeader>
              <CardTitle>Platform Overview</CardTitle>
              <CardDescription>Summary of platform activity and health</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Platform statistics will be available here in the future.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminDashboard;
