
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarClock, Copy, User, Mail, Loader2, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BadgeCheck } from 'lucide-react';
import { useAuth } from "@/context/useAuth";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import PaymentStatusBadge from "@/components/schedule/PaymentStatusBadge";
import PaymentReminderManager from "@/components/payments/PaymentReminderManager";
import Layout from "@/components/layout/Layout";

interface PaymentLink {
  id: string;
  created_at: string;
  coach_id: string;
  player_id: string | null;
  player_email?: string;
  amount: number;
  currency: string;
  description: string | null;
  session_id: string | null;
  package_id?: string | null;
  payment_type?: string;
  status: string | null;
  expires_at: string | null;
  stripe_checkout_id: string | null;
  updated_at: string;
  coach_name?: string;
  session_details?: string;
}

const PaymentDetail = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const [data, setData] = useState<PaymentLink | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopying, setIsCopying] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchPaymentLink = async () => {
      if (!paymentId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Payment ID is required.",
        });
        navigate("/payments");
        return;
      }

      setIsLoading(true);

      try {
        const { data: paymentLink, error } = await supabase
          .from("payment_links")
          .select("*")
          .eq("id", paymentId)
          .single();

        if (error) {
          throw error;
        }

        if (!paymentLink) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Payment link not found.",
          });
          navigate("/payments");
          return;
        }

        // Create a new object with our interface structure, providing defaults for missing fields
        const completePaymentLink: PaymentLink = {
          ...paymentLink,
          payment_type: "one_time", // Default value
          player_email: "", // Default value
          package_id: null, // Default value
        };

        setData(completePaymentLink);
      } catch (error: any) {
        console.error("Error fetching payment link:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to fetch payment link.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentLink();
  }, [paymentId, navigate, toast]);

  const handleCopyLink = async () => {
    if (!data?.stripe_checkout_id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Payment link not available.",
      });
      return;
    }

    setIsCopying(true);

    try {
      const { data: urlData, error: urlError } = await supabase.functions.invoke("get-checkout-url", {
        body: { id: paymentId }
      });
      
      if (urlError || !urlData?.url) {
        throw new Error(urlError?.message || "Failed to get payment URL");
      }

      await navigator.clipboard.writeText(urlData.url);
      toast({
        title: "Link copied",
        description: "Payment link has been copied to clipboard.",
      });
    } catch (error: any) {
      console.error("Error copying link:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to copy payment link.",
      });
    } finally {
      setIsCopying(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading payment details...
        </div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <AlertCircle className="mr-2 h-4 w-4" />
          Payment link not found.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Payment Details</h1>
          <p className="text-muted-foreground">
            View and manage details for payment ID: {data.id}
          </p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
            <CardDescription>Details about this payment link</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium leading-none">Status</div>
                  <div className="text-muted-foreground">
                    <PaymentStatusBadge status={data.status || 'pending'} showLabel={true} />
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium leading-none">Amount</div>
                  <div className="text-muted-foreground">
                    {data.amount} {data.currency}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium leading-none">Payment Type</div>
                  <div className="text-muted-foreground">{data.payment_type || "One-time"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium leading-none">Description</div>
                  <div className="text-muted-foreground">{data.description || "N/A"}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium leading-none">Created At</div>
                  <div className="text-muted-foreground">
                    {format(new Date(data.created_at), "PPP p")}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium leading-none">Expires At</div>
                  <div className="text-muted-foreground">
                    {data.expires_at ? format(new Date(data.expires_at), "PPP p") : "N/A"}
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium leading-none">Coach</div>
                    <div className="text-muted-foreground flex items-center gap-2">
                      <User className="h-3 w-3" />
                      {data.coach_name || user?.user_metadata?.full_name || "N/A"}
                    </div>
                </div>
                <div>
                  <div className="text-sm font-medium leading-none">Player</div>
                  <div className="text-muted-foreground flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    {data.player_email || "N/A"}
                  </div>
                </div>
              </div>

              {data.session_id && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <div className="text-sm font-medium leading-none">Session Details</div>
                    <div className="text-muted-foreground">{data.session_details || "N/A"}</div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <Button
              onClick={handleCopyLink}
              disabled={isCopying}
              variant="secondary"
              size="sm"
            >
              {isCopying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Copying...
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Payment Link
                </>
              )}
            </Button>
            <PaymentReminderManager 
              paymentLinkId={data.id}
              playerEmail={data.player_email}
              sessionDetails={data.session_details}
              expiresAt={data.expires_at || undefined}
            />
          </CardFooter>
        </Card>

        <div className="mt-8">
          <h2 className="text-2xl font-bold tracking-tight">Payment Events</h2>
          <p className="text-muted-foreground">
            History of events associated with this payment
          </p>

          <Card className="w-full mt-4">
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>All transactions related to this payment link</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>A list of your recent transactions.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>July 10, 2023</TableCell>
                    <TableCell>Payment</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <BadgeCheck className="h-4 w-4 text-green-500 mr-2" />
                        Completed
                      </div>
                    </TableCell>
                    <TableCell className="text-right">$100.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>July 10, 2023</TableCell>
                    <TableCell>Refund</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <XCircle className="h-4 w-4 text-red-500 mr-2" />
                        Refunded
                      </div>
                    </TableCell>
                    <TableCell className="text-right">-$100.00</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold tracking-tight">Actions</h2>
          <p className="text-muted-foreground">
            Take actions related to this payment
          </p>

          <Card className="w-full mt-4">
            <CardHeader>
              <CardTitle>Payment Link</CardTitle>
              <CardDescription>View and manage the payment link</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium leading-none">Payment URL</div>
                    <div className="text-muted-foreground truncate">
                      {data.stripe_checkout_id ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <a
                                href={`https://dashboard.stripe.com/checkout/sessions/${data.stripe_checkout_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline underline-offset-4 hover:text-blue-500"
                              >
                                {data.stripe_checkout_id}
                              </a>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View Stripe Checkout Session</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        "N/A"
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => {
                  if (data.stripe_checkout_id) {
                    window.open(`https://dashboard.stripe.com/checkout/sessions/${data.stripe_checkout_id}`, '_blank', 'noopener');
                  }
                }}
                size="sm" 
                variant="outline"
                className="text-xs"
                disabled={!data.stripe_checkout_id}
              >
                View Payment Link
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentDetail;
