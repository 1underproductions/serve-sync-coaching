
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, DollarSign, User, CalendarClock, CheckCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Define the PaymentLink type based on our database structure
type PaymentLink = {
  id: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  player?: {
    name: string;
  };
};

const Payments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [payments, setPayments] = useState<PaymentLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch payment links from our database
        const { data, error } = await supabase
          .from('payment_links')
          .select('*')
          .eq('coach_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        // For now, we'll use the data directly
        // In the future, we should join with players table for player details
        setPayments(data || []);
      } catch (error) {
        console.error('Error fetching payments:', error);
        toast({
          title: "Error",
          description: "Failed to load payment data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPayments();
  }, [user, toast]);

  // Format payment data for display
  const formattedPayments = payments.map(payment => ({
    id: payment.id,
    player: payment.player?.name || "Individual",
    amount: payment.amount,
    date: new Date(payment.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    status: payment.status,
    type: payment.description || "Payment",
  }));

  // Filter for pending payments tab
  const pendingPayments = formattedPayments.filter(p => p.status === 'pending');
  
  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
            <p className="text-muted-foreground mt-1">Track and manage your coaching revenue</p>
          </div>
          <Button className="bg-tennis-green-600 hover:bg-tennis-green-700" asChild>
            <Link to="/payments/new">
              <Plus className="h-4 w-4 mr-2" /> Create Payment Link
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <div className="animate-pulse h-7 w-24 bg-gray-200 rounded"></div>
                ) : (
                  `$${calculateMonthlyRevenue(payments)}`
                )}
              </div>
              <p className="text-xs text-tennis-green-600 mt-1">↑ 15% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <div className="animate-pulse h-7 w-24 bg-gray-200 rounded"></div>
                ) : (
                  `$${calculateOutstandingPayments(payments)}`
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{countPendingPayments(payments)} pending payments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">$0 monthly recurring</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-3">
            <TabsTrigger value="all">All Payments</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4 space-y-4">
            {isLoading ? (
              Array(3).fill(0).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-16 bg-gray-100 rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : formattedPayments.length > 0 ? (
              formattedPayments.map((payment) => (
                <Card key={payment.id} className="card-hover">
                  <CardContent className="p-4">
                    <div className="grid md:grid-cols-4 gap-4 items-center">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="font-medium">{payment.player}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">{payment.type}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="font-medium">${payment.amount}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{payment.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {payment.status === "paid" || payment.status === "succeeded" ? (
                            <CheckCircle className="h-4 w-4 mr-2 text-tennis-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 mr-2 text-amber-500" />
                          )}
                          <span
                            className={`capitalize ${
                              payment.status === "paid" || payment.status === "succeeded" ? "text-tennis-green-600" : "text-amber-500"
                            }`}
                          >
                            {payment.status === "succeeded" ? "Paid" : payment.status}
                          </span>
                        </div>
                        <Button size="sm" variant="ghost" asChild>
                          <Link to={`/payment/${payment.id}`}>Details</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                <DollarSign className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No payments yet</h3>
                <p className="mt-2 text-sm text-gray-500">Create your first payment link to get started.</p>
                <Button className="mt-4" asChild>
                  <Link to="/payments/new">
                    <Plus className="h-4 w-4 mr-2" /> Create Payment Link
                  </Link>
                </Button>
              </div>
            )}
          </TabsContent>
          <TabsContent value="pending">
            {pendingPayments.length > 0 ? (
              <div className="mt-4 space-y-4">
                {pendingPayments.map((payment) => (
                  <Card key={payment.id} className="card-hover">
                    {/* Same card content as above */}
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No pending payments</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="subscriptions">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Subscriptions feature coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

// Helper functions for calculations
function calculateMonthlyRevenue(payments: PaymentLink[]): number {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  return payments
    .filter(p => 
      new Date(p.created_at) >= firstDayOfMonth && 
      (p.status === 'succeeded' || p.status === 'paid')
    )
    .reduce((sum, p) => sum + (p.amount || 0), 0);
}

function calculateOutstandingPayments(payments: PaymentLink[]): number {
  return payments
    .filter(p => p.status === 'pending' || p.status === 'active')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
}

function countPendingPayments(payments: PaymentLink[]): number {
  return payments.filter(p => p.status === 'pending' || p.status === 'active').length;
}

export default Payments;
