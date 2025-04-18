
import { supabase } from "@/integrations/supabase/client";

export const createSuperAdmin = async (email: string, password: string) => {
  try {
    // Sign up the user
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
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

    // Set user as admin using the Supabase function
    const { error: adminError } = await supabase
      .rpc('set_user_as_admin', { email });

    if (adminError) {
      console.error('Error setting user as admin:', adminError);
      throw adminError;
    }

    return data.user;
  } catch (error) {
    console.error('Failed to create super admin:', error);
    throw error;
  }
};
