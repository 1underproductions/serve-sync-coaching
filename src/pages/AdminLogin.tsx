
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
import { useAuth } from "@/context/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";

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
  const { signIn, isLoading, isAdmin } = useAuth();
  
  // Pre-fill admin credentials for testing
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@tennexis.com",
      password: "admin123",
    },
  });

  useEffect(() => {
    // Create a demo admin user in the database if it doesn't exist
    const createAdminUser = async () => {
      try {
        setIsCreatingAdmin(true);
        
        // First check if admin user exists by trying to sign in
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: "admin@tennexis.com",
          password: "admin123"
        });
        
        if (signInError && signInError.message.includes("Invalid login credentials")) {
          // Admin doesn't exist, create it
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
          } else {
            console.log("Admin user created successfully");
            
            // Update the user's role in the profiles table
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ role: 'tennexis_admin' })
              .eq('id', data.user?.id);
              
            if (updateError) {
              console.error("Error updating admin role:", updateError);
            }
          }
        } else if (!signInError) {
          // User exists and credentials are valid, sign out
          await supabase.auth.signOut();
        }
      } catch (error) {
        console.error("Error in admin setup:", error);
      } finally {
        setIsCreatingAdmin(false);
      }
    };
    
    createAdminUser();
  }, []);

  const onSubmit = async (data: LoginFormValues) => {
    setLoginError(null);
    
    try {
      // Try to sign in
      await signIn(data.email, data.password);
      
      // Wait a moment for auth state to update
      setTimeout(async () => {
        // Get the current session to check user role
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData.session) {
          // Check if the user has admin role using RPC
          const { data: roleData, error: roleError } = await supabase
            .rpc('get_user_role');
            
          if (roleError) {
            console.error("Error checking user role:", roleError);
            setLoginError("Error verifying admin privileges. Please try again.");
            await supabase.auth.signOut();
            return;
          }
          
          if (roleData === 'tennexis_admin') {
            // User is an admin, redirect to admin dashboard
            navigate('/admin');
            toast({
              title: "Welcome to Tennexis Admin Panel",
              description: "You have successfully logged in as an administrator.",
            });
          } else {
            // User is not an admin, show error and sign out
            setLoginError("You do not have admin privileges. This area is restricted to Tennexis administrators only.");
            await supabase.auth.signOut();
          }
        }
      }, 500);
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
                  disabled={isLoading || isCreatingAdmin}
                >
                  {isLoading ? "Signing in..." : (isCreatingAdmin ? "Setting up admin..." : "Sign in to Admin Portal")}
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
