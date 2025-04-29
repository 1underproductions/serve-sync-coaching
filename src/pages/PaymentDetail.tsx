
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, Copy, CheckCircle, Clock, AlertOctagon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import PaymentReminderManager from "@/components/payments/PaymentReminderManager";

interface PaymentLink {
  id: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  expires_at?: string;
  stripe_checkout_id?: string;
  player_id?: string;
  player_email?: string;
  session_id?: string;
}

const PaymentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [paymentLink, setPaymentLink] = useState<PaymentLink | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [sessionTitle, setSessionTitle] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentLink = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        // Get payment link from localStorage for now
        const storedPaymentLinks = localStorage.getItem("payment_links");
        if (storedPaymentLinks) {
          const paymentLinks = JSON.parse(storedPaymentLinks);
          const found = paymentLinks.find((p: PaymentLink) => p.id === id);
          
          if (found) {
            setPaymentLink(found);
            
            // If payment link has player_id, get player name
            if (found.player_id) {
              const storedPlayers = localStorage.getItem("players");
              if (storedPlayers) {
                const players = JSON.parse(storedPlayers);
                const player = players.find((p: any) => p.id === found.player_id);
                if (player) {
                  setPlayerName(player.name);
                }
              }
            }
            
            // If payment link has session_id, get session title
            if (found.session_id) {
              const storedSessions = localStorage.getItem("sessions");
              if (storedSessions) {
                const sessions = JSON.parse(storedSessions);
                const session = sessions.find((s: any) => s.id === found.session_id);
                if (session) {
                  setSessionTitle(session.title);
                }
              }
            }
          } else {
            // If not found in localStorage, try fetching from API
            const { data, error } = await supabase.functions.invoke("get-checkout-url", {
              body: { id }
            });
            
            if (error) {
              throw new Error(error.message);
            }
            
            if (data) {
              setPaymentUrl(data.url);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching payment link:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load payment link details",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPaymentLink();
  }, [id, toast]);
  
  const handleGetPaymentUrl = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke("get-checkout-url", {
        body: { id }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data) {
        setPaymentUrl(data.url);
      } else {
        throw new Error("Failed to get payment URL");
      }
    } catch (error) {
      console.error("Error getting payment URL:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get payment URL",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyToClipboard = async () => {
    if (!paymentUrl) return;
    
    try {
      await navigator.clipboard.writeText(paymentUrl);
      setCopySuccess(true);
      
      toast({
        title: "Copied!",
        description: "Payment URL copied to clipboard",
      });
      
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy URL to clipboard",
      });
    }
  };

  const getStatusBadge = () => {
    if (!paymentLink) return null;
    
    switch (paymentLink.status) {
      case 'paid':
      case 'succeeded':
        return (
          <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full text-sm">
            <CheckCircle className="h-4 w-4" />
            <span>Paid</span>
          </div>
        );
      
      case 'pending':
      case 'active':
        return (
          <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full text-sm">
            <Clock className="h-4 w-4" />
            <span>Pending</span>
          </div>
        );
      
      case 'expired':
        return (
          <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-2.5 py-0.5 rounded-full text-sm">
            <AlertOctagon className="h-4 w-4" />
            <span>Expired</span>
          </div>
        );
      
      default:
        return (
          <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-2.5 py-0.5 rounded-full text-sm">
            <span>{paymentLink.status}</span>
          </div>
        );
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isPending = paymentLink?.status === "active" || paymentLink?.status === "pending";

  return (
    <Layout>
      <div className="container max-w-3xl py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Payment Link Details</h1>
          {!isLoading && getStatusBadge()}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin h-8 w-8 border-4 border-tennis-green-600 rounded-full border-t-transparent"></div>
          </div>
        ) : paymentLink ? (
          <Card>
            <CardHeader>
              <CardTitle>{paymentLink.description}</CardTitle>
              <CardDescription>
                Created on {formatDate(paymentLink.created_at)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium">
                    {paymentLink.currency} {paymentLink.amount.toFixed(2)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{paymentLink.status}</p>
                </div>
                {playerName && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Player</p>
                    <p className="font-medium">{playerName}</p>
                  </div>
                )}
                {sessionTitle && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Session</p>
                    <p className="font-medium">{sessionTitle}</p>
                  </div>
                )}
                {paymentLink.player_email && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{paymentLink.player_email}</p>
                  </div>
                )}
                {paymentLink.expires_at && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Expires</p>
                    <p className="font-medium">{formatDate(paymentLink.expires_at)}</p>
                  </div>
                )}
              </div>
              
              {isPending && paymentLink.player_email && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-2">Payment Reminders</h3>
                  <PaymentReminderManager 
                    paymentLinkId={paymentLink.id}
                    sessionDetails={sessionTitle || paymentLink.description}
                    playerEmail={paymentLink.player_email}
                    expiresAt={paymentLink.expires_at}
                  />
                </div>
              )}

              {isPending && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="text-sm font-medium mb-2">Payment URL</h3>
                  {paymentUrl ? (
                    <div className="flex flex-col gap-3">
                      <div className="bg-white p-3 rounded border break-all text-sm">
                        {paymentUrl}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={copyToClipboard}
                          className="gap-2"
                        >
                          {copySuccess ? (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              Copy URL
                            </>
                          )}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          as="a"
                          href={paymentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Open
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={handleGetPaymentUrl}
                      disabled={isLoading}
                    >
                      {isLoading ? "Loading..." : "Get Payment URL"}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                onClick={() => navigate("/payments")}
              >
                Back to Payments
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <h2 className="text-xl font-semibold mb-2">Payment Link Not Found</h2>
                <p className="text-muted-foreground">The payment link you're looking for couldn't be found.</p>
                <Button
                  className="mt-4"
                  onClick={() => navigate("/payments")}
                >
                  Back to Payments
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default PaymentDetail;
