
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
        
        // First check if admin user exists in profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', 'admin@tennexis.com')
          .single();
          
        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist, create admin user
          console.log("Admin profile doesn't exist, creating it...");
          
          // Create user through auth API
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
            
            // Ensure profile exists with admin role
            if (data.user) {
              // Manual DB insert for the profile with tennexis_admin role
              const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                  id: data.user.id,
                  email: "admin@tennexis.com",
                  full_name: "Tennexis Admin",
                  role: "tennexis_admin"
                });
                
              if (insertError) {
                console.error("Error creating admin profile:", insertError);
              } else {
                console.log("Admin profile created successfully with tennexis_admin role");
              }
            }
          }
        } else if (profileData) {
          console.log("Admin profile already exists:", profileData);
          
          // Force update the role to tennexis_admin regardless of current value
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: 'tennexis_admin' })
            .eq('email', 'admin@tennexis.com');
            
          if (updateError) {
            console.error("Error updating admin role:", updateError);
          } else {
            console.log("Successfully updated existing profile to tennexis_admin role");
          }
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
      
      // Special handling for demo admin account
      if (data.email === "admin@tennexis.com" && data.password === "admin123") {
        console.log("Using demo admin flow");
        
        // First update the admin role in the profiles table to ensure it's correct
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'tennexis_admin' })
          .eq('email', 'admin@tennexis.com');
          
        if (updateError) {
          console.error("Error updating admin role before login:", updateError);
          throw new Error("Failed to prepare admin account. Please try again.");
        }
        
        // Now verify that the profile has the correct role
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', 'admin@tennexis.com')
          .single();
        
        if (profileError) {
          console.error("Error fetching admin profile:", profileError);
          throw new Error("Admin account verification failed. Please try again later.");
        }
        
        console.log("Verified profile after update:", profileData);
        
        // Ensure profile has tennexis_admin role before allowing login
        if (!profileData || profileData.role !== 'tennexis_admin') {
          console.error("Profile found but role is still not tennexis_admin:", profileData?.role);
          throw new Error("Failed to set admin privileges. Please contact support.");
        }
        
        // After verifying role, proceed to admin dashboard
        console.log("Admin role verified, proceeding to dashboard");
        toast({
          title: "Admin Demo Login",
          description: "Logged in with demo admin account successfully.",
        });
        
        navigate('/admin');
        return;
      }
      
      // Regular login flow for non-demo admin accounts
      // Clear any existing session first
      await supabase.auth.signOut();
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });
      
      if (authError) {
        throw authError;
      }
      
      if (authData && authData.user) {
        // Check if user has admin role
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .single();
          
        if (profileError) {
          throw new Error("Error fetching user profile");
        }
        
        if (profileData && profileData.role === 'tennexis_admin') {
          toast({
            title: "Admin Login Successful",
            description: "Welcome to the admin panel.",
          });
          
          navigate('/admin');
        } else {
          // User is not an admin, sign them out
          await supabase.auth.signOut();
          throw new Error("User does not have admin privileges");
        }
      }
    } catch (error: any) {
      console.error("Login error details:", error);
      
      // Handle email not confirmed error for demo admin
      if (error.message && error.message.includes("Email not confirmed") && 
          data.email === "admin@tennexis.com") {
        console.log("Email not confirmed for demo admin, attempting bypass");
        
        // Force update the role to tennexis_admin
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'tennexis_admin' })
          .eq('email', 'admin@tennexis.com');
          
        if (updateError) {
          console.error("Error updating role for bypass:", updateError);
          throw new Error("Failed to set admin privileges");
        }
        
        console.log("Updated admin role, now checking if it worked");
        
        // Verify the update worked
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', 'admin@tennexis.com')
          .single();
          
        if (profileError) {
          console.error("Error verifying admin role update:", profileError);
          throw new Error("Admin verification failed");
        }
        
        console.log("Verified profile after update in error handler:", profileData);
        
        if (profileData && profileData.role === 'tennexis_admin') {
          // After verifying admin role, allow bypass
          toast({
            title: "Demo Admin Login",
            description: "Bypassing email confirmation for demo admin account.",
          });
          
          navigate('/admin');
          return;
        } else {
          throw new Error("Failed to verify admin role. Got: " + profileData?.role);
        }
      }
      
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
