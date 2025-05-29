
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// Initialize Resend client with API key
const resendApiKey = Deno.env.get("RESEND_API_KEY");

if (!resendApiKey) {
  console.error("CRITICAL ERROR: RESEND_API_KEY is not set in environment variables");
}

// Log API key status (safely)
console.log(`Resend API key status: ${resendApiKey ? 'Provided' : 'MISSING!'}`);
console.log(`API key length: ${resendApiKey ? resendApiKey.length : 0}`);
console.log(`API key starts with: ${resendApiKey ? resendApiKey.substring(0, 8) + '...' : 'N/A'}`);

// Get the Supabase project URL from environment variables or use the default
const projectUrl = Deno.env.get("PROJECT_URL") || "https://cugwtwpgccpcjeumrkxf.supabase.co";
console.log("Project URL set to:", projectUrl);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Helper function to send emails via Resend with comprehensive logging
async function sendResendEmail(to: string, subject: string, html: string, from: string) {
  console.log("=== RESEND EMAIL SEND ATTEMPT ===");
  console.log(`API Key Status: ${resendApiKey ? 'Present' : 'MISSING'}`);
  console.log(`API Key Length: ${resendApiKey ? resendApiKey.length : 0}`);
  console.log(`To: ${to}`);
  console.log(`From: ${from}`);
  console.log(`Subject: ${subject}`);
  
  if (!resendApiKey) {
    const error = "Resend configuration is incomplete. Missing API key.";
    console.error("FATAL ERROR:", error);
    throw new Error(error);
  }
  
  try {
    console.log("Creating Resend client instance...");
    const resend = new Resend(resendApiKey);
    console.log("Resend client created successfully");
    
    const emailData = {
      from: from,
      to: [to],
      subject: subject,
      html: html
    };
    
    console.log("Email data prepared:", JSON.stringify(emailData, null, 2));
    console.log("Calling Resend API...");
    
    // Add timing for the API call
    const startTime = Date.now();
    const response = await resend.emails.send(emailData);
    const endTime = Date.now();
    
    console.log(`Resend API call completed in ${endTime - startTime}ms`);
    console.log("Raw Resend API response:", JSON.stringify(response, null, 2));
    
    if (response.error) {
      console.error("Resend API returned an error:", JSON.stringify(response.error, null, 2));
      throw new Error(`Resend API error: ${response.error.message || JSON.stringify(response.error)}`);
    }
    
    if (response.data && response.data.id) {
      console.log(`✅ Email successfully sent! Message ID: ${response.data.id}`);
      console.log("Email should appear in Resend dashboard shortly");
    } else {
      console.warn("⚠️ Unexpected response format from Resend:", response);
    }
    
    console.log("=== RESEND EMAIL SEND SUCCESS ===");
    return response;
  } catch (error) {
    console.error("=== RESEND EMAIL SEND FAILED ===");
    console.error("Error type:", typeof error);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    console.error("Full error object:", JSON.stringify(error, null, 2));
    throw error;
  }
}

serve(async (req) => {
  console.log("=== CUSTOM EMAIL FUNCTION CALLED ===");
  console.log("Request received to custom-email function");
  console.log("Request URL:", req.url);
  console.log("Request method:", req.method);
  console.log("Environment check - RESEND_API_KEY exists:", !!resendApiKey);
  
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
    console.log("=== RESEND TEST ENDPOINT CALLED ===");
    
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
      
      // Test actual Resend API call - Use delivery@resend.dev for testing
      console.log("Testing actual Resend API call...");
      const resend = new Resend(resendApiKey);
      
      // Try a simple API call to verify connectivity
      try {
        console.log("Making test API call to Resend...");
        const testResponse = await resend.emails.send({
          from: "Tennexis <onboarding@resend.dev>",
          to: ["delivered@resend.dev"], // Use Resend's test email for verification
          subject: "Connection Test - Tennexis Email System",
          html: "<p>This is a connection test from Tennexis. If you receive this, the integration is working!</p>",
        });
        
        console.log("Test API call response:", JSON.stringify(testResponse, null, 2));
        
        return new Response(
          JSON.stringify({
            success: true,
            message: "Resend API connection successful",
            config: {
              apiKeyExists: !!resendApiKey,
              apiKeyLength: resendApiKey.length,
              testApiCall: "successful"
            },
            testResponse: testResponse,
            important_notes: [
              "Resend API is reachable and responding",
              "Test email sent to delivered@resend.dev for verification",
              "Check your domain verification status in Resend dashboard",
              "Monitor Resend logs at https://resend.com/emails for delivery status",
              "CRITICAL: Update sender email to use your verified domain"
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
      } catch (apiError) {
        console.error("Resend API test call failed:", apiError);
        return new Response(
          JSON.stringify({
            success: false,
            error: `Resend API test failed: ${apiError instanceof Error ? apiError.message : String(apiError)}`,
            config: {
              apiKeyExists: !!resendApiKey,
              apiKeyLength: resendApiKey.length
            },
            troubleshooting: [
              "Check if your API key is correct",
              "Verify your domain is verified in Resend",
              "Make sure you're using the Live API key, not test key"
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
      }
    } catch (error) {
      console.error("Error in test-resend endpoint:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : String(error),
          troubleshooting: [
            "Check Supabase function logs for detailed error information",
            "Verify RESEND_API_KEY is set in Supabase secrets",
            "Redeploy the function after setting environment variables"
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
    }
  }

  // Regular email sending endpoint
  try {
    console.log("=== PROCESSING EMAIL SEND REQUEST ===");
    const requestBody = await req.json();
    console.log("Raw request body:", JSON.stringify(requestBody, null, 2));
    
    const { type, email, data } = requestBody;
    console.log(`Processing ${type} email request for ${email}`);
    console.log("Request data:", JSON.stringify(data, null, 2));
    
    // Validate Resend configuration
    if (!resendApiKey) {
      console.error("CRITICAL ERROR: Cannot send email - Resend configuration is not complete");
      throw new Error("Email service is not properly configured. Please contact support.");
    }
    
    // 🔥 CRITICAL UPDATE: Replace with your verified domain
    // TODO: Replace 'yourdomain.com' with your actual verified domain from Resend
    const fromAddress = `Tennexis <noreply@yourdomain.com>`;
    
    console.log(`Using from address: ${fromAddress}`);
    console.log("🚨 IMPORTANT: Make sure 'yourdomain.com' is verified in your Resend dashboard!");
    console.log("📋 Steps to verify your domain:");
    console.log("   1. Go to https://resend.com/domains");
    console.log("   2. Add your domain (e.g., yourdomain.com)");
    console.log("   3. Add required DNS records (SPF, DKIM, DMARC)");
    console.log("   4. Wait for verification (status must show 'Verified')");
    console.log("   5. Update fromAddress above to use your verified domain");
    
    // Handle various email types
    if (type === "signup") {
      console.log("=== PROCESSING SIGNUP EMAIL ===");
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
        console.log("=== CALLING RESEND EMAIL FUNCTION ===");
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

        console.log("=== EMAIL SENT SUCCESSFULLY ===");
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
            api_key_length: resendApiKey.length,
            delivery_status: emailResponse.data?.id ? "Submitted to Resend" : "Status unknown",
            delivery_notes: [
              "Email submitted to Resend successfully",
              "Check Resend dashboard at https://resend.com/emails for delivery status",
              "If email doesn't appear in dashboard, check domain verification",
              "Verify sender domain is fully verified at https://resend.com/domains",
              "Update sender email to use your verified domain for production",
              "Check recipient's spam folder if using free email providers"
            ],
            domain_verification_reminder: {
              action_required: "Verify your domain at https://resend.com/domains",
              current_sender: fromAddress,
              recommended_sender: "onboarding@yourdomain.com (replace with your verified domain)"
            }
          }
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      } catch (emailError) {
        console.error("=== EMAIL SENDING FAILED ===");
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
    console.error("=== FUNCTION ERROR ===");
    console.error("Error sending custom email:", error);
    console.error("Error type:", typeof error);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : String(error), 
        stack: error instanceof Error ? error.stack : undefined,
        resendApiKeyExists: !!resendApiKey,
        resendApiKeyLength: resendApiKey ? resendApiKey.length : 0,
        troubleshooting_steps: [
          "1. Check the function logs above for the exact error",
          "2. Verify RESEND_API_KEY is set correctly in Supabase secrets",
          "3. CRITICAL: Verify your domain at https://resend.com/domains",
          "4. Ensure all DNS records (SPF, DKIM) show 'Verified' status",
          "5. Update sender email to use your verified domain",
          "6. Redeploy the function after setting environment variables", 
          "7. Check Resend logs at https://resend.com/emails",
          "8. Try sending to a different email provider for testing"
        ],
        domain_verification: {
          url: "https://resend.com/domains",
          required_status: "All records must show 'Verified'",
          note: "Even with correct API key, unverified domains cause silent delivery failures"
        }
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
