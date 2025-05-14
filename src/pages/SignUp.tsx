
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/useAuth';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EyeIcon, EyeOffIcon, Check } from 'lucide-react';

const signUpSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

const SignUp = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: SignUpFormValues) => {
    setIsLoading(true);
    try {
      const { email, password, fullName } = values;
      await signUp(email, password, { fullName });
      
      // Store email in localStorage for potential resend
      localStorage.setItem('last_signup_email', email);
      
      // Navigate to confirmation page and pass email
      navigate('/email-confirmation', { state: { email } });
    } catch (error) {
      console.error('Sign up failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center mb-6">
          <span className="text-2xl font-bold text-tennis-green-600">Tennexis</span>
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-tennis-green-600 hover:text-tennis-green-500">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" type="email" {...field} />
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
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? (
                            <EyeOffIcon className="h-4 w-4 text-gray-500" />
                          ) : (
                            <EyeIcon className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
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
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2"
                          onClick={toggleConfirmPasswordVisibility}
                        >
                          {showConfirmPassword ? (
                            <EyeOffIcon className="h-4 w-4 text-gray-500" />
                          ) : (
                            <EyeIcon className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Payment plan section */}
              <div className="border rounded-md p-4 bg-gray-50">
                <h3 className="font-semibold text-gray-800 mb-3">Start your free trial</h3>
                
                <div className="flex items-start gap-3 p-3 bg-white rounded border border-tennis-green-200 mb-3">
                  <div className="flex-shrink-0 rounded-full bg-tennis-green-100 p-1">
                    <Check className="h-4 w-4 text-tennis-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">30-day free trial</p>
                    <p className="text-sm text-gray-600">No credit card required</p>
                  </div>
                </div>
                
                <ul className="space-y-2 text-sm mb-3">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-tennis-green-600 mr-2" />
                    <span>Unlimited coaching sessions</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-tennis-green-600 mr-2" />
                    <span>Player management</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-tennis-green-600 mr-2" />
                    <span>Payment tracking</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-tennis-green-600 mr-2" />
                    <span>Cancel anytime</span>
                  </li>
                </ul>
              </div>

              <div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Create account & Start free trial'}
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                By creating an account, you agree to our{" "}
                <Link to="/terms" className="underline">Terms of Service</Link>{" "}
                and{" "}
                <Link to="/privacy-policy" className="underline">Privacy Policy</Link>.
              </p>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
