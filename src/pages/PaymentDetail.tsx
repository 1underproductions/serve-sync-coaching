
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, CreditCard, User } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { Payment, Session } from "@/lib/supabase";

// Fixed imports and data types to work with current database structure

const PaymentDetail = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        setLoading(true);
        
        // Since we don't have a payments table yet in the actual database schema,
        // we're leaving this as a placeholder. In a real implementation, 
        // you would fetch from your payments table.
        
        // This would be the actual implementation once you have the tables:
        /*
        // Fetch payment data
        const { data: paymentData, error: paymentError } = await supabase
          .from('payments')
          .select('*')
          .eq('id', paymentId)
          .single();
        
        if (paymentError) throw paymentError;
        if (!paymentData) throw new Error('Payment not found');
        
        setPayment(paymentData);
        
        // If payment is linked to a session, fetch session data
        if (paymentData.session_id) {
          const { data: sessionData, error: sessionError } = await supabase
            .from('sessions')
            .select('*')
            .eq('id', paymentData.session_id)
            .single();
            
          if (!sessionError && sessionData) {
            setSession(sessionData);
          }
        }
        */
        
        // Mock data for demonstration
        setPayment({
          id: paymentId || 'mock-payment-id',
          user_id: 'mock-user-id',
          amount: 75.00,
          status: 'succeeded',
          payment_method: 'card',
          created_at: new Date().toISOString(),
          description: 'Tennis lesson payment',
          session_id: 'mock-session-id',
          stripe_payment_id: 'pi_mock123456'
        });
        
        setSession({
          id: 'mock-session-id',
          user_id: 'mock-user-id',
          title: 'Advanced Backhand Techniques',
          description: 'Focusing on improving backhand technique',
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + 3600000).toISOString(),
          location: 'Court #3',
          status: 'scheduled',
          price: 75.00,
          players: ['player-1'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      } catch (err) {
        console.error('Error fetching payment details:', err);
        setError('Failed to load payment details');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [paymentId]);

  if (loading) return (
    <Layout>
      <div className="container max-w-4xl py-8">
        <p>Loading payment details...</p>
      </div>
    </Layout>
  );

  if (error || !payment) return (
    <Layout>
      <div className="container max-w-4xl py-8">
        <p className="text-red-500">{error || 'Payment not found'}</p>
        <Button asChild className="mt-4">
          <Link to="/payments"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Payments</Link>
        </Button>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="container max-w-4xl py-8">
        <div className="mb-6 flex items-center">
          <Button asChild variant="outline" className="mr-4">
            <Link to="/payments">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Payment Details</h1>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Payment #{payment.id.slice(-6)}</CardTitle>
                <Badge variant={payment.status === 'succeeded' ? 'success' : payment.status === 'pending' ? 'primary' : 'destructive'}>
                  {payment.status === 'succeeded' ? 'Paid' : payment.status === 'pending' ? 'Pending' : 'Failed'}
                </Badge>
              </div>
              <CardDescription>
                {payment.created_at && format(new Date(payment.created_at), 'MMMM d, yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-xl font-medium">${payment.amount.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <div className="flex items-center">
                    <CreditCard className="mr-2 h-4 w-4" />
                    <p className="font-medium capitalize">{payment.payment_method}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Description</p>
                <p>{payment.description}</p>
              </div>

              {payment.stripe_payment_id && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Transaction ID</p>
                  <p className="font-mono text-sm">{payment.stripe_payment_id}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {session && (
            <Card>
              <CardHeader>
                <CardTitle>Linked Session</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{session.title}</h3>
                    <p className="text-sm text-muted-foreground">{session.description}</p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/session/${session.id}`}>View Session</Link>
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-2">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {format(new Date(session.start_time), 'EEEE, MMMM d, yyyy')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(session.start_time), 'h:mm a')} - {format(new Date(session.end_time), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{session.players.length} Player(s)</p>
                      <p className="text-sm text-muted-foreground">{session.location}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PaymentDetail;
