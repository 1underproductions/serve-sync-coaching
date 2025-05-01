
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

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
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});
  
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

  // Enhanced token verification
  useEffect(() => {
    const verifySession = async () => {
      setIsCheckingToken(true);
      setErrorMessage(null);
      
      try {
        console.log("Checking for auth session or reset token...");
        const debugData: any = {
          location: {
            hash: location.hash,
            search: location.search,
            pathname: location.pathname
          },
          parsed: {}
        };
        
        // Parse URL parameters from multiple possible formats
        // 1. Check URL hash fragments (typical of Supabase auth redirects)
        const hashParams = new URLSearchParams(location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        
        // 2. Check query parameters (sometimes used in recovery flows)
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get('token');
        const typeParam = searchParams.get('type');
        
        debugData.parsed = {
          accessToken: accessToken ? "present" : "not present",
          refreshToken: refreshToken ? "present" : "not present",
          type: type || "not present",
          token: token ? "present" : "not present", 
          typeParam: typeParam || "not present"
        };
        
        console.log("URL parameters found:", debugData.parsed);
        setDebugInfo(debugData);
        
        // First approach: Try to set session from URL (handles hash fragments from Supabase auth redirects)
        try {
          console.log("Attempting to get session from URL...");
          const { data, error } = await supabase.auth.getSessionFromUrl();
          
          debugData.sessionFromUrl = { 
            success: !!data?.session,
            error: error ? error.message : null
          };
          
          if (error) {
            console.log("Error getting session from URL:", error.message);
          }
          
          if (data?.session) {
            console.log("Successfully got session from URL");
            setTokenVerified(true);
            setIsCheckingToken(false);
            return;
          }
        } catch (urlError) {
          console.error("Error getting session from URL:", urlError);
          debugData.sessionFromUrlError = urlError;
        }
        
        // Second approach: If there's an access_token in the hash
        if (accessToken) {
          console.log("Found access_token in URL hash, setting session");
          
          try {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || "",
            });
            
            debugData.setSession = { 
              success: !!data.session,
              error: error ? error.message : null
            };
            
            if (error) {
              console.error("Error setting session from hash:", error);
            }
            
            if (data.session) {
              console.log("Successfully set session from hash");
              setTokenVerified(true);
              setIsCheckingToken(false);
              return;
            }
          } catch (sessionError) {
            console.error("Error setting session:", sessionError);
            debugData.setSessionError = sessionError;
          }
        }
        
        // Third approach: Exchange recovery code for session
        if (token && (typeParam === 'recovery' || type === 'recovery')) {
          console.log("Found recovery token, exchanging for session");
          
          try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(token);
            
            debugData.exchangeCode = { 
              success: !!data.session,
              error: error ? error.message : null
            };
            
            if (error) {
              console.error("Error exchanging code for session:", error);
            }
            
            if (data.session) {
              console.log("Successfully exchanged token for session");
              setTokenVerified(true);
              setIsCheckingToken(false);
              return;
            }
          } catch (exchangeError) {
            console.error("Error exchanging code:", exchangeError);
            debugData.exchangeCodeError = exchangeError;
          }
        }
        
        // Fourth approach: Check if we already have an active session
        try {
          const { data, error } = await supabase.auth.getSession();
          
          debugData.getSession = { 
            success: !!data.session,
            error: error ? error.message : null
          };
          
          if (error) {
            console.error("Error checking session:", error);
          }
          
          if (data.session) {
            console.log("Valid session found:", data.session.user.id);
            setTokenVerified(true);
            setIsCheckingToken(false);
            return;
          }
        } catch (getSessionError) {
          console.error("Error getting session:", getSessionError);
          debugData.getSessionError = getSessionError;
        }
        
        // If we got here, no valid session was found
        console.error("No valid recovery session found");
        setTokenVerified(false);
        setErrorMessage("Your password reset link has expired or is invalid. Please request a new one.");
        
      } catch (error: any) {
        console.error("Session verification error:", error);
        setTokenVerified(false);
        setErrorMessage(`Your password reset link is invalid or has expired. Please request a new one. (${error.message})`);
      } finally {
        setIsCheckingToken(false);
        setDebugInfo(prevState => ({ ...prevState, finalState: { tokenVerified, errorMessage }}));
      }
    };
    
    verifySession();
  }, [location]);

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
              
              <div className="mt-6 text-xs text-gray-500">
                <Button 
                  variant="link" 
                  onClick={() => setShowDebugInfo(true)}
                  className="text-xs p-0 h-auto"
                >
                  Show technical details
                </Button>
              </div>
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

      <Dialog open={showDebugInfo} onOpenChange={setShowDebugInfo}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Debug Information</DialogTitle>
            <DialogDescription>
              Technical details about the password reset link
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-auto">
            <pre className="text-xs bg-gray-100 p-4 rounded whitespace-pre-wrap">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
          <div className="text-right">
            <Button variant="outline" onClick={() => setShowDebugInfo(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResetPassword;
