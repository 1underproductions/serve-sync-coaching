
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import WaitlistTable from "@/components/admin/WaitlistTable";
import { supabase } from "@/integrations/supabase/client";
import { WaitlistSignup } from "@/lib/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Users, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const [waitlistSignups, setWaitlistSignups] = useState<WaitlistSignup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { toast } = useToast();

  const fetchWaitlist = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setDebugInfo(null);
      const { data, error } = await supabase
        .from('waitlist_signups')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        setError(`Failed to fetch waitlist data: ${error.message}`);
        setDebugInfo({ type: 'fetch_error', error });
        toast({
          title: "Error fetching waitlist data",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        setRefreshing(false);
        return;
      }
      if (!data) {
        setError("No data returned from the database");
        setDebugInfo({ type: 'no_data_error' });
        setWaitlistSignups([]);
        setIsLoading(false);
        setRefreshing(false);
        return;
      }
      if (Array.isArray(data)) {
        setWaitlistSignups(data);
      } else {
        setWaitlistSignups([]);
      }
    } catch (error: any) {
      setError(`Failed to fetch waitlist data: ${error.message}`);
      setDebugInfo({ type: 'exception_error', error });
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
    setRefreshing(true);
    fetchWaitlist();
  };

  useEffect(() => {
    fetchWaitlist();
    const refreshInterval = setInterval(() => {
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
          Waitlist signups collected below. You can export coach signups as CSV for import into another tool (e.g., Mailgun or Mailchimp) to send emails in bulk.
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
              <p className="text-2xl font-bold">
                {waitlistSignups.length}
              </p>
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
                List of all coach signups. Use Export CSV above to import into Mailgun/Mailchimp or send emails.
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
                <WaitlistTable signups={waitlistSignups} />
              )}
              {debugInfo && (
                <div className="mt-6 p-4 bg-gray-100 rounded-md text-xs overflow-auto max-h-40">
                  <p className="font-bold mb-1">Debug Info:</p>
                  <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                </div>
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
