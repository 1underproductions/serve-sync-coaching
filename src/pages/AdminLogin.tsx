
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Eye, EyeOff, Mail, Lock, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/useAuth";
import { confirmAdminEmail } from "@/utils/adminUtils";

const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [isConfirmingEmail, setIsConfirmingEmail] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, isLoading, signIn, authError, user } = useAuth();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@tennexis.com",
      password: "admin123",
    },
  });

  // Check if user is already logged in and is admin
  useEffect(() => {
    console.log("AdminLogin auth check:", { isAdmin, isLoading, user, loginAttempted });
    
    if (!isLoading && user && isAdmin) {
      console.log("Already logged in as admin, redirecting to admin dashboard");
      navigate('/admin', { replace: true });
    }
  }, [isAdmin, isLoading, navigate, user, loginAttempted]);
  
  // Handle admin account setup
  useEffect(() => {
    const setupAdminAccount = async () => {
      try {
        if (isCreatingAdmin) return;
        
        setIsCreatingAdmin(true);
        
        const { data: userExists, error: checkError } = await supabase.auth.signInWithPassword({
          email: "admin@tennexis.com",
          password: "admin123",
        });
        
        if (checkError && checkError.message.includes("Invalid login credentials")) {
          console.log("Admin user doesn't exist, creating it...");
          
          const { data, error } = await supabase.auth.signUp({
            email: "admin@tennexis.com",
            password: "admin123",
            options: {
              data: {
                full_name: "Tennexis Admin",
                role: "tennexis_admin"
              }
            }
          });
          
          if (error) {
            console.error("Error creating admin user:", error);
            throw error;
          }
          
          if (data.user) {
            await supabase.auth.signOut();
          }
        } else if (userExists && userExists.user) {
          await supabase.auth.signOut();
        }
        
        try {
          const { error: roleError } = await supabase
            .rpc('set_user_as_admin', { input_email: 'admin@tennexis.com' });
            
          if (roleError) {
            console.error("Error setting admin role:", roleError);
          } else {
            console.log("Admin role set successfully");
          }
          
          await confirmAdminEmail('admin@tennexis.com');
        } catch (roleError) {
          console.error("Exception setting admin role:", roleError);
        }
      } catch (error: any) {
        console.error("Admin setup error:", error);
        toast({
          variant: "destructive",
          title: "Admin Setup Issue",
          description: "There was an issue with the admin account setup. You can still try to log in.",
        });
      } finally {
        setIsCreatingAdmin(false);
      }
    };
    
    setupAdminAccount();
  }, [toast]);

  const onSubmit = async (data: LoginFormValues) => {
    try {
      console.log("Attempting admin login with:", data.email);
      await signIn(data.email, data.password);
      setLoginAttempted(true);
      
      // Navigate will happen automatically in the useEffect if login is successful
    } catch (error: any) {
      console.error("Login error details:", error);
    }
  };

  const handleConfirmEmail = async () => {
    try {
      setIsConfirmingEmail(true);
      
      const success = await confirmAdminEmail(form.getValues('email'));
      
      if (!success) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to confirm email. Please try again.",
        });
      } else {
        toast({
          title: "Success",
          description: "Email confirmed successfully. Please try logging in again.",
        });
        
        try {
          await signIn(form.getValues('email'), form.getValues('password'));
          setLoginAttempted(true);
        } catch (signInError) {
          console.error("Sign in after confirmation failed:", signInError);
        }
      }
    } catch (error: any) {
      console.error("Email confirmation error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to confirm email",
      });
    } finally {
      setIsConfirmingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center mb-4">
          <span className="text-2xl font-bold text-tennis-green-600">Tennexis</span>
        </Link>
        <div className="flex items-center justify-center mb-4">
          <ShieldAlert className="h-8 w-8 text-tennis-green-600 mr-2" />
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
        </div>
        <p className="mt-2 text-center text-sm text-gray-600">
          This area is restricted to Tennexis administrators only.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {authError && authError.includes("Email not confirmed") && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>
                Your email hasn't been confirmed yet.
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full"
                  disabled={isConfirmingEmail}
                  onClick={handleConfirmEmail}
                >
                  {isConfirmingEmail ? "Confirming..." : "Confirm Email for Admin"}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {authError && !authError.includes("Email not confirmed") && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}
          
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <AlertDescription>
              <span className="font-semibold">Demo Admin Credentials:</span>
              <br />
              Email: admin@tennexis.com
              <br />
              Password: admin123
            </AlertDescription>
          </Alert>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admin Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          className="pl-10"
                          type="email"
                          placeholder="admin@tennexis.com"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
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

              <div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || isCreatingAdmin || isConfirmingEmail}
                >
                  {isLoading ? "Signing in..." : "Sign in to Admin Portal"}
                </Button>
              </div>
            </form>
          </Form>
          
          <div className="mt-6 text-center">
            <Link to="/" className="text-sm font-medium text-tennis-green-600 hover:text-tennis-green-500">
              Return to main site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
