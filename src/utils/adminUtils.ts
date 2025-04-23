
import { supabase } from "@/integrations/supabase/client";

/**
 * Confirms an admin email directly using the admin_confirm_email function
 * This bypasses email confirmation for admin accounts
 */
export const confirmAdminEmail = async (email: string): Promise<boolean> => {
  try {
    console.log("Confirming admin email for:", email);
    
    // Call the revised database function with boolean return type
    const { data, error } = await supabase.rpc(
      'admin_confirm_email',
      { admin_email: email }
    );
    
    if (error) {
      console.error("Error confirming admin email:", error);
      return false;
    }
    
    console.log("Admin email confirmation result:", data);
    return !!data; // Convert to boolean if needed
  } catch (error) {
    console.error("Exception in confirmAdminEmail:", error);
    return false;
  }
};

/**
 * Safely access waitlist data as an admin without triggering RLS recursion
 */
export const fetchWaitlistAsAdmin = async (): Promise<{ data: any, error: any }> => {
  try {
    console.log("Fetching waitlist data as admin...");
    // Call the safe RPC function for admin access
    const response = await supabase.rpc('admin_access_waitlist');
    return response;
  } catch (error) {
    console.error("Exception in fetchWaitlistAsAdmin:", error);
    return { data: null, error };
  }
};
