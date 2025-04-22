
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WaitlistTable from "@/components/admin/WaitlistTable";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const [waitlistSignups, setWaitlistSignups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWaitlist = async () => {
      const { data, error } = await supabase
        .from('waitlist_signups')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setWaitlistSignups(data);
      }
      setIsLoading(false);
    };

    fetchWaitlist();
  }, []);

  return (
    <AdminLayout 
      title="Admin Dashboard"
      description="Monitor and manage your platform"
    >
      <Card>
        <CardHeader>
          <CardTitle>Waitlist Signups</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading waitlist data...</div>
          ) : (
            <WaitlistTable signups={waitlistSignups} />
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminDashboard;
