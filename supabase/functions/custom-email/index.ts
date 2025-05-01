
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "npm:@supabase/supabase-js";

// Initialize Supabase Admin client with service role key
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") || "https://cugwtwpgccpcjeumrkxf.supabase.co",
  Deno.env.get("SERVICE_ROLE_KEY") || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Use the environment variable or fall back to the Supabase URL
const projectUrl = Deno.env.get("PROJECT_URL") || "https://cugwtwpgccpcjeumrkxf.supabase.co";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, email, data } = await req.json();
    console.log(`Processing ${type} email for: ${email} with data:`, data);
    
    // Get the request origin to use as base URL for redirects
    const origin = req.headers.get("origin") || projectUrl;
    console.log("Request origin:", origin);
    
    // Handle various email types
    if (type === "signup") {
      // Pass the token directly through to Supabase auth verification
      const confirmUrl = `${projectUrl}/auth/v1/verify?token=${data.token_hash}&type=signup&redirect_to=${data.redirect_to}`;
      
      const emailResponse = await resend.emails.send({
        from: "Tennexis <onboarding@resend.dev>",
        to: [email],
        subject: "Welcome to Tennexis - Please Confirm Your Account",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <h1 style="color: #3b82f6; margin-bottom: 20px;">Welcome to Tennexis!</h1>
            
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              Thank you for signing up! We're excited to have you join our coaching platform. 
              To get started, please confirm your email address by clicking the button below.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmUrl}" style="display: inline-block; background-color: #3b82f6; color: white; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                Confirm My Account
              </a>
            </div>
            
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 10px;">
              Or copy and paste this URL into your browser:
            </p>
            
            <p style="font-size: 14px; line-height: 1.5; margin-bottom: 30px; word-break: break-all; color: #4a5568;">
              ${confirmUrl}
            </p>
            
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              This link will expire in 24 hours. If you didn't sign up for Tennexis, you can safely ignore this email.
            </p>
            
            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; font-size: 14px; color: #718096;">
              <p>&copy; ${new Date().getFullYear()} Tennexis. All rights reserved.</p>
              <p>
                You're receiving this email because you signed up for Tennexis, the tennis coaching platform that helps you manage your coaching business.
              </p>
            </div>
          </div>
        `,
      });

      console.log("Email sent successfully:", emailResponse);
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    if (type === "password-reset") {
      console.log("Processing password reset request for:", email);
      
      try {
        let redirectToUrl;
        
        // Ensure we have a properly formatted URL
        try {
          // Make sure reset_url is a complete URL with protocol, domain, etc.
          redirectToUrl = new URL(data.reset_url).toString();
          console.log("Reset URL is valid:", redirectToUrl);
        } catch (urlError) {
          console.error("Invalid reset URL format, constructing from origin:", urlError);
          redirectToUrl = new URL("/reset-password", origin).toString();
          console.log("Constructed fallback reset URL:", redirectToUrl);
        }
        
        // Check if the user exists first
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers({
          perPage: 1000,
          page: 1,
        });
        
        if (userError) {
          console.error("Error listing users:", userError);
          return new Response(JSON.stringify({ 
            success: false, 
            error: userError.message 
          }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }
        
        // Check if user exists
        const userExists = userData?.users?.some(user => user.email === email);
        console.log("User exists check:", userExists, "for email:", email);
        
        if (!userExists) {
          console.log("User doesn't exist, but we'll still respond as if succeeded for security");
          // We still return success to prevent user enumeration
          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }
        
        // Generate a password recovery token using the admin API
        const result = await supabaseAdmin.auth.admin.generateLink({
          type: "recovery",
          email: email,
          options: {
            // Ensure the redirectTo URL is properly encoded
            redirectTo: encodeURI(redirectToUrl)
          }
        });
        
        if (result.error || !result.data) {
          console.error("Error generating recovery link:", result.error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: result.error?.message || "Failed to generate recovery link" 
          }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }
        
        // Ensure the data structure is valid
        if (!result.data.properties || !result.data.properties.action_link) {
          console.error("Invalid token data returned:", JSON.stringify(result.data, null, 2));
          return new Response(JSON.stringify({ 
            success: false, 
            error: "Invalid token data structure returned from Supabase" 
          }), {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }
        
        // Extract the token from the action link
        const actionLink = result.data.properties.action_link;
        console.log("Generated action link:", actionLink);
        
        // Debug the action link components
        try {
          const linkUrl = new URL(actionLink);
          console.log("Action link components:", {
            protocol: linkUrl.protocol,
            hostname: linkUrl.hostname,
            pathname: linkUrl.pathname,
            search: linkUrl.search,
            hash: linkUrl.hash,
            href: linkUrl.href
          });
        } catch (urlError) {
          console.error("Action link is invalid URL:", urlError);
        }
        
        // Use the action link directly since it's already properly formatted by Supabase
        const resetUrl = actionLink;
        
        const emailResponse = await resend.emails.send({
          from: "Tennexis Support <onboarding@resend.dev>",
          to: [email],
          subject: "Reset Your Tennexis Password",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
              <h1 style="color: #3b82f6; margin-bottom: 20px;">Reset Your Password</h1>
              
              <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
                We received a request to reset your password for your Tennexis account. 
                Click the button below to create a new password.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="display: inline-block; background-color: #3b82f6; color: white; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                  Reset Password
                </a>
              </div>
              
              <p style="font-size: 16px; line-height: 1.5; margin-bottom: 10px;">
                If the button doesn't work, please copy and paste this URL into your browser:
              </p>
              
              <p style="font-size: 14px; line-height: 1.5; margin-bottom: 30px; word-break: break-all; color: #4a5568;">
                ${resetUrl}
              </p>
              
              <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
                This link will expire in 24 hours. If you didn't request a password reset, you can safely ignore this email.
              </p>
              
              <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; font-size: 14px; color: #718096;">
                <p>&copy; ${new Date().getFullYear()} Tennexis. All rights reserved.</p>
                <p>
                  You're receiving this email because a password reset was requested for your Tennexis account.
                </p>
              </div>
            </div>
          `,
        });

        console.log("Password reset email sent successfully:", emailResponse);
        
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      } catch (err) {
        console.error("Error in password reset flow:", err);
        return new Response(JSON.stringify({ 
          success: false, 
          error: err.message || "Error processing password reset" 
        }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    }
    
    if (type === "payment-link") {
      const { payment_url, coach_name, description, amount, currency, expires_in_hours } = data;
      
      const emailResponse = await resend.emails.send({
        from: "Tennexis <payments@resend.dev>",
        to: [email],
        subject: `Payment Request from ${coach_name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <img src="https://asset.brandfetch.io/idFdo8rNxK/idtYvV5iVs.jpeg" alt="Tennexis" style="max-width: 150px; margin-bottom: 20px;" />
            
            <h1 style="color: #3b82f6; margin-bottom: 20px;">Payment Request</h1>
            
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              ${coach_name} has requested a payment for your tennis coaching session.
            </p>
            
            <div style="background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <h2 style="font-size: 18px; margin-top: 0; margin-bottom: 15px; color: #2d3748;">Payment Details</h2>
              <p style="margin: 5px 0;"><strong>Description:</strong> ${description}</p>
              <p style="margin: 5px 0;"><strong>Amount:</strong> ${currency} ${amount.toFixed(2)}</p>
              <p style="margin: 5px 0;"><strong>Expires:</strong> In ${expires_in_hours || 48} hours</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${payment_url}" style="display: inline-block; background-color: #4ade80; color: white; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                Make Payment
              </a>
            </div>
            
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 10px;">
              Or copy and paste this URL into your browser:
            </p>
            
            <p style="font-size: 14px; line-height: 1.5; margin-bottom: 30px; word-break: break-all; color: #4a5568;">
              ${payment_url}
            </p>
            
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              If you have any questions about this payment, please contact your coach directly.
            </p>
            
            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; font-size: 14px; color: #718096;">
              <p>&copy; 2023 Tennexis. All rights reserved.</p>
              <p>
                You're receiving this email because you have a coaching session with ${coach_name} through Tennexis, the tennis coaching platform.
              </p>
            </div>
          </div>
        `,
      });

      console.log("Payment link email sent successfully:", emailResponse);
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    if (type === "payment-reminder") {
      const { payment_url, coach_name, session_details, amount, currency, expires_in_hours } = data;
      
      const emailResponse = await resend.emails.send({
        from: "Tennexis <payments@resend.dev>",
        to: [email],
        subject: `Payment Reminder - Action Required for Your Tennis Session`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <img src="https://asset.brandfetch.io/idFdo8rNxK/idtYvV5iVs.jpeg" alt="Tennexis" style="max-width: 150px; margin-bottom: 20px;" />
            
            <h1 style="color: #e67e22; margin-bottom: 20px;">Payment Reminder</h1>
            
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              This is a friendly reminder that your payment for the tennis session with ${coach_name} is still pending.
            </p>
            
            <div style="background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <h2 style="font-size: 18px; margin-top: 0; margin-bottom: 15px; color: #9a3412;">Important Notice</h2>
              <p style="margin: 5px 0;"><strong>Session:</strong> ${session_details}</p>
              <p style="margin: 5px 0;"><strong>Amount Due:</strong> ${currency} ${amount.toFixed(2)}</p>
              <p style="margin: 5px 0;"><strong>Time Remaining:</strong> Your reservation will expire in ${expires_in_hours} hours if payment is not received</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${payment_url}" style="display: inline-block; background-color: #f97316; color: white; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                Complete Payment Now
              </a>
            </div>
            
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 10px;">
              Or copy and paste this URL into your browser:
            </p>
            
            <p style="font-size: 14px; line-height: 1.5; margin-bottom: 30px; word-break: break-all; color: #4a5568;">
              ${payment_url}
            </p>
            
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              If you have any questions or if you no longer wish to keep this reservation, please contact your coach directly.
            </p>
            
            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; font-size: 14px; color: #718096;">
              <p>&copy; 2023 Tennexis. All rights reserved.</p>
            </div>
          </div>
        `,
      });

      console.log("Payment reminder email sent successfully:", emailResponse);
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    if (type === "session-reminder") {
      const { player_name, session_details, session_date, coach_name, location } = data;
      
      const emailResponse = await resend.emails.send({
        from: "Tennexis <reminders@resend.dev>",
        to: [email],
        subject: `Upcoming Tennis Session Reminder`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <img src="https://asset.brandfetch.io/idFdo8rNxK/idtYvV5iVs.jpeg" alt="Tennexis" style="max-width: 150px; margin-bottom: 20px;" />
            
            <h1 style="color: #3b82f6; margin-bottom: 20px;">Session Reminder</h1>
            
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              Hello ${player_name},
            </p>
            
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              This is a friendly reminder about your upcoming tennis session:
            </p>
            
            <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <h2 style="font-size: 18px; margin-top: 0; margin-bottom: 15px; color: #0369a1;">Session Details</h2>
              <p style="margin: 5px 0;"><strong>Session:</strong> ${session_details}</p>
              <p style="margin: 5px 0;"><strong>Date & Time:</strong> ${session_date}</p>
              <p style="margin: 5px 0;"><strong>Coach:</strong> ${coach_name}</p>
              <p style="margin: 5px 0;"><strong>Location:</strong> ${location}</p>
            </div>
            
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              Please arrive a few minutes early to prepare for your session. Don't forget to bring your racket, appropriate shoes, and water!
            </p>
            
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              If you need to reschedule or have any questions, please contact your coach directly.
            </p>
            
            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; font-size: 14px; color: #718096;">
              <p>&copy; 2023 Tennexis. All rights reserved.</p>
            </div>
          </div>
        `,
      });

      console.log("Session reminder email sent successfully:", emailResponse);
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    if (type === "payment-received") {
      const { amount, currency, date, payment_type, session_id } = data;
      
      const emailResponse = await resend.emails.send({
        from: "Tennexis <payments@resend.dev>",
        to: [email],
        subject: `Payment Received - Tennis Coaching ${payment_type.charAt(0).toUpperCase() + payment_type.slice(1)}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <img src="https://asset.brandfetch.io/idFdo8rNxK/idtYvV5iVs.jpeg" alt="Tennexis" style="max-width: 150px; margin-bottom: 20px;" />
            
            <h1 style="color: #4ade80; margin-bottom: 20px;">Payment Received</h1>
            
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              A payment has been successfully processed for your tennis coaching ${payment_type}.
            </p>
            
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <h2 style="font-size: 18px; margin-top: 0; margin-bottom: 15px; color: #16a34a;">Payment Details</h2>
              <p style="margin: 5px 0;"><strong>Amount:</strong> ${currency} ${amount.toFixed(2)}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(date).toLocaleString()}</p>
              <p style="margin: 5px 0;"><strong>Payment Type:</strong> ${payment_type.charAt(0).toUpperCase() + payment_type.slice(1)}</p>
              ${session_id ? `<p style="margin: 5px 0;"><strong>Session ID:</strong> ${session_id}</p>` : ''}
            </div>
            
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              Thank you for using Tennexis for your coaching business!
            </p>
            
            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; font-size: 14px; color: #718096;">
              <p>&copy; 2023 Tennexis. All rights reserved.</p>
            </div>
          </div>
        `,
      });

      console.log("Payment received email sent successfully:", emailResponse);
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Handle other email types here if needed

    return new Response(JSON.stringify({ error: "Unsupported email type" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending custom email:", error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
