import { useState, useEffect } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, sendCustomEmail, Profile } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const useAuthProvider = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check if user is admin
  const isAdmin = profile?.role === 'admin' || profile?.role === 'tennexis_admin';

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && !profile) {
          console.log('Auth state change: User available, fetching profile');
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else if (!session?.user) {
          console.log('Auth state change: No user, clearing profile');
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('Initial session: User found, fetching profile');
        fetchUserProfile(session.user.id);
      } else {
        console.log('Initial session: No user found');
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId?: string): Promise<Profile | null> => {
    try {
      const id = userId || user?.id;
      if (!id) {
        console.log('fetchUserProfile: No user ID provided');
        return null;
      }

      console.log('fetchUserProfile: Starting fetch for user:', id);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('fetchUserProfile: Database error:', error);
        // Don't throw error, just log it and return null
        return null;
      }

      console.log('fetchUserProfile: Success, received data:', data);

      // Type assertion to ensure role conforms to the expected union type
      const profileData: Profile = {
        ...data,
        role: data.role as 'user' | 'admin' | 'tennexis_admin'
      };

      setProfile(profileData);
      console.log('fetchUserProfile: Profile state updated successfully');
      return profileData;
    } catch (error) {
      console.error('fetchUserProfile: Unexpected error:', error);
      return null;
    }
  };

  const updateProfile = async (data: Partial<Profile>): Promise<Profile | null> => {
    try {
      if (!user) {
        console.error('updateProfile: No authenticated user');
        throw new Error('No authenticated user');
      }

      console.log('=== STARTING PROFILE UPDATE ===');
      console.log('updateProfile: User ID:', user.id);
      console.log('updateProfile: Data to update:', data);
      console.log('updateProfile: Current profile before update:', profile);

      // First, let's check if we can read from the profiles table
      console.log('updateProfile: Testing profile table access...');
      const { data: testRead, error: testError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (testError) {
        console.error('updateProfile: Cannot read current profile:', testError);
        throw new Error(`Profile read error: ${testError.message}`);
      } else {
        console.log('updateProfile: Current profile from DB:', testRead);
      }

      // Now try the update
      console.log('updateProfile: Attempting database update...');
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('updateProfile: Database update failed:', error);
        console.error('updateProfile: Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Profile update failed: ${error.message}`);
      }

      console.log('updateProfile: Database update successful:', updatedProfile);

      // Type assertion to ensure role conforms to the expected union type
      const profileData: Profile = {
        ...updatedProfile,
        role: updatedProfile.role as 'user' | 'admin' | 'tennexis_admin'
      };

      console.log('updateProfile: Setting new profile state:', profileData);
      setProfile(profileData);
      
      console.log('updateProfile: Profile update completed successfully');
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });

      return profileData;
    } catch (error) {
      console.error('updateProfile: Final catch block error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Error",
        description: `Failed to update profile: ${errorMessage}`,
        variant: "destructive",
      });
      return null;
    }
  };

  const signUp = async (email: string, password: string, metadata: any) => {
    try {
      setIsLoading(true);
      setAuthError(null);
      
      console.log('=== STARTING CUSTOM SIGNUP PROCESS (NO SUPABASE EMAIL) ===');
      console.log('Creating user account and sending ONLY custom email');
      
      // Step 1: Create user account using the admin endpoint to bypass email confirmation
      const { data, error } = await supabase.functions.invoke('admin-functions', {
        body: { 
          action: 'create_user_no_email',
          email: email,
          password: password,
          user_metadata: metadata
        }
      });

      if (error) {
        console.error('User creation failed:', error);
        setAuthError(error.message);
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data?.error) {
        console.error('User creation failed:', data.error);
        setAuthError(data.error);
        toast({
          title: "Signup failed",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      const userAlreadyExists = data?.already_exists;
      
      if (userAlreadyExists) {
        console.log('✅ User already exists, proceeding to send email');
      } else {
        console.log('✅ User created successfully without Supabase email');
      }
      
      console.log('Step 2: Sending ONLY our custom branded email...');

      // Step 2: Send ONLY our custom email using the verified tennexis.com domain
      try {
        await sendCustomEmail('signup', email, {
          fullName: metadata.fullName,
          redirect_to: `${window.location.origin}/auth/callback`
        });
        
        console.log('✅ SUCCESS: ONLY custom Tennexis email sent from noreply@tennexis.com!');
        
        if (userAlreadyExists) {
          toast({
            title: "Welcome back!",
            description: "We've sent you a new verification email to noreply@tennexis.com",
          });
        } else {
          toast({
            title: "Account created!",
            description: "Please check your email to verify your account. The confirmation email is from noreply@tennexis.com",
          });
        }
      } catch (emailError) {
        console.error('Custom email failed:', emailError);
        toast({
          title: "Account created!",
          description: "Your account was created but there was an issue sending the verification email. Please try resending it.",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Signup error:', error);
      setAuthError(error instanceof Error ? error.message : 'An error occurred during signup');
      toast({
        title: "Signup failed",
        description: error instanceof Error ? error.message : 'An error occurred during signup',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setAuthError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthError(error.message);
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });

    } catch (error) {
      console.error('Sign in error:', error);
      setAuthError(error instanceof Error ? error.message : 'An error occurred during sign in');
      toast({
        title: "Sign in failed",
        description: error instanceof Error ? error.message : 'An error occurred during sign in',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setProfile(null);
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Error",
        description: "An error occurred while signing out.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      setAuthError(null);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setAuthError(error.message);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Check your email",
        description: "We've sent you a password reset link.",
      });

    } catch (error) {
      console.error('Reset password error:', error);
      setAuthError(error instanceof Error ? error.message : 'An error occurred');
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setUserAsAdmin = async (email: string): Promise<SupabaseUser | null> => {
    try {
      console.log(`Setting user as admin: ${email}`);
      
      const { data, error } = await supabase.functions.invoke('admin-functions', {
        body: { 
          action: 'set_admin',
          email: email
        }
      });
      
      if (error) {
        console.error('Error setting admin:', error);
        toast({
          title: "Error",
          description: `Failed to set user as admin: ${error.message}`,
          variant: "destructive",
        });
        return null;
      }
      
      console.log('Admin set successfully:', data);
      toast({
        title: "Success",
        description: "User has been set as admin successfully.",
      });
      
      return data.user;
    } catch (error) {
      console.error('Error in setUserAsAdmin:', error);
      toast({
        title: "Error",
        description: "An error occurred while setting admin privileges.",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    session,
    user,
    profile,
    isLoading,
    isAdmin,
    authError,
    signUp: async (email: string, password: string, metadata: any) => {
      try {
        setIsLoading(true);
        setAuthError(null);
        
        console.log('=== STARTING CUSTOM SIGNUP PROCESS (NO SUPABASE EMAIL) ===');
        console.log('Creating user account and sending ONLY custom email');
        
        // Step 1: Create user account using the admin endpoint to bypass email confirmation
        const { data, error } = await supabase.functions.invoke('admin-functions', {
          body: { 
            action: 'create_user_no_email',
            email: email,
            password: password,
            user_metadata: metadata
          }
        });

        if (error) {
          console.error('User creation failed:', error);
          setAuthError(error.message);
          toast({
            title: "Signup failed",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        if (data?.error) {
          console.error('User creation failed:', data.error);
          setAuthError(data.error);
          toast({
            title: "Signup failed",
            description: data.error,
            variant: "destructive",
          });
          return;
        }

        const userAlreadyExists = data?.already_exists;
        
        if (userAlreadyExists) {
          console.log('✅ User already exists, proceeding to send email');
        } else {
          console.log('✅ User created successfully without Supabase email');
        }
        
        console.log('Step 2: Sending ONLY our custom branded email...');

        // Step 2: Send ONLY our custom email using the verified tennexis.com domain
        try {
          await sendCustomEmail('signup', email, {
            fullName: metadata.fullName,
            redirect_to: `${window.location.origin}/auth/callback`
          });
          
          console.log('✅ SUCCESS: ONLY custom Tennexis email sent from noreply@tennexis.com!');
          
          if (userAlreadyExists) {
            toast({
              title: "Welcome back!",
              description: "We've sent you a new verification email to noreply@tennexis.com",
            });
          } else {
            toast({
              title: "Account created!",
              description: "Please check your email to verify your account. The confirmation email is from noreply@tennexis.com",
            });
          }
        } catch (emailError) {
          console.error('Custom email failed:', emailError);
          toast({
            title: "Account created!",
            description: "Your account was created but there was an issue sending the verification email. Please try resending it.",
            variant: "destructive",
          });
        }

      } catch (error) {
        console.error('Signup error:', error);
        setAuthError(error instanceof Error ? error.message : 'An error occurred during signup');
        toast({
          title: "Signup failed",
          description: error instanceof Error ? error.message : 'An error occurred during signup',
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    signIn: async (email: string, password: string) => {
      try {
        setIsLoading(true);
        setAuthError(null);
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setAuthError(error.message);
          toast({
            title: "Sign in failed",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });

      } catch (error) {
        console.error('Sign in error:', error);
        setAuthError(error instanceof Error ? error.message : 'An error occurred during sign in');
        toast({
          title: "Sign in failed",
          description: error instanceof Error ? error.message : 'An error occurred during sign in',
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    signOut: async () => {
      try {
        setIsLoading(true);
        await supabase.auth.signOut();
        setProfile(null);
        toast({
          title: "Signed out",
          description: "You have been signed out successfully.",
        });
      } catch (error) {
        console.error('Sign out error:', error);
        toast({
          title: "Error",
          description: "An error occurred while signing out.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    resetPassword: async (email: string) => {
      try {
        setIsLoading(true);
        setAuthError(null);
        
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
          setAuthError(error.message);
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Check your email",
          description: "We've sent you a password reset link.",
        });

      } catch (error) {
        console.error('Reset password error:', error);
        setAuthError(error instanceof Error ? error.message : 'An error occurred');
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : 'An error occurred',
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    updateProfile,
    fetchUserProfile,
    setUserAsAdmin: async (email: string): Promise<SupabaseUser | null> => {
      try {
        console.log(`Setting user as admin: ${email}`);
        
        const { data, error } = await supabase.functions.invoke('admin-functions', {
          body: { 
            action: 'set_admin',
            email: email
          }
        });
        
        if (error) {
          console.error('Error setting admin:', error);
          toast({
            title: "Error",
            description: `Failed to set user as admin: ${error.message}`,
            variant: "destructive",
          });
          return null;
        }
        
        console.log('Admin set successfully:', data);
        toast({
          title: "Success",
          description: "User has been set as admin successfully.",
        });
        
        return data.user;
      } catch (error) {
        console.error('Error in setUserAsAdmin:', error);
        toast({
          title: "Error",
          description: "An error occurred while setting admin privileges.",
          variant: "destructive",
        });
        return null;
      }
    },
  };
};
