
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { sendCustomEmail } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !fullName) {
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
        password: password, // Include password for account creation
        redirect_to: `${window.location.origin}/auth/callback`
      };
      
      console.log("Email data being sent:", emailData);
      
      const result = await sendCustomEmail('signup', email, emailData);
      
      console.log("Custom email function result:", result);
      
      if (result && result.success) {
        toast({
          title: "✅ Verification email sent!",
          description: `Please check your email at ${email} to verify your account. Check spam folder if needed.`
        });
        
        // Navigate to email confirmation page with email
        navigate('/email-confirmation', { 
          state: { 
            email,
            signupAttempted: true,
            customEmailUsed: true
          } 
        });
      } else {
        // Handle case where success is not explicitly true
        console.warn("Email send result unclear:", result);
        toast({
          variant: "destructive",
          title: "Email sending status unclear",
          description: `We attempted to send a verification email to ${email}. Please check your inbox and spam folder.`
        });
        
        // Still navigate to confirmation page
        navigate('/email-confirmation', { 
          state: { 
            email,
            signupAttempted: true,
            customEmailUsed: true,
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
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join the tennis coaching platform
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Enter your details to create your Tennexis account
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
              
              <Button 
                type="submit" 
                className="w-full bg-tennis-green-600 hover:bg-tennis-green-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
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
            By creating an account, you agree to our{' '}
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
