
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WaitlistSignup } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export const useWaitlistData = () => {
  const [waitlistSignups, setWaitlistSignups] = useState<WaitlistSignup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { toast } = useToast();

  const fetchWaitlist = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setDebugInfo(null);
      
      console.log("Fetching waitlist data...");
      
      // Use the admin_access_waitlist RPC function to avoid RLS recursion issues
      const { data, error } = await supabase.rpc('admin_access_waitlist');
        
      if (error) {
        console.error("Error fetching waitlist:", error);
        setError(`Failed to fetch waitlist data: ${error.message}`);
        setDebugInfo({ type: 'fetch_error', error });
        toast({
          title: "Error fetching waitlist data",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      if (!data) {
        setError("No data returned from the database");
        setDebugInfo({ type: 'no_data_error' });
        setWaitlistSignups([]);
        return;
      }
      
      console.log("Waitlist data fetched:", data.length, "entries");
      setWaitlistSignups(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Exception during waitlist fetch:", error);
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
  }, [toast]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWaitlist();
  }, [fetchWaitlist]);

  return {
    waitlistSignups,
    isLoading,
    refreshing,
    error,
    debugInfo,
    fetchWaitlist,
    handleRefresh,
  };
};
