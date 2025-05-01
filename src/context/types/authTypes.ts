
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { Profile } from '@/lib/supabase';

export type AuthContextType = {
  session: Session | null;
  user: SupabaseUser | null;
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  authError: string | null;
  signUp: (email: string, password: string, metadata: any) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string, resetUrl: string) => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<Profile | null>;
  fetchUserProfile: (userId?: string) => Promise<Profile | null>;
  setUserAsAdmin: (email: string) => Promise<SupabaseUser | null>;
};
