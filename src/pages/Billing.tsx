
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { CreditCard, Check, AlertCircle } from "lucide-react";

const Billing = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock subscription data - in a real app, this would come from your backend
  const subscriptionData = {
    status: "trialing", // Options: "trialing", "active", "canceled", "incomplete"
    trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    cancelAtPeriodEnd: false,
  };
  
  // Helper to format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };
  
  // Calculate days remaining in trial
  const getDaysRemaining = () => {
    const now = new Date();
    const diffTime = subscriptionData.trialEndsAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
  
  // Handle add payment method
  const handleAddPayment = async () => {
    setIsLoading(true);
    
    try {
      // Mock API call - in a real app, this would redirect to Stripe Checkout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success toast
      toast({
        title: "Payment method added",
        description: "Your subscription will continue automatically after your trial.",
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment setup failed",
        description: "There was an error setting up your payment method. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle cancel subscription
  const handleCancelSubscription = async () => {
    setIsLoading(true);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success toast
      toast({
        title: "Subscription canceled",
        description: "Your subscription has been canceled and will end at the end of your current billing period.",
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Cancellation error:", error);
      toast({
        title: "Cancellation failed",
        description: "There was an error canceling your subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render subscription status
  const renderSubscriptionStatus = () => {
    switch (subscriptionData.status) {
      case "trialing":
        return (
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="h-5 w-5" />
            <span>Trial - {getDaysRemaining()} days remaining</span>
          </div>
        );
      case "active":
        return (
          <div className="flex items-center gap-2 text-green-600">
            <Check className="h-5 w-5" />
            <span>Active</span>
          </div>
        );
      case "canceled":
        return (
          <div className="flex items-center gap-2 text-gray-600">
            <AlertCircle className="h-5 w-5" />
            <span>Canceled - Ends {formatDate(subscriptionData.currentPeriodEnd)}</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Incomplete</span>
          </div>
        );
    }
  };

  return (
    <Layout>
      <div className="container px-4 py-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Subscription & Billing</h1>
        
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-8">
            <Card>
              <CardHeader>
                <CardTitle>Your Subscription</CardTitle>
                <CardDescription>
                  Manage your ServeSync subscription
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center border-b pb-4">
                  <span className="font-medium">Status</span>
                  {renderSubscriptionStatus()}
                </div>
                
                <div className="flex justify-between items-center border-b pb-4">
                  <span className="font-medium">Plan</span>
                  <span>ServeSync Pro ($29/month)</span>
                </div>
                
                {subscriptionData.status === "trialing" && (
                  <div className="flex justify-between items-center border-b pb-4">
                    <span className="font-medium">Trial Ends</span>
                    <span>{formatDate(subscriptionData.trialEndsAt)}</span>
                  </div>
                )}
                
                {subscriptionData.status === "active" && (
                  <div className="flex justify-between items-center border-b pb-4">
                    <span className="font-medium">Next Billing Date</span>
                    <span>{formatDate(subscriptionData.currentPeriodEnd)}</span>
                  </div>
                )}
                
                {subscriptionData.status === "canceled" && (
                  <div className="flex justify-between items-center border-b pb-4">
                    <span className="font-medium">Access Until</span>
                    <span>{formatDate(subscriptionData.currentPeriodEnd)}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Payment Method</span>
                  {subscriptionData.status === "trialing" ? (
                    <span className="text-amber-600">Not added yet</span>
                  ) : (
                    <span>•••• 4242</span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-4">
                {subscriptionData.status === "trialing" && (
                  <Button
                    variant="tennis"
                    onClick={handleAddPayment}
                    disabled={isLoading}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Add Payment Method
                  </Button>
                )}
                
                {subscriptionData.status === "active" && !subscriptionData.cancelAtPeriodEnd && (
                  <Button
                    variant="outline"
                    onClick={handleCancelSubscription}
                    disabled={isLoading}
                  >
                    Cancel Subscription
                  </Button>
                )}
                
                {subscriptionData.status === "canceled" && (
                  <Button
                    variant="tennis"
                    onClick={handleAddPayment}
                    disabled={isLoading}
                  >
                    Reactivate Subscription
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
          
          <div className="md:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle>Plan Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">ServeSync Pro</h3>
                  <p className="text-2xl font-bold">$29<span className="text-sm font-normal text-gray-500">/month</span></p>
                  
                  <ul className="space-y-2 mt-4">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-tennis-green-600 mr-2 mt-0.5" />
                      <span>Unlimited scheduling</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-tennis-green-600 mr-2 mt-0.5" />
                      <span>Unlimited players</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-tennis-green-600 mr-2 mt-0.5" />
                      <span>Automated player communications</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-tennis-green-600 mr-2 mt-0.5" />
                      <span>Payment processing</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-tennis-green-600 mr-2 mt-0.5" />
                      <span>Advanced analytics</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Billing;
