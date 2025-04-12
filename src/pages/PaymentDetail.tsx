
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, CreditCard, User, ExternalLink, Copy } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { Payment } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

type PaymentLink = {
  id: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  stripe_checkout_id: string | null;
  player_id: string | null;
  player_name?: string;
};

const PaymentDetail = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const [payment, setPayment] = useState<PaymentLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (!paymentId) {
        setError("Payment ID is missing");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch payment data from our database
        const { data, error } = await supabase
          .from('payment_links')
          .select('*')
          .eq('id', paymentId)
          .single();
          
        if (error) {
          throw error;
        }
        
        if (!data) {
          throw new Error('Payment not found');
        }
        
        setPayment(data);
        
        // If payment is still active, get a fresh checkout URL
        if (data.status === 'active' && data.stripe_checkout_id) {
          try {
            const { data: checkoutData, error: checkoutError } = await supabase
              .functions.invoke('get-checkout-url', {
                body: { checkout_id: data.stripe_checkout_id }
              });
              
            if (!checkoutError && checkoutData?.url) {
              setPaymentUrl(checkoutData.url);
            }
          } catch (err) {
            console.error('Error getting checkout URL:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching payment details:', err);
        setError('Failed to load payment details');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [paymentId]);

  const copyPaymentLink = async () => {
    if (!paymentUrl) return;
    
    try {
      await navigator.clipboard.writeText(paymentUrl);
      toast({
        title: "Link copied",
        description: "Payment link copied to clipboard",
      });
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  if (loading) return (
    <Layout>
      <div className="container max-w-4xl py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
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
                <Badge variant={payment.status === 'succeeded' || payment.status === 'paid' ? 'success' : payment.status === 'pending' ? 'primary' : 'destructive'}>
                  {payment.status === 'succeeded' || payment.status === 'paid' ? 'Paid' : payment.status === 'pending' ? 'Pending' : payment.status}
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
                  <p className="text-xl font-medium">${payment.amount.toFixed(2)} {payment.currency}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <div className="flex items-center">
                    <CreditCard className="mr-2 h-4 w-4" />
                    <p className="font-medium">Credit Card</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Description</p>
                <p>{payment.description || "Tennis coaching payment"}</p>
              </div>

              {payment.stripe_checkout_id && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Transaction ID</p>
                  <p className="font-mono text-sm">{payment.stripe_checkout_id}</p>
                </div>
              )}

              {paymentUrl && payment.status === 'active' && (
                <div className="mt-6 rounded-md border p-4 bg-gray-50">
                  <h3 className="font-medium mb-2">Payment Link</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate mr-2">{paymentUrl}</p>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={copyPaymentLink}>
                        <Copy className="h-4 w-4 mr-2" /> Copy
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <a href={paymentUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" /> Open
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentDetail;
