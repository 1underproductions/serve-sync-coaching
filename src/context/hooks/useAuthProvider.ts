import React, { useState, useEffect, useCallback } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, Profile, sendCustomEmail } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { confirmAdminEmail } from '@/utils/adminUtils';

export const useAuthProvider = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchUserProfile = useCallback(async (userId?: string) => {
    try {
      const currentUserId = userId || user?.id;
      
      if (!currentUserId) {
        console.log('No user ID available to fetch profile');
        return null;
      }
      
      console.log('Fetching profile for user:', currentUserId);
      
      // Direct query to avoid recursion
      const response = await fetch(
        `https://cugwtwpgccpcjeumrkxf.supabase.co/rest/v1/profiles?id=eq.${currentUserId}&select=*`,
        {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1Z3d0d3BnY2NwY2pldW1ya3hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNjA1MDEsImV4cCI6MjA1ODkzNjUwMX0.DjWV3Jt7OcVaJh4QYQ8NsBpPtrI1m8FJ5O3n-SHhMrk',
            'Authorization': `Bearer ${session?.access_token || ''}`,
            'Content-Type': 'application/json'
          }
        }
      );
        
      if (!response.ok) {
        console.error('Error fetching user profile:', await response.text());
        return null;
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        console.log('Profile data retrieved:', data[0]);
        
        // Update admin status based on the role field directly
        const isAdminUser = data[0].role === 'tennexis_admin';
        console.log('Setting admin status:', isAdminUser);
        setIsAdmin(isAdminUser);
        
        const profileData: Profile = {
          ...data[0],
          role: data[0].role as 'user' | 'admin'
        };
        
        setProfile(profileData);
        return profileData;
      }
      
      return null;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  }, [user?.id, session?.access_token]);

  useEffect(() => {
    console.log("Setting up auth state listener");
    // First set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, updatedSession) => {
        console.log("Auth state changed:", event, updatedSession?.user?.email);
        setAuthError(null); // Reset auth error on state change
        
        // Always set session and user first (synchronously)
        setSession(updatedSession);
        setUser(updatedSession?.user ?? null);
        
        // If no session, clear admin state
        if (!updatedSession?.user) {
          setProfile(null);
          setIsAdmin(false);
        }
        
        // Then fetch profile if needed (asynchronously)
        if (updatedSession?.user) {
          // Important: Use setTimeout to avoid potential deadlock in auth state
          setTimeout(async () => {
            try {
              await fetchUserProfile(updatedSession.user.id);
            } catch (err) {
              console.error("Error fetching profile during auth change:", err);
            } finally {
              // Check for verification confirmation events
              if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
                if (updatedSession.user.email_confirmed_at) {
                  console.log("Email confirmed at:", updatedSession.user.email_confirmed_at);
                  // Don't show a toast here since the auth callback will handle it
                }
              }
            }
          }, 0);
        }
      }
    );

    // Initialize auth state
    const initializeAuth = async () => {
      try {
        console.log("Initializing auth state");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setIsLoading(false);
          return;
        } 
        
        if (data.session) {
          console.log('Session found on initialization:', data.session.user.id);
          setSession(data.session);
          setUser(data.session.user);
          
          // Important: Use setTimeout to avoid potential deadlock
          setTimeout(async () => {
            try {
              await fetchUserProfile(data.session.user.id);
              setIsLoading(false);
            } catch (profileError) {
              console.error("Error fetching profile during initialization:", profileError);
              setIsLoading(false);
            }
          }, 0);
        } else {
          console.log('No session found on initialization');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserProfile, navigate, toast]);

  const updateProfile = async (profileData: Partial<Profile>): Promise<Profile | null> => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication error",
        description: "You must be logged in to update your profile",
      });
      return null;
    }

    try {
      console.log('Updating profile with data:', profileData, 'for user:', user.id);
      
      const { error, data } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Failed to update profile data:', error);
        toast({
          variant: "destructive",
          title: "Profile update failed",
          description: error.message || "Database error while updating profile",
        });
        throw error;
      }
      
      if (data) {
        console.log('Profile updated successfully, received data:', data);
        const updatedProfile = {
          ...data,
          role: (data.role === 'admin' ? 'admin' : 'user') as 'user' | 'admin'
        } as Profile;
        
        setProfile(updatedProfile);
        return updatedProfile;
      }

      return null;
    } catch (error: any) {
      console.error('Error in updateProfile:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, metadata: any) => {
    try {
      setIsLoading(true);
      setAuthError(null);
      
      // Set up redirection to our auth callback handler
      const redirectTo = `${window.location.origin}/auth/callback`;
      console.log("Sign up with redirect URL:", redirectTo);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata.fullName,
          },
          emailRedirectTo: redirectTo,
        },
      });

      if (error) throw error;

      if (data.user) {
        try {
          await sendCustomEmail('signup', email, {
            token_hash: data.session?.access_token,
            redirect_to: redirectTo,
          });
          
          toast({
            title: "Account created successfully!",
            description: "Welcome to Tennexis. Please check your email to confirm your account.",
          });
          
          // No navigation here - handled by the SignUp component
        } catch (emailError) {
          console.error("Error sending custom email:", emailError);
          toast({
            variant: "destructive",
            title: "Error sending confirmation email",
            description: "Your account was created, but we couldn't send a confirmation email. Please contact support.",
          });
        }
      }
    } catch (error: any) {
      setAuthError(error.message);
      toast({
        variant: "destructive",
        title: "Error creating account",
        description: error.message || "An unexpected error occurred",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setAuthError(null);
      console.log(`Attempting to sign in with: ${email}`);
      
      // Sign in with password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthError(error.message);
        console.error("Sign in error:", error);
        
        // Special handling for admin email not confirmed
        if (error.message?.includes("Email not confirmed") && email === "admin@tennexis.com") {
          console.log("Admin email not confirmed, attempting to confirm it now");
          try {
            const confirmed = await confirmAdminEmail(email);
            if (confirmed) {
              console.log("Admin email confirmed successfully, retrying login");
              // Try signing in again
              return signIn(email, password);
            }
          } catch (confirmError) {
            console.error("Error confirming admin email:", confirmError);
          }
        }
        
        throw error;
      }

      if (!data.session) {
        throw new Error("Failed to establish a session. Please try again.");
      }

      // Set session first to ensure access token is available
      setSession(data.session);
      setUser(data.user);

      console.log("Successfully signed in, fetching profile data");
      
      // Fetch user profile to determine role
      await fetchUserProfile(data.user.id);
      
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      
      // Special handling for admin users - directly navigate to admin dashboard
      if (email === "admin@tennexis.com" || profile?.role === "tennexis_admin") {
        console.log("Admin login detected, navigating to admin dashboard");
        navigate('/admin', { replace: true });
      } else {
        // For regular users, navigate to dashboard
        console.log("User login detected, navigating to dashboard");
        navigate('/dashboard', { replace: true });
      }
      
    } catch (error: any) {
      console.error("Sign in caught error:", error);
      setAuthError(error.message);
      
      // Special handling for email not confirmed
      if (error.message?.includes("Email not confirmed")) {
        toast({
          variant: "destructive",
          title: "Email not confirmed",
          description: "Please check your inbox and confirm your email before signing in.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Sign in failed",
          description: error.message || "Invalid email or password",
        });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const adminBypassEmailConfirmation = async (email: string) => {
    try {
      // Use our utility function instead of direct RPC call
      console.log("Attempting to bypass email confirmation for admin:", email);
      
      const success = await confirmAdminEmail(email);
      
      if (!success) {
        console.error("Error bypassing email confirmation");
        throw new Error("Failed to confirm email");
      }
      
      console.log("Successfully bypassed email confirmation");
      return true;
    } catch (error) {
      console.error("Failed to bypass email confirmation:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // Reset state
      setSession(null);
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      
      navigate('/login');
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to sign out",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;

      toast({
        title: "Reset email sent",
        description: "Check your inbox for instructions to reset your password.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send reset email",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setUserAsAdmin = async (email: string) => {
    try {
      // Create admin user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: 'admin123',
        options: {
          data: {
            role: 'tennexis_admin'
          }
        }
      });

      if (signUpError) {
        console.error('Error signing up admin:', signUpError);
        throw signUpError;
      }

      // Bypass email confirmation for admin
      await adminBypassEmailConfirmation(email);

      // Then, use the RPC function to set the user as an admin
      const { error: adminError } = await supabase
        .rpc('set_user_as_admin', { input_email: email });

      if (adminError) {
        console.error('Error setting user as admin:', adminError);
        throw adminError;
      }

      toast({
        title: "Admin User Created",
        description: "Super admin account has been created successfully.",
      });

      return data.user;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create admin user",
      });
      throw error;
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
