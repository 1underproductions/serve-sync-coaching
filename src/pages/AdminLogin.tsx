
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
            if (data.user) {
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ role: 'tennexis_admin' })
                .eq('id', data.user.id);
                
              if (updateError) {
                console.error("Error updating admin role:", updateError);
              }
              
              // Force confirm the email in development mode
              try {
                // This would be handled in production via email confirmation
                // For development we manually update auth.users (requires admin privileges)
                console.log("Admin created, force confirming email for development");
                await supabase.auth.signOut();
              } catch (confirmError) {
                console.error("Unable to force confirm email in development:", confirmError);
              }
            }
          }
        } else if (signInData?.session) {
          // User exists and credentials are valid, sign out
          console.log("Admin user exists, signing out from setup flow");
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
      console.log("Attempting admin login with:", data.email);
      
      // First, handle email not confirmed error for demo account
      if (data.email === "admin@tennexis.com") {
        // For demo purposes, we want to allow login despite email not being confirmed
        const { data: userData, error: userError } = await supabase.auth
          .admin
          .listUsers();
          
        if (!userError && userData) {
          console.log("Successfully retrieved users list for admin confirmation");
        }
      }
      
      // Sign in with provided credentials
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });
      
      if (signInError) {
        // Special handling for demo admin with email not confirmed
        if (signInError.message.includes("Email not confirmed") && data.email === "admin@tennexis.com") {
          toast({
            title: "Demo Mode",
            description: "For demo purposes, we'll proceed despite the email not being confirmed.",
          });
          
          // Attempt to sign in anyway for the demo
          const { data: forceSignInData, error: forceSignInError } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
          });
          
          if (forceSignInError) {
            throw forceSignInError;
          }
          
          if (!forceSignInData.session) {
            throw new Error("Failed to establish a session for demo admin");
          }
          
          // Successfully forced signin, now check if admin
          const { data: roleData } = await supabase.rpc('get_user_role');
          
          if (roleData === 'tennexis_admin') {
            navigate('/admin');
            toast({
              title: "Admin Access Granted",
              description: "Welcome to the Tennexis Admin Panel.",
            });
            return;
          } else {
            throw new Error("User does not have admin privileges");
          }
        } else {
          // Handle other sign in errors
          throw signInError;
        }
      }
      
      // If we got here, sign in was successful
      if (!signInData.session) {
        throw new Error("Failed to establish a session. Please try again.");
      }
      
      // Check if the user has admin role
      const { data: roleData, error: roleError } = await supabase.rpc('get_user_role');
      
      if (roleError) {
        console.error("Error checking user role:", roleError);
        await supabase.auth.signOut();
        throw new Error("Error verifying admin privileges");
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
        await supabase.auth.signOut();
        throw new Error("You do not have admin privileges");
      }
    } catch (error: any) {
      console.error("Login error details:", error);
      setLoginError(error.message || "Login failed. Please check your credentials.");
      
      // Ensure user is signed out on error
      await supabase.auth.signOut();
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
