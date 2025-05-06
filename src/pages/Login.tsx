
import { useState } from "react";
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
import { Mail, Lock } from "lucide-react";
import { useAuth } from "@/context/useAuth";

const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long.",
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, isLoading, authError } = useAuth();
  const [showError, setShowError] = useState<string | null>(null);
  
  // Get the return path from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || "/dashboard";
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setShowError(null);
    
    try {
      await signIn(data.email, data.password);
      console.log("Login successful, redirecting to:", from);
      
      // Navigate to the dashboard or the page they were trying to access
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error("Login error:", error);
      setShowError(error.message || "Failed to sign in. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center mb-4">
          <span className="text-2xl font-bold text-tennis-green-600">Tennexis</span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <Link
            to="/signup"
            className="font-medium text-tennis-green-600 hover:text-tennis-green-500"
          >
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {showError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {showError}
            </div>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          className="pl-10"
                          type="email"
                          placeholder="coach@example.com"
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
                    <div className="flex justify-between">
                      <FormLabel></FormLabel>
                      <Link
                        to="/forgot-password"
                        className="text-sm font-medium text-tennis-green-600 hover:text-tennis-green-500"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          className="pl-10"
                          type="password"
                          autoComplete="current-password"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <div className="text-sm">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-tennis-green-600 hover:text-tennis-green-500"
              >
                Sign up
              </Link>
            </div>
          </div>

          {/* Add navigation links for development purposes */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Quick Navigation Links:</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/dashboard" className="text-sm text-tennis-green-600 hover:underline">Dashboard</Link>
              <Link to="/schedule" className="text-sm text-tennis-green-600 hover:underline">Schedule</Link>
              <Link to="/players" className="text-sm text-tennis-green-600 hover:underline">Players</Link>
              <Link to="/payments" className="text-sm text-tennis-green-600 hover:underline">Payments</Link>
              <Link to="/analytics" className="text-sm text-tennis-green-600 hover:underline">Analytics</Link>
              <Link to="/settings" className="text-sm text-tennis-green-600 hover:underline">Settings</Link>
              <Link to="/profile" className="text-sm text-tennis-green-600 hover:underline">Profile</Link>
              <Link to="/admin" className="text-sm text-tennis-green-600 hover:underline">Admin</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
