
import { supabase } from "@/integrations/supabase/client";

/**
 * Confirms an admin email directly using the admin_confirm_email function
 * This bypasses email confirmation for admin accounts
 */
export const confirmAdminEmail = async (email: string): Promise<boolean> => {
  try {
    console.log("Confirming admin email for:", email);
    
    // Call the database function directly without any profile lookups
    // This avoids the infinite recursion in policies
    const { error } = await supabase.rpc(
      'admin_confirm_email',
      { admin_email: email }
    );
    
    if (error) {
      console.error("Error confirming admin email:", error);
      return false;
    }
    
    console.log("Successfully confirmed admin email");
    return true;
  } catch (error) {
    console.error("Exception in confirmAdminEmail:", error);
    return false;
  }
};
