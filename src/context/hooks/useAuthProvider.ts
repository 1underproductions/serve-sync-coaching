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
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else if (!session?.user) {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId?: string): Promise<Profile | null> => {
    try {
      const id = userId || user?.id;
      if (!id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      // Type assertion to ensure role conforms to the expected union type
      const profileData: Profile = {
        ...data,
        role: data.role as 'user' | 'admin' | 'tennexis_admin'
      };

      setProfile(profileData);
      return profileData;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  const signUp = async (email: string, password: string, metadata: any) => {
    try {
      setIsLoading(true);
      setAuthError(null);
      
      console.log('=== STARTING CUSTOM SIGNUP PROCESS ===');
      console.log('Step 1: Creating user with Supabase (no email confirmation required)');
      
      // Step 1: Create user with Supabase but disable email confirmation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          // Don't send confirmation email from Supabase
          emailRedirectTo: undefined,
        }
      });

      if (error) {
        console.error('Supabase user creation failed:', error);
        
        // Handle specific error cases
        if (error.message.includes('User already registered')) {
          setAuthError('An account with this email already exists. Please try signing in instead.');
          toast({
            title: "Account exists",
            description: "An account with this email already exists. Please try signing in instead.",
            variant: "destructive",
          });
          return;
        }
        
        setAuthError(error.message);
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      console.log('✅ User created successfully via Supabase');
      console.log('Step 2: Sending ONLY our custom branded email...');

      // Step 2: Send ONLY our custom email using the verified tennexis.com domain
      try {
        await sendCustomEmail('signup', email, {
          fullName: metadata.fullName,
          redirect_to: `${window.location.origin}/auth/callback`
        });
        
        console.log('✅ SUCCESS: ONLY custom Tennexis email sent from noreply@tennexis.com!');
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account. The confirmation email is from noreply@tennexis.com",
        });
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

  const updateProfile = async (data: Partial<Profile>): Promise<Profile | null> => {
    try {
      if (!user) throw new Error('No authenticated user');

      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Type assertion to ensure role conforms to the expected union type
      const profileData: Profile = {
        ...updatedProfile,
        role: updatedProfile.role as 'user' | 'admin' | 'tennexis_admin'
      };

      setProfile(profileData);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });

      return profileData;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
      return null;
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
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    fetchUserProfile,
    setUserAsAdmin,
  };
};
