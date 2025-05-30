
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Initialize Supabase client with service role key for admin operations
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://cugwtwpgccpcjeumrkxf.supabase.co";

const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("=== ADMIN FUNCTIONS CALLED ===");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, email, password, user_metadata } = await req.json();
    console.log(`Processing admin action: ${action} for email: ${email}`);

    if (action === 'create_user_no_email') {
      console.log("=== CREATING USER WITHOUT EMAIL CONFIRMATION ===");
      
      // Create user using admin client - this bypasses email confirmation
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        user_metadata: user_metadata,
        email_confirm: true // This marks the email as already confirmed
      });

      if (error) {
        console.error('Error creating user:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      console.log('✅ User created successfully without email confirmation required');
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          user: data.user,
          message: "User created successfully without Supabase email"
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (action === 'set_admin') {
      console.log("=== SETTING USER AS ADMIN ===");
      
      // Get user by email
      const { data: users, error: getUserError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (getUserError) {
        console.error('Error getting users:', getUserError);
        return new Response(
          JSON.stringify({ error: getUserError.message }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      const user = users.users.find(u => u.email === email);
      
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          {
            status: 404,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Update user metadata to set as admin
      const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        {
          user_metadata: {
            ...user.user_metadata,
            role: 'tennexis_admin'
          }
        }
      );

      if (updateError) {
        console.error('Error updating user:', updateError);
        return new Response(
          JSON.stringify({ error: updateError.message }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Also update the profiles table
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: user.id,
          role: 'tennexis_admin',
          email: email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.fullName
        });

      if (profileError) {
        console.error('Error updating profile:', profileError);
      }

      console.log('✅ User set as admin successfully');
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          user: updatedUser.user,
          message: "User set as admin successfully"
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error) {
    console.error("Error in admin functions:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An error occurred' }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
