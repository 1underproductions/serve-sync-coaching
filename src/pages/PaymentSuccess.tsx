
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Start countdown to redirect back to payments page
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/payments");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <Layout>
      <div className="container max-w-2xl py-12">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle size={48} className="text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-gray-600">
              Thank you for your payment. Your transaction has been completed successfully.
            </p>
            
            {sessionId && (
              <p className="mb-6 text-sm text-gray-500">
                Transaction ID: {sessionId}
              </p>
            )}
            
            <div className="space-y-4">
              <Button onClick={() => navigate("/payments")} className="w-full sm:w-auto">
                Return to Payments
              </Button>
              
              <p className="text-sm text-gray-500">
                Redirecting in {countdown} seconds...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PaymentSuccess;
