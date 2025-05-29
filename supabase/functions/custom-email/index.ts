
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// Initialize Resend client with API key
const resendApiKey = Deno.env.get("RESEND_API_KEY");

if (!resendApiKey) {
  console.error("CRITICAL ERROR: RESEND_API_KEY is not set in environment variables");
}

// Log API key status (safely)
console.log(`Resend API key status: ${resendApiKey ? 'Provided' : 'MISSING!'}`);

// Get the Supabase project URL from environment variables or use the default
const projectUrl = Deno.env.get("PROJECT_URL") || "https://cugwtwpgccpcjeumrkxf.supabase.co";
console.log("Project URL set to:", projectUrl);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Helper function to send emails via Resend
async function sendResendEmail(to: string, subject: string, html: string, from: string) {
  if (!resendApiKey) {
    throw new Error("Resend configuration is incomplete. Missing API key.");
  }
  
  const resend = new Resend(resendApiKey);
  
  try {
    console.log(`Sending email to ${to} via Resend...`);
    console.log(`From: ${from}`);
    console.log(`Subject: ${subject}`);
    
    const response = await resend.emails.send({
      from: from,
      to: [to],
      subject: subject,
      html: html
    });
    
    console.log("Resend API response:", JSON.stringify(response, null, 2));
    
    if (response.error) {
      console.error("Resend API returned an error:", response.error);
      throw new Error(`Resend API error: ${response.error.message || 'Unknown error'}`);
    }
    
    console.log(`Email successfully sent to ${to}. Message ID: ${response.data?.id || 'No ID returned'}`);
    return response;
  } catch (error) {
    console.error("Error sending email via Resend:", error);
    throw error;
  }
}

serve(async (req) => {
  console.log("Request received to custom-email function");
  console.log("Request URL:", req.url);
  console.log("Request method:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request (CORS preflight)");
    return new Response(null, { headers: corsHeaders });
  }

  // Extract the path from the URL to determine if it's the test-resend endpoint
  const url = new URL(req.url);
  console.log("Full URL pathname:", url.pathname);
  
  // Check if this is the test-resend endpoint
  const isTestResendEndpoint = url.pathname.includes('test-resend');
  console.log("Is test-resend endpoint:", isTestResendEndpoint);
  
  // Handle test-resend endpoint
  if (isTestResendEndpoint) {
    console.log("Resend test endpoint called");
    
    try {
      // Check if Resend is configured
      if (!resendApiKey) {
        console.error("Missing Resend configuration for test");
        return new Response(
          JSON.stringify({
            success: false,
            error: "Resend is not configured correctly. Missing API key.",
            config: {
              apiKeyExists: !!resendApiKey
            }
          }),
          {
            status: 200,
            headers: { 
              "Content-Type": "application/json", 
              ...corsHeaders 
            },
          }
        );
      }
      
      // Test Resend configuration by checking the API key format
      const resend = new Resend(resendApiKey);
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "Resend appears to be configured correctly",
          config: {
            apiKeyExists: !!resendApiKey,
            apiKeyLength: resendApiKey.length
          },
          important_notes: [
            "Make sure to use a verified domain in your from address",
            "Check your domain verification status in Resend dashboard",
            "Monitor Resend logs at https://resend.com/emails for delivery status"
          ]
        }),
        {
          status: 200,
          headers: { 
            "Content-Type": "application/json", 
            ...corsHeaders 
          },
        }
      );
    } catch (error) {
      console.error("Error in test-resend endpoint:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : String(error)
        }),
        {
          status: 200,
          headers: { 
            "Content-Type": "application/json", 
            ...corsHeaders 
          },
        }
      );
    }
  }

  // Regular email sending endpoint
  try {
    const { type, email, data } = await req.json();
    console.log(`Processing ${type} email request for ${email}`);
    console.log("Request data:", JSON.stringify(data, null, 2));
    
    // Validate Resend configuration
    if (!resendApiKey) {
      console.error("CRITICAL ERROR: Cannot send email - Resend configuration is not complete");
      throw new Error("Email service is not properly configured. Please contact support.");
    }
    
    // IMPORTANT: Use a verified domain for the from address
    // Replace 'yourverifieddomain.com' with your actual verified domain
    // For testing, you can temporarily use onboarding@resend.dev, but this should be changed
    const fromAddress = `Tennexis <onboarding@resend.dev>`;
    
    console.log(`Using from address: ${fromAddress}`);
    console.log("⚠️ WARNING: Using default Resend domain. Please update to your verified domain!");
    
    // Handle various email types
    if (type === "signup") {
      console.log("Signup email request received:", { email, data });
      
      if (!data || typeof data !== 'object') {
        throw new Error("Invalid data provided for email");
      }
      
      // Get the redirect URL
      let redirect_to = data.redirect_to || `${projectUrl}/auth/callback`;
      console.log("Initial redirect_to:", redirect_to);
      
      // Ensure redirect URL is properly formatted
      if (!redirect_to.startsWith('http')) {
        const appUrl = req.headers.get('origin') || projectUrl;
        redirect_to = `${appUrl.replace(/\/$/, "")}${redirect_to.startsWith('/') ? '' : '/'}${redirect_to}`;
        console.log("Modified redirect_to with origin:", redirect_to);
      }
      
      // For signup emails, we'll create a magic link for email verification
      console.log("Generating magic link for signup verification");
      
      // Get origin for better redirect experience
      const origin = req.headers.get('origin') || req.headers.get('referer') || projectUrl;
      console.log("Using origin:", origin);
      
      const redirectUrl = `${origin.replace(/\/$/, "")}/auth/callback`;
      console.log("Redirect URL for magic link:", redirectUrl);
      
      // Create a proper Supabase auth magic link
      const magicLinkUrl = `${projectUrl}/auth/v1/magiclink?email=${encodeURIComponent(email)}&redirect_to=${encodeURIComponent(redirectUrl)}`;
      console.log("Generated magic link URL:", magicLinkUrl);
      
      try {
        console.log("Sending signup confirmation email via Resend");
        const emailResponse = await sendResendEmail(
          email,
          "Welcome to Tennexis - Please Confirm Your Account",
          `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
              <h1 style="color: #3b82f6; margin-bottom: 20px;">Welcome to Tennexis!</h1>
              
              <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
                Thank you for signing up! We're excited to have you join our coaching platform. 
                To get started, please confirm your email address by clicking the button below.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${magicLinkUrl}" style="display: inline-block; background-color: #3b82f6; color: white; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                  Confirm My Account
                </a>
              </div>
              
              <p style="font-size: 16px; line-height: 1.5; margin-bottom: 10px;">
                Or copy and paste this URL into your browser:
              </p>
              
              <p style="font-size: 14px; line-height: 1.5; margin-bottom: 30px; word-break: break-all; color: #4a5568;">
                ${magicLinkUrl}
              </p>
              
              <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
                This link will expire in 24 hours. If you didn't sign up for Tennexis, you can safely ignore this email.
              </p>
              
              <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; font-size: 14px; color: #718096;">
                <p>&copy; 2025 Tennexis. All rights reserved.</p>
                <p style="margin-top: 10px; font-size: 12px;">
                  <strong>Not receiving emails?</strong> Check your spam folder and ensure onboarding@resend.dev is not blocked.
                </p>
              </div>
            </div>
          `,
          fromAddress
        );

        console.log("Email sent successfully via Resend!");
        console.log("Resend response:", JSON.stringify(emailResponse, null, 2));
        
        return new Response(JSON.stringify({ 
          success: true, 
          message: "Email sent successfully via Resend", 
          debug_info: { 
            email_sent_to: email, 
            verification_url_generated: magicLinkUrl,
            resend_response: emailResponse,
            message_id: emailResponse.data?.id,
            from_address: fromAddress,
            delivery_notes: [
              "Check Resend logs at https://resend.com/emails for delivery status",
              "If using Gmail/Outlook, emails may be filtered as spam",
              "Consider using a verified domain for better deliverability"
            ]
          }
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      } catch (emailError) {
        console.error("Error sending email via Resend:", emailError);
        throw emailError;
      }
    }
    
    if (type === "payment-link") {
      const { payment_url, coach_name, description, amount, currency, expires_in_hours } = data;
      
      const emailResponse = await sendResendEmail(
        email,
        `Payment Request from ${coach_name}`,
        `
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
                You're receiving this email because you signed up for Tennexis, the tennis coaching platform that helps you manage your coaching business.
              </p>
            </div>
          </div>
        `,
        fromAddress
      );

      console.log("Payment link email sent successfully:", emailResponse);
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    if (type === "payment-reminder") {
      const { payment_url, coach_name, session_details, amount, currency, expires_in_hours } = data;
      
      const emailResponse = await sendResendEmail(
        email,
        `Payment Reminder - Action Required for Your Tennis Session`,
        `
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
        fromAddress
      );

      console.log("Payment reminder email sent successfully:", emailResponse);
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    if (type === "session-reminder") {
      const { player_name, session_details, session_date, coach_name, location } = data;
      
      const emailResponse = await sendResendEmail(
        email,
        `Upcoming Tennis Session Reminder`,
        `
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
        fromAddress
      );

      console.log("Session reminder email sent successfully:", emailResponse);
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    if (type === "payment-received") {
      const { amount, currency, date, payment_type, session_id } = data;
      
      const emailResponse = await sendResendEmail(
        email,
        `Payment Received - Tennis Coaching ${payment_type.charAt(0).toUpperCase() + payment_type.slice(1)}`,
        `
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
        fromAddress
      );

      console.log("Payment received email sent successfully:", emailResponse);
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Handle other email types here if needed

    return new Response(
      JSON.stringify({ error: "Unsupported email type" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error sending custom email:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : String(error), 
        stack: error instanceof Error ? error.stack : undefined,
        resendApiKeyExists: !!resendApiKey,
        troubleshooting_steps: [
          "1. Verify your domain in Resend dashboard",
          "2. Update the from address to use your verified domain",
          "3. Check Resend logs at https://resend.com/emails",
          "4. Try sending to a different email provider for testing"
        ]
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
