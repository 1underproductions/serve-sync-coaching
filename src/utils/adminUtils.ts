
import { supabase } from "@/integrations/supabase/client";

/**
 * Confirms an admin email directly using raw SQL
 * This is a workaround to avoid TypeScript errors with RPC functions
 */
export const confirmAdminEmail = async (email: string): Promise<boolean> => {
  try {
    console.log("Confirming admin email for:", email);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();
      
    if (error || !data) {
      console.error("Error finding user profile:", error);
      return false;
    }
    
    // Execute raw SQL to confirm email
    const { error: sqlError } = await supabase.rpc(
      'admin_confirm_email' as any, 
      { admin_email: email }
    );
    
    if (sqlError) {
      console.error("Error confirming admin email:", sqlError);
      return false;
    }
    
    console.log("Successfully confirmed admin email");
    return true;
  } catch (error) {
    console.error("Exception in confirmAdminEmail:", error);
    return false;
  }
};
