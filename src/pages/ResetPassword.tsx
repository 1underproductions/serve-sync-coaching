import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Alert, AlertDescription } from "@/components/ui/alert";

const resetPasswordSchema = z.object({
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  confirmPassword: z.string().min(8, {
    message: "Please confirm your password.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tokenVerified, setTokenVerified] = useState<boolean | null>(null);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // More robust token verification
  useEffect(() => {
    const verifySession = async () => {
      setIsCheckingToken(true);
      setErrorMessage(null);
      
      try {
        console.log("Checking for auth session...");
        
        // First check the URL hash params (from direct Supabase redirects)
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type = params.get('type');
        
        // Also check URL search params (in case tokens are there)
        const searchParams = new URLSearchParams(window.location.search);
        const urlToken = searchParams.get('token');
        
        // Log found tokens (without revealing full values)
        if (accessToken) console.log("Found access_token in URL hash");
        if (urlToken) console.log("Found token in URL search params");
        
        // Try setting session from hash params
        if (accessToken && type === 'recovery') {
          console.log("Setting session from hash params");
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          
          if (error) {
            console.error("Error setting session from URL:", error);
            throw error;
          }
          
          if (data.session) {
            console.log("Successfully set session from URL hash");
            setTokenVerified(true);
            setIsCheckingToken(false);
            return;
          }
        }
        
        // If we have a token in the URL, try to verify it
        if (urlToken) {
          console.log("Verifying token from URL parameter");
          // This only works for certain token types, but worth trying
          const { error } = await supabase.auth.verifyOtp({
            token_hash: urlToken,
            type: 'recovery',
          });
          
          if (error) {
            console.error("Error verifying token:", error);
            // Don't throw here, continue to try other methods
          } else {
            console.log("Successfully verified token from URL");
            setTokenVerified(true);
            setIsCheckingToken(false);
            return;
          }
        }
        
        // As a fallback, check if we already have a valid session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          throw error;
        }
        
        if (data.session) {
          console.log("Valid session found");
          setTokenVerified(true);
        } else {
          console.error("No valid session found");
          setTokenVerified(false);
          setErrorMessage("Your password reset link has expired or is invalid. Please request a new one.");
        }
      } catch (error: any) {
        console.error("Session verification error:", error);
        setTokenVerified(false);
        setErrorMessage("Your password reset link has expired or is invalid. Please request a new one.");
      } finally {
        setIsCheckingToken(false);
      }
    };
    
    verifySession();
  }, []);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      });
      
      // Sign the user out to ensure they log in with the new password
      await supabase.auth.signOut();
      
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error: any) {
      setErrorMessage(error.message || "There was a problem updating your password. Please try again.");
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "There was a problem updating your password. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center mb-4">
          <span className="text-2xl font-bold text-tennis-green-600">Tennexis</span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your new password below.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {isCheckingToken && (
            <div className="text-center py-4">
              <div className="animate-pulse">Verifying your reset link...</div>
            </div>
          )}
          
          {errorMessage && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {tokenVerified === false && !isCheckingToken && (
            <div className="text-center">
              <div className="mb-4 text-red-600">
                Your password reset link has expired or is invalid.
              </div>
              <Button
                onClick={() => navigate("/forgot-password")}
                className="mt-4"
              >
                Request a new password reset link
              </Button>
            </div>
          )}

          {tokenVerified && !isCheckingToken && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            className="pl-10 pr-10"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            className="pl-10 pr-10"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-3"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Updating..." : "Reset Password"}
                  </Button>
                </div>

                <div className="text-center mt-4">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-tennis-green-600 hover:text-tennis-green-500"
                  >
                    Return to login
                  </Link>
                </div>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
