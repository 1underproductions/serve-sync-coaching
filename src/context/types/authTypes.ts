
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { Profile } from '@/lib/supabase';

export type AuthContextType = {
  session: Session | null;
  user: SupabaseUser | null;
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, metadata: any) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  fetchUserProfile: (userId?: string) => Promise<Profile | null>;
};
