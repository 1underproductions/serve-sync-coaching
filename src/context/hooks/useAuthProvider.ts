
import { useState, useEffect, useCallback } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, sendCustomEmail, Profile } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useAuthProvider = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchUserProfile = useCallback(async (userId?: string) => {
    try {
      const currentUserId = userId || user?.id;
      
      if (!currentUserId) {
        console.log('No user ID available to fetch profile');
        return null;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUserId)
        .single();
        
      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }
      
      if (data) {
        const profileData: Profile = {
          ...data,
          // Only set isAdmin to true if the user has a specific tennexis staff role
          role: (data.role === 'tennexis_admin' ? 'admin' : 'user') as 'user' | 'admin'
        };
        
        setProfile(profileData);
        setIsAdmin(profileData.role === 'admin');
        return profileData;
      }
      
      return null;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  }, [user?.id]);

  useEffect(() => {
    // First set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, updatedSession) => {
        console.log("Auth state changed:", event);
        
        // Always set session and user first (synchronously)
        setSession(updatedSession);
        setUser(updatedSession?.user ?? null);
        
        // Then fetch profile if needed (asynchronously)
        if (updatedSession?.user) {
          // Important: Use setTimeout to avoid potential deadlock in auth state
          setTimeout(() => {
            fetchUserProfile(updatedSession.user.id);
          }, 0);
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else if (data.session) {
          console.log('Session found on initialization:', data.session.user.id);
          setSession(data.session);
          setUser(data.session.user);
          
          // Important: Use setTimeout to avoid potential deadlock
          setTimeout(async () => {
            await fetchUserProfile(data.session.user.id);
          }, 0);
        } else {
          console.log('No session found on initialization');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata.fullName,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      if (data.user) {
        try {
          await sendCustomEmail('signup', email, {
            token_hash: data.session?.access_token,
            redirect_to: `${window.location.origin}/dashboard`,
          });
          
          toast({
            title: "Account created successfully!",
            description: "Welcome to Tennexis. Please check your email to confirm your account.",
          });
          
          navigate('/login');
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
      console.log(`Attempting to sign in with: ${email}`);
      
      // Clear previous session to avoid conflicts
      await supabase.auth.signOut();
      
      // Special handling for demo admin account
      if (email === "admin@tennexis.com") {
        console.log("Attempting to sign in with demo admin account");
        
        // First try normal sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        // If email not confirmed error, but it's the demo admin, try to proceed anyway
        if (error && error.message.includes("Email not confirmed")) {
          console.log("Demo admin email not confirmed, trying to proceed anyway");
          
          // Verify the admin account exists and has the correct role
          const { data: userData, error: userError } = await supabase.auth.admin.getUserByEmail(email);
          
          if (userError) {
            console.error("Error fetching admin user:", userError);
            throw new Error("Failed to verify admin account");
          }
          
          if (userData && userData.user) {
            // Check if this user has admin role in the profiles table
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', userData.user.id)
              .single();
              
            if (profileError) {
              console.error("Error fetching admin profile:", profileError);
              throw new Error("Failed to verify admin privileges");
            }
            
            if (profileData && profileData.role === 'tennexis_admin') {
              // For demo purposes, manually set the admin state and redirect
              setIsAdmin(true);
              setProfile({
                ...profileData,
                id: userData.user.id,
                email: email,
                full_name: "Tennexis Admin",
                role: 'admin',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
              
              toast({
                title: "Demo Admin Login",
                description: "Logged in with demo admin account.",
              });
              
              navigate('/admin');
              return;
            } else {
              throw new Error("User does not have admin privileges");
            }
          }
        } else if (error) {
          throw error;
        }
        
        if (data.session) {
          await fetchUserProfile(data.user.id);
          navigate('/admin');
          return;
        }
      }
      
      // Standard sign in for non-admin users
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        throw error;
      }

      if (!data.session) {
        throw new Error("Failed to establish a session. Please try again.");
      }

      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Sign in caught error:", error);
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error.message || "Invalid email or password",
      });
      throw error;
    } finally {
      setIsLoading(false);
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
      // First, sign up the user if they don't exist
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

      // Then, use the Supabase function to set the user as an admin
      const { error: adminError } = await supabase
        .rpc('set_user_as_admin', { email });

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
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    fetchUserProfile,
    setUserAsAdmin,
  };
};
