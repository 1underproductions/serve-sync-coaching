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
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@tennexis.com",
      password: "admin123",
    },
  });

  useEffect(() => {
    const createAdminUser = async () => {
      try {
        setIsCreatingAdmin(true);
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', 'admin@tennexis.com')
          .single();
          
        if (profileError && profileError.code === 'PGRST116') {
          console.log("Admin profile doesn't exist, creating it...");
          
          const { data, error } = await supabase.auth.signUp({
            email: "admin@tennexis.com",
            password: "admin123",
            options: {
              data: {
                full_name: "Tennexis Admin",
              }
            }
          });
          
          if (error) {
            console.error("Error creating admin user:", error);
            throw error;
          }
          
          if (data.user) {
            const { error: roleError } = await supabase
              .rpc('set_user_as_admin', { input_email: 'admin@tennexis.com' });
              
            if (roleError) {
              console.error("Error setting admin role:", roleError);
              throw roleError;
            }
          }
        } else if (profileData) {
          const { error: roleError } = await supabase
            .rpc('set_user_as_admin', { input_email: 'admin@tennexis.com' });
            
          if (roleError) {
            console.error("Error setting admin role:", roleError);
            throw roleError;
          }
        }
      } catch (error: any) {
        console.error("Admin setup error:", error);
        toast({
          variant: "destructive",
          title: "Admin Setup Failed",
          description: error.message || "Could not prepare admin account",
        });
      } finally {
        setIsCreatingAdmin(false);
      }
    };
    
    createAdminUser();
  }, []);

  const onSubmit = async (data: LoginFormValues) => {
    setLoginError(null);
    
    try {
      if (data.email === "admin@tennexis.com" && data.password === "admin123") {
        console.log("Attempting demo admin login");
        
        await supabase.auth.signOut();
        
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password
        });
        
        if (authError) {
          console.error("Demo admin login error:", authError);
          throw authError;
        }
        
        const { error: roleError } = await supabase
          .rpc('set_user_as_admin', { input_email: data.email });
          
        if (roleError) {
          console.error("Role setting error:", roleError);
          throw new Error("Failed to set admin privileges");
        }
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('email', data.email)
          .single();
          
        if (profileError || !profileData) {
          throw new Error("Could not verify admin profile");
        }
        
        console.log("Admin profile role:", profileData.role);
        
        toast({
          title: "Admin Login",
          description: "Successfully logged in with admin account",
        });
        
        navigate('/admin');
        return;
      }
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .single();
          
        if (profileError) throw profileError;
        
        if (profileData && profileData.role === 'tennexis_admin') {
          toast({
            title: "Admin Login Successful",
            description: "Welcome to the admin panel.",
          });
          
          navigate('/admin');
        } else {
          await supabase.auth.signOut();
          throw new Error("User does not have admin privileges");
        }
      }
    } catch (error: any) {
      console.error("Login error details:", error);
      
      setLoginError(error.message || "Login failed. Please check your credentials.");
      
      toast({
        variant: "destructive",
        title: "Login Error",
        description: error.message || "Could not log in",
      });
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
