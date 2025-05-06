
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "npm:@supabase/supabase-js";

// You'll need to configure the RESEND_API_KEY in your Supabase Function secrets
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://cugwtwpgccpcjeumrkxf.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Create a Supabase client with the service role key
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  email: string;
  type: string;
  data?: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, type, data } = await req.json() as EmailRequest;
    
    if (!email || !type) {
      return new Response(
        JSON.stringify({ error: 'Email and type are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`Processing custom email request of type "${type}" for ${email}`);

    // Handle different types of emails
    if (type === 'signup') {
      // Send a custom welcome email after signup
      const { token_hash, redirect_to } = data || {};
      
      if (!token_hash) {
        return new Response(
          JSON.stringify({ error: 'Token is required for signup emails' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
      
      try {
        const emailResponse = await resend.emails.send({
          from: "Tennexis <onboarding@resend.dev>",
          to: [email],
          subject: "Welcome to Tennexis - Please Confirm Your Account",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
              <h1 style="color: #3b82f6; margin-bottom: 20px;">Welcome to Tennexis!</h1>
              
              <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
                Thank you for creating an account. To get started, please confirm your email address.
              </p>
              
              <div style="margin: 30px 0;">
                <a href="${SUPABASE_URL}/auth/v1/verify?token=${token_hash}&redirect_to=${redirect_to}"
                   style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
                  Confirm My Email
                </a>
              </div>
              
              <p style="font-size: 14px; line-height: 1.5; margin-bottom: 20px; color: #666;">
                If you didn't create this account, you can safely ignore this email.
              </p>
              
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eaeaea; font-size: 12px; color: #666;">
                <p>© ${new Date().getFullYear()} Tennexis. All rights reserved.</p>
              </div>
            </div>
          `,
        });

        console.log('Signup email sent successfully:', emailResponse);
        
        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      } catch (error) {
        console.error('Error sending signup email:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to send signup email' }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
    } 
    else if (type === 'password-reset') {
        const { reset_url } = data || {};
        
        if (!reset_url) {
          return new Response(
            JSON.stringify({ error: 'Reset URL is required for password reset emails' }),
            { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }
        
        // Create a password recovery link using the Supabase Auth API
        const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email,
          options: {
            redirectTo: reset_url,
          }
        });
        
        if (resetError) {
          console.error('Failed to generate recovery link:', resetError);
          return new Response(
            JSON.stringify({ error: resetError.message }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }
        
        const actionLink = resetData?.properties?.action_link;
        
        if (!actionLink) {
          return new Response(
            JSON.stringify({ error: 'Failed to generate recovery link' }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }
        
        try {
          const emailResponse = await resend.emails.send({
            from: "Tennexis <onboarding@resend.dev>", 
            to: [email],
            subject: "Reset Your Tennexis Password",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                <h1 style="color: #3b82f6; margin-bottom: 20px;">Reset Your Tennexis Password</h1>
                
                <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
                  We received a request to reset your password for your Tennexis account. 
                  Click the button below to reset your password. This link will expire in 24 hours.
                </p>
                
                <div style="margin: 30px 0;">
                  <a href="${actionLink}"
                     style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
                    Reset Password
                  </a>
                </div>
                
                <p style="font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
                  If you did not request a password reset, you can safely ignore this email.
                </p>
                
                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eaeaea; font-size: 12px; color: #666;">
                  <p>© ${new Date().getFullYear()} Tennexis. All rights reserved.</p>
                </div>
              </div>
            `,
          });

          console.log('Password reset email sent successfully:', emailResponse);
          
          return new Response(
            JSON.stringify({ success: true }),
            { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        } catch (error) {
          console.error('Error sending password reset email:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to send password reset email' }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }
    }

    // Handle unknown email types
    return new Response(
      JSON.stringify({ error: `Unsupported email type: ${type}` }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

serve(handler);
