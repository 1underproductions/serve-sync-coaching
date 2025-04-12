
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Copy, ChevronRight, Mail } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [copied, setCopied] = useState(false);
  
  // Get payment data from location state or local storage
  const paymentUrl = location.state?.paymentUrl || localStorage.getItem("lastPaymentUrl");
  const paymentLinkId = location.state?.paymentLinkId || localStorage.getItem("lastPaymentLinkId");
  const playerEmail = location.state?.playerEmail;
  const emailSent = location.state?.sendEmail;
  
  // Store payment URL in localStorage if it exists
  useEffect(() => {
    if (location.state?.paymentUrl) {
      localStorage.setItem("lastPaymentUrl", location.state.paymentUrl);
    }
    if (location.state?.paymentLinkId) {
      localStorage.setItem("lastPaymentLinkId", location.state.paymentLinkId);
    }
  }, [location.state]);
  
  const copyToClipboard = () => {
    if (paymentUrl) {
      navigator.clipboard.writeText(paymentUrl)
        .then(() => {
          setCopied(true);
          toast({
            title: "Copied!",
            description: "Payment link copied to clipboard",
          });
          
          // Reset copied state after 3 seconds
          setTimeout(() => setCopied(false), 3000);
        })
        .catch(err => {
          console.error("Failed to copy:", err);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to copy link to clipboard",
          });
        });
    }
  };
  
  return (
    <Layout>
      <div className="container max-w-2xl py-10">
        <Card>
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl md:text-3xl">Payment Link Created!</CardTitle>
            <CardDescription>
              Your payment link has been created successfully and is ready to share.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pb-6 space-y-6">
            {paymentUrl && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Payment URL:</p>
                <div className="flex gap-2">
                  <Input 
                    value={paymentUrl} 
                    readOnly 
                    className="bg-muted/50 flex-grow text-sm font-mono"
                  />
                  <Button 
                    onClick={copyToClipboard} 
                    variant="outline" 
                    size="icon"
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
            
            {emailSent && playerEmail && (
              <div className="rounded-lg bg-green-50 p-4 border border-green-100">
                <div className="flex gap-3">
                  <Mail className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-green-800">Email Sent</h3>
                    <p className="text-green-700 text-sm mt-1">
                      Payment link has been emailed to {playerEmail}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
              <p className="text-blue-700 text-sm">
                You can view and manage this payment in the payments section. 
                Share this link with your player to collect payment for the coaching session.
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={() => window.open(paymentUrl, '_blank')}
              disabled={!paymentUrl}
            >
              View Payment Page
            </Button>
            
            <Button 
              className="w-full sm:w-auto sm:ml-auto"
              onClick={() => navigate("/payments")}
            >
              Go to Payments
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default PaymentSuccess;
