
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import { CreditCard, Calendar, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const AccountBilling = () => {
  const { toast } = useToast();
  
  // Mock data for demonstration
  const subscriptionData = {
    status: "active",
    plan: "Pro",
    trialEndsAt: "2023-08-15",
    nextBillingDate: "2023-08-15",
    amount: "$49.00",
    interval: "month",
    cardLast4: "4242",
    cardBrand: "Visa",
    cardExpiry: "12/25"
  };
  
  const isInTrial = new Date(subscriptionData.trialEndsAt) > new Date();
  
  const handleUpdatePayment = () => {
    toast({
      title: "Payment method updated",
      description: "Your payment information has been updated successfully.",
    });
  };
  
  const handleCancelSubscription = () => {
    toast({
      title: "Subscription canceled",
      description: "Your subscription will remain active until the end of the current billing period.",
    });
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
          <p className="text-gray-600">Manage your subscription and payment methods</p>
        </div>
        
        {isInTrial && (
          <Card className="mb-8 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3" />
                <div>
                  <h3 className="font-medium text-yellow-800">Trial Period Active</h3>
                  <p className="text-yellow-700 text-sm mt-1">
                    Your trial ends on {new Date(subscriptionData.trialEndsAt).toLocaleDateString()}. 
                    Your card will be automatically charged ${subscriptionData.amount} on this date.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Details</CardTitle>
                <CardDescription>
                  Your current plan and billing information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Plan</p>
                    <p className="font-medium">{subscriptionData.plan}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <div className="flex items-center">
                      <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                      <span className="font-medium capitalize">{subscriptionData.status}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Billing Amount</p>
                    <p className="font-medium">{subscriptionData.amount}/{subscriptionData.interval}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Next Billing Date</p>
                    <p className="font-medium">{new Date(subscriptionData.nextBillingDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <div className="flex items-center mb-3">
                    <CreditCard className="h-5 w-5 mr-2 text-gray-500" />
                    <h3 className="font-medium">Payment Method</h3>
                  </div>
                  
                  <div className="flex items-center p-3 border rounded-md">
                    <div className="bg-gray-100 p-2 rounded mr-3">
                      <span className="font-bold text-sm">{subscriptionData.cardBrand}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">•••• •••• •••• {subscriptionData.cardLast4}</p>
                      <p className="text-sm text-gray-500">Expires {subscriptionData.cardExpiry}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleUpdatePayment}>
                      Update
                    </Button>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <div className="flex items-center mb-3">
                    <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                    <h3 className="font-medium">Billing History</h3>
                  </div>
                  
                  {isInTrial ? (
                    <p className="text-sm text-gray-500">Your billing history will appear here after your trial ends.</p>
                  ) : (
                    <div className="border rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                            <td className="px-4 py-3 text-sm text-gray-900">Jul 15, 2023</td>
                            <td className="px-4 py-3 text-sm text-gray-900">$49.00</td>
                            <td className="px-4 py-3 text-sm">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Paid
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">
                              <Button variant="ghost" size="sm">Download</Button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Plan Options</CardTitle>
                <CardDescription>
                  Manage your subscription
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h3 className="font-medium mb-2">Current Plan: {subscriptionData.plan}</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {subscriptionData.amount}/{subscriptionData.interval}
                  </p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-start text-sm">
                      <span className="h-5 w-5 text-green-500 mr-2">✓</span>
                      <span>Unlimited players</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <span className="h-5 w-5 text-green-500 mr-2">✓</span>
                      <span>Advanced scheduling</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <span className="h-5 w-5 text-green-500 mr-2">✓</span>
                      <span>Payment processing</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <span className="h-5 w-5 text-green-500 mr-2">✓</span>
                      <span>Player analytics</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/settings/change-plan">Change Plan</Link>
                </Button>
                <Button variant="ghost" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleCancelSubscription}>
                  Cancel Subscription
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AccountBilling;
