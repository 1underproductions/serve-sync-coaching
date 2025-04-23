
import { RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import WaitlistTable from "@/components/admin/WaitlistTable";
import { WaitlistSignup } from "@/lib/supabase";

interface WaitlistTabProps {
  isLoading: boolean;
  error: string | null;
  waitlistSignups: WaitlistSignup[];
  debugInfo: any;
  onRefresh: () => void;
  refreshing: boolean;
}

export const WaitlistTab = ({
  isLoading,
  error,
  waitlistSignups,
  debugInfo,
  onRefresh,
  refreshing,
}: WaitlistTabProps) => {
  return (
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
              <Button variant="outline" onClick={onRefresh} size="sm">
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
  );
};
