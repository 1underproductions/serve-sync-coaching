
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download, Receipt, CreditCard, Calendar, User, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Payment, Session } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { formatDistance } from "date-fns";

const PaymentDetail = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      setIsLoading(true);
      try {
        // Fetch payment details
        const { data: paymentData, error: paymentError } = await supabase
          .from('payments')
          .select('*')
          .eq('id', paymentId)
          .single();

        if (paymentError) throw paymentError;
        
        setPayment(paymentData);
        
        // If payment has a session_id, fetch that session
        if (paymentData.session_id) {
          const { data: sessionData, error: sessionError } = await supabase
            .from('sessions')
            .select('*')
            .eq('id', paymentData.session_id)
            .single();
            
          if (!sessionError) {
            setSession(sessionData);
          }
        }
      } catch (error) {
        console.error('Error fetching payment:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load payment details",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (paymentId) {
      fetchPaymentDetails();
    }
  }, [paymentId, toast]);

  // For demo purposes, if not in a real Supabase environment
  useEffect(() => {
    if (import.meta.env.DEV && !import.meta.env.VITE_SUPABASE_URL) {
      setPayment({
        id: paymentId || '1',
        user_id: '123',
        amount: 75.00,
        status: 'succeeded',
        payment_method: 'Visa •••• 4242',
        created_at: new Date().toISOString(),
        description: 'Tennis Coaching Session',
        session_id: '456',
        stripe_payment_id: 'pi_3KJN2mCMq7xkXFVY0WkLW3Ua'
      });
      
      setSession({
        id: '456',
        user_id: '123',
        title: 'Advanced Backhand Technique',
        description: 'Focus on improving backhand technique and stance',
        start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week in future
        end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // 1 hour after start
        location: 'Center Court Tennis Club',
        status: 'scheduled',
        price: 75.00,
        players: ['789'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      setIsLoading(false);
    }
  }, [paymentId]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tennis-green-600"></div>
        </div>
      </Layout>
    );
  }

  if (!payment) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-700">Payment not found</h2>
          <p className="mt-2 text-gray-500">The payment you're looking for doesn't exist.</p>
          <Button variant="link" asChild className="mt-4">
            <Link to="/payments">View all payments</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <Link to="/payments" className="flex items-center text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back to payments</span>
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payment #{payment.id.substring(0, 8)}</h1>
            <p className="text-muted-foreground mt-1">
              {payment.created_at && (
                <time dateTime={payment.created_at}>
                  {formatDistance(new Date(payment.created_at), new Date(), { addSuffix: true })}
                </time>
              )}
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 space-x-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download Receipt
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>
                Complete information about this transaction
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount</p>
                  <p className="text-xl font-semibold">${payment.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <div>
                    {payment.status === 'succeeded' && (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Paid</Badge>
                    )}
                    {payment.status === 'pending' && (
                      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>
                    )}
                    {payment.status === 'failed' && (
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Failed</Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Payment Method</p>
                <div className="flex items-center p-3 bg-gray-50 rounded-md">
                  <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                  <span>{payment.payment_method}</span>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Description</p>
                <p>{payment.description}</p>
              </div>
              
              {payment.stripe_payment_id && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Transaction ID</p>
                    <p className="font-mono text-sm">{payment.stripe_payment_id}</p>
                  </div>
                </>
              )}
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Date & Time</p>
                <p>
                  {payment.created_at && new Date(payment.created_at).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          {session && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-tennis-green-600" />
                  Related Session
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-base">{session.title}</h3>
                  {session.description && (
                    <p className="text-sm text-gray-500 mt-1">{session.description}</p>
                  )}
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  <div>
                    {session.start_time && (
                      <time dateTime={session.start_time}>
                        {new Date(session.start_time).toLocaleString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </time>
                    )}
                  </div>
                </div>
                
                {session.location && (
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{session.location}</span>
                  </div>
                )}
                
                {session.players && session.players.length > 0 && (
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="h-4 w-4 mr-2" />
                    <span>{session.players.length} player(s)</span>
                  </div>
                )}
                
                <div className="pt-2">
                  <Badge className={
                    session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    session.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                  </Badge>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link to={`/session/${session.id}`}>
                    View Session Details
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )}
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <Receipt className="h-5 w-5 mr-2 text-tennis-green-600" />
                Need Help?
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <p className="text-sm text-gray-500">
                If you have any questions about this payment or need to report an issue,
                our support team is here to help.
              </p>
              
              <Button variant="link" className="p-0 h-auto mt-2 text-tennis-green-600">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentDetail;
