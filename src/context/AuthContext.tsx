
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { User } from '@/lib/supabase';

type AuthContextType = {
  session: Session | null;
  user: SupabaseUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, metadata: any) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, updatedSession) => {
        setSession(updatedSession);
        setUser(updatedSession?.user ?? null);
        
        // Check admin status when auth state changes
        if (updatedSession?.user) {
          setTimeout(() => {
            checkUserRole(updatedSession.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(data.session);
          setUser(data.session?.user ?? null);
          
          if (data.session?.user) {
            await checkUserRole(data.session.user.id);
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
  }, []);

  const checkUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
        
      if (!error && data) {
        setIsAdmin(data.role === 'admin');
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      setIsAdmin(false);
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
        },
      });

      if (error) throw error;

      if (data.user) {
        // Create a profile record in the profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: data.user.id,
              full_name: metadata.fullName, 
              email: email,
              role: 'user' 
            }
          ]);
          
        if (profileError) throw profileError;
          
        toast({
          title: "Account created successfully!",
          description: "Welcome to ServeSync. Your 14-day trial has started.",
        });
        
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating account",
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error.message || "Invalid email or password",
      });
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

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isLoading,
        isAdmin,
        signUp,
        signIn,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
