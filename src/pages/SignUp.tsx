
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { sendCustomEmail } from '@/lib/supabase';
import { Loader2, CreditCard, Shield, Gift } from 'lucide-react';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !fullName || !cardNumber || !expiryDate || !cvv) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields"
      });
      return;
    }

    setLoading(true);
    
    try {
      console.log("=== STARTING SIGNUP PROCESS ===");
      console.log("Email:", email);
      console.log("Full Name:", fullName);
      
      // Use the custom email function for signup verification
      console.log("Calling custom email function for signup...");
      
      const emailData = {
        full_name: fullName,
        password: password,
        redirect_to: `${window.location.origin}/auth/callback`
      };
      
      console.log("Email data being sent:", emailData);
      
      const result = await sendCustomEmail('signup', email, emailData);
      
      console.log("Custom email function result:", result);
      
      if (result && result.success) {
        toast({
          title: "✅ Account created successfully!",
          description: `Please check your email at ${email} to verify your account and activate your free trial. Check spam folder if needed.`
        });
        
        // Navigate to email confirmation page with email
        navigate('/email-confirmation', { 
          state: { 
            email,
            signupAttempted: true,
            customEmailUsed: true,
            freeTrialStarted: true
          } 
        });
      } else {
        // Handle case where success is not explicitly true
        console.warn("Email send result unclear:", result);
        toast({
          variant: "destructive",
          title: "Account creation status unclear",
          description: `We attempted to create your account and send a verification email to ${email}. Please check your inbox and spam folder.`
        });
        
        // Still navigate to confirmation page
        navigate('/email-confirmation', { 
          state: { 
            email,
            signupAttempted: true,
            customEmailUsed: true,
            freeTrialStarted: true,
            warningShown: true
          } 
        });
      }
    } catch (error: any) {
      console.error("=== SIGNUP ERROR ===");
      console.error("Error during signup:", error);
      
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: `Error: ${error.message || "Unknown error occurred"}. Please try again.`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="text-2xl font-bold text-tennis-green-600">
            Tennexis
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Start Your Free Trial
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join the tennis coaching platform - 14 days free, then $29/month
          </p>
        </div>

        {/* Free Trial Benefits */}
        <div className="bg-tennis-green-50 border border-tennis-green-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center space-x-2">
            <Gift className="h-5 w-5 text-tennis-green-600" />
            <span className="text-sm font-medium text-tennis-green-800">14-Day Free Trial Includes:</span>
          </div>
          <ul className="text-sm text-tennis-green-700 space-y-1 ml-7">
            <li>• Unlimited session scheduling</li>
            <li>• Player management tools</li>
            <li>• Payment processing</li>
            <li>• Analytics dashboard</li>
          </ul>
          <div className="flex items-center space-x-2 mt-3">
            <Shield className="h-4 w-4 text-tennis-green-600" />
            <span className="text-xs text-tennis-green-600">Cancel anytime during trial - no charges</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              Enter your details to start your free trial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                />
              </div>

              {/* Payment Information Section */}
              <div className="border-t pt-4">
                <div className="flex items-center space-x-2 mb-3">
                  <CreditCard className="h-4 w-4 text-gray-600" />
                  <Label className="text-sm font-medium">Payment Information</Label>
                  <span className="text-xs text-gray-500">(Required for trial - not charged today)</span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="cardNumber" className="text-sm">Card Number</Label>
                    <Input
                      id="cardNumber"
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="expiryDate" className="text-sm">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        type="text"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv" className="text-sm">CVV</Label>
                      <Input
                        id="cvv"
                        type="text"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        placeholder="123"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-tennis-green-600 hover:bg-tennis-green-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting your free trial...
                  </>
                ) : (
                  'Start Free Trial'
                )}
              </Button>

              <div className="text-center text-xs text-gray-500 mt-4">
                <p>
                  🔒 Your payment info is secure and encrypted. You won't be charged during your 14-day free trial.
                </p>
              </div>
            </form>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-tennis-green-600 hover:text-tennis-green-500 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By starting your free trial, you agree to our{' '}
            <Link to="/terms" className="text-tennis-green-600 hover:text-tennis-green-500">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-tennis-green-600 hover:text-tennis-green-500">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
