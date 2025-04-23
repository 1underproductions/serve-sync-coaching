
import { supabase } from "@/integrations/supabase/client";

/**
 * Confirms an admin email directly using raw SQL
 * This is a workaround to avoid TypeScript errors with RPC functions
 */
export const confirmAdminEmail = async (email: string): Promise<boolean> => {
  try {
    console.log("Confirming admin email for:", email);
    
    // Skip the problematic profile lookup and directly execute the RPC
    // This avoids the infinite recursion in policies
    const { error } = await supabase.rpc(
      'admin_confirm_email' as any, 
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
