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
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, isLoading, signIn } = useAuth();
  
  useEffect(() => {
    // Debug output to help trace auth issues
    console.log("AdminLogin auth state:", { isAdmin, isLoading });
    
    if (!isLoading && isAdmin) {
      console.log("User is already an admin, redirecting to admin panel");
      navigate('/admin');
    }
  }, [isAdmin, isLoading, navigate]);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@tennexis.com",
      password: "admin123",
    },
  });

  useEffect(() => {
    const setupAdminAccount = async () => {
      try {
        setIsCreatingAdmin(true);
        
        // First check if the admin user already exists
        const { data: userExists, error: checkError } = await supabase.auth.signInWithPassword({
          email: "admin@tennexis.com",
          password: "admin123",
        });
        
        // If user doesn't exist, create them
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
          
          // Sign out after creation to avoid automatic login
          if (data.user) {
            await supabase.auth.signOut();
          }
        } else if (userExists && userExists.user) {
          // Sign out again to not stay logged in
          await supabase.auth.signOut();
        }
        
        // Always try to set the user as admin regardless of whether they're new or existing
        try {
          const { error: roleError } = await supabase
            .rpc('set_user_as_admin', { input_email: 'admin@tennexis.com' });
            
          if (roleError) {
            console.error("Error setting admin role:", roleError);
          } else {
            console.log("Admin role set successfully");
          }
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
    setLoginError(null);
    
    try {
      console.log("Attempting admin login with:", data.email);
      await signIn(data.email, data.password);
      // The redirection is handled in the signIn function
    } catch (error: any) {
      console.error("Login error details:", error);
      setLoginError(error.message || "Login failed. Please check your credentials.");
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
          {loginError && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{loginError}</AlertDescription>
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
                  disabled={isCreatingAdmin}
                >
                  {isCreatingAdmin ? "Setting up admin..." : "Sign in to Admin Portal"}
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
