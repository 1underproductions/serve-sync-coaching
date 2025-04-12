
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, DollarSign, Link } from "lucide-react";
import { supabase } from "@/lib/supabase";

const NewPayment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid payment amount",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          amount: Number(amount),
          description: description || "Tennis coaching payment",
          successPath: "/payment-success",
          cancelPath: "/payments",
        },
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data.url) {
        // Open the Stripe checkout page in a new tab
        window.open(data.url, "_blank");
        
        toast({
          title: "Payment link created",
          description: "A new payment link has been created successfully.",
        });
        
        // Navigate back to payments page
        navigate("/payments");
      } else {
        throw new Error("Failed to create payment link");
      }
    } catch (error) {
      console.error("Error creating payment link:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create payment link",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-2xl py-8">
        <div className="mb-6 flex items-center">
          <Button asChild variant="outline" className="mr-4">
            <div onClick={() => navigate("/payments")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </div>
          </Button>
          <h1 className="text-3xl font-bold">Create Payment Link</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>
              Create a new payment link that you can share with your clients.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    id="amount"
                    placeholder="0.00"
                    className="pl-10"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="e.g., 5 tennis lessons package"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/payments")}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Link className="mr-2 h-4 w-4" /> Create Payment Link
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default NewPayment;
