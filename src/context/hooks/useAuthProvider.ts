
import { useState, useEffect, useCallback } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, sendCustomEmail } from '@/lib/supabase';
import { Profile } from '@/lib/supabase';
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

  // Define fetchUserProfile as a useCallback to avoid recreating it on every render
  const fetchUserProfile = useCallback(async (userId?: string) => {
    try {
      // If no userId is provided, use the current user's ID
      const currentUserId = userId || user?.id;
      
      if (!currentUserId) {
        console.log('No user ID available to fetch profile');
        return;
      }
      
      console.log('Fetching user profile for id:', currentUserId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUserId)
        .single();
        
      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }
      
      if (data) {
        console.log('User profile fetched successfully:', data);
        // Ensure role is properly cast to the expected type
        const profileData: Profile = {
          ...data,
          role: (data.role === 'admin' ? 'admin' : 'user') as 'user' | 'admin'
        };
        
        setProfile(profileData);
        setIsAdmin(profileData.role === 'admin');
        return profileData;
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
    return null;
  }, [user?.id]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, updatedSession) => {
        console.log("Auth state changed:", event);
        setSession(updatedSession);
        setUser(updatedSession?.user ?? null);
        
        if (updatedSession?.user) {
          // Use setTimeout to avoid potential auth deadlocks
          setTimeout(() => {
            fetchUserProfile(updatedSession.user.id);
          }, 0);
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
      }
    );

    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(data.session);
          setUser(data.session?.user ?? null);
          
          if (data.session?.user) {
            await fetchUserProfile(data.session.user.id);
          }
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

  const updateProfile = async (profileData: Partial<Profile>) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication error",
        description: "You must be logged in to update your profile",
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log('Updating profile with data:', profileData);
      
      // For debugging avatar uploads
      if (profileData.avatar_url) {
        console.log('Updating avatar, data length:', profileData.avatar_url.length);
      }
      
      let updatedProfile;
      
      try {
        // First try to update using RPC to bypass RLS for avatar updates
        if (profileData.avatar_url) {
          const { error } = await supabase.rpc('update_user_avatar', { 
            new_avatar_url: profileData.avatar_url 
          });
          
          if (error) throw error;
          
          // Remove avatar_url from profileData since it's already updated
          const { avatar_url, ...otherProfileData } = profileData;
          profileData = otherProfileData;
        }
        
        // Only proceed with standard update if there are other fields to update
        if (Object.keys(profileData).length > 0) {
          const { error, data } = await supabase
            .from('profiles')
            .update(profileData)
            .eq('id', user.id)
            .select()
            .single();

          if (error) throw error;
          updatedProfile = data;
        }
        
        // If we don't have the updated profile yet (only avatar was updated),
        // fetch the fresh profile
        if (!updatedProfile) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (error) throw error;
          updatedProfile = data;
        }
        
      } catch (error: any) {
        console.error('Failed to update profile:', error);
        throw error;
      }

      console.log('Profile updated successfully. Response:', updatedProfile);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });

      // Update local state with the fresh profile data
      if (updatedProfile) {
        const profileData: Profile = {
          ...updatedProfile,
          role: (updatedProfile.role === 'admin' ? 'admin' : 'user') as 'user' | 'admin'
        };
        setProfile(profileData);
      } else {
        // If no updated profile was returned, fetch it again
        await fetchUserProfile(user.id);
      }
      
    } catch (error: any) {
      console.error('Error in updateProfile:', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "Failed to update profile",
      });
      throw error;
    } finally {
      setIsLoading(false);
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
        // Send custom confirmation email
        try {
          await sendCustomEmail('signup', email, {
            token_hash: data.session?.access_token,
            redirect_to: `${window.location.origin}/dashboard`,
          });
          
          toast({
            title: "Account created successfully!",
            description: "Welcome to Tennexis. Please check your email to confirm your account.",
          });
          
          // Don't navigate to dashboard yet since we need email confirmation
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        throw error;
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
  };
};
