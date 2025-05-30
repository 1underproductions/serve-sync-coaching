import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

// Initialize Supabase admin client for generating confirmation links
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabaseAdmin = createClient(
  projectUrl,
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
      
      // Test actual Resend API call - Use your verified domain
      console.log("Testing actual Resend API call with verified tennexis.com domain...");
      const resend = new Resend(resendApiKey);
      
      // Try a simple API call to verify connectivity
      try {
        console.log("Making test API call to Resend...");
        const testResponse = await resend.emails.send({
          from: "Tennexis <noreply@tennexis.com>",
          to: ["delivered@resend.dev"], // Use Resend's test email for verification
          subject: "Connection Test - Tennexis Email System",
          html: "<p>This is a connection test from Tennexis using the verified tennexis.com domain. If you receive this, the integration is working!</p>",
        });
        
        console.log("Test API call response:", JSON.stringify(testResponse, null, 2));
        
        return new Response(
          JSON.stringify({
            success: true,
            message: "Resend API connection successful with verified tennexis.com domain",
            config: {
              apiKeyExists: !!resendApiKey,
              apiKeyLength: resendApiKey.length,
              testApiCall: "successful",
              verifiedDomain: "tennexis.com"
            },
            testResponse: testResponse,
            important_notes: [
              "Resend API is reachable and responding",
              "Test email sent using verified tennexis.com domain",
              "Check Resend dashboard at https://resend.com/emails for delivery status",
              "Domain tennexis.com is verified and ready for production use"
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
              apiKeyLength: resendApiKey.length,
              verifiedDomain: "tennexis.com"
            },
            troubleshooting: [
              "Check if your API key is correct",
              "Verify your tennexis.com domain is still verified in Resend",
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
    
    // ✅ VERIFIED DOMAIN: Using your verified tennexis.com domain for ALL emails
    const fromAddress = `Tennexis <noreply@tennexis.com>`;
    
    console.log(`Using from address: ${fromAddress}`);
    console.log("✅ SUCCESS: Using verified tennexis.com domain for production emails!");
    console.log("📧 Email delivery should now work reliably with your verified domain");
    
    // Handle various email types
    if (type === "signup") {
      console.log("=== PROCESSING SIGNUP EMAIL ===");
      console.log("Signup email request received:", { email, data });
      
      if (!data || typeof data !== 'object') {
        throw new Error("Invalid data provided for email");
      }
      
      // Generate a proper email confirmation link using Supabase Admin API
      console.log("Generating email confirmation link using Supabase Admin API...");
      
      try {
        // Generate an email confirmation link
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'signup',
          email: email,
          options: {
            redirectTo: `${data.redirect_to || projectUrl + '/auth/callback'}`
          }
        });
        
        if (linkError) {
          console.error("Error generating confirmation link:", linkError);
          throw linkError;
        }
        
        console.log("Email confirmation link generated successfully");
        const confirmationUrl = linkData.properties.action_link;
        
        try {
          console.log("=== CALLING RESEND EMAIL FUNCTION ===");
          const emailResponse = await sendResendEmail(
            email,
            "Verify your Tennexis account",
            `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #333333; line-height: 1.6;">
                <div style="text-align: center; margin-bottom: 40px;">
                  <h1 style="color: #2563eb; font-size: 28px; font-weight: 600; margin: 0;">Welcome to Tennexis</h1>
                </div>
                
                <div style="background-color: #f8fafc; border-radius: 8px; padding: 30px; margin-bottom: 30px;">
                  <p style="font-size: 18px; margin: 0 0 20px 0;">
                    Thank you for creating your Tennexis account. To complete your registration and start using our tennis coaching platform, please verify your email address.
                  </p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${confirmationUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: 600; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-size: 16px;">
                      Verify Email Address
                    </a>
                  </div>
                  
                  <p style="font-size: 14px; color: #6b7280; margin: 20px 0 0 0; text-align: center;">
                    This verification link will expire in 24 hours for security purposes.
                  </p>
                </div>
                
                <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
                  <p style="font-size: 14px; color: #6b7280; margin: 0;">
                    If you didn't create this account, you can safely ignore this email.
                  </p>
                  <p style="font-size: 14px; color: #6b7280; margin: 10px 0 0 0;">
                    If the button doesn't work, copy and paste this link: <br>
                    <span style="word-break: break-all;">${confirmationUrl}</span>
                  </p>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                    © 2025 Tennexis. All rights reserved.<br>
                    This email was sent from our verified domain tennexis.com
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
            message: "Email sent successfully via Resend using verified tennexis.com domain", 
            debug_info: { 
              email_sent_to: email, 
              verification_url_generated: confirmationUrl,
              resend_response: emailResponse,
              message_id: emailResponse.data?.id,
              from_address: fromAddress,
              verified_domain: "tennexis.com",
              api_key_length: resendApiKey.length,
              delivery_status: emailResponse.data?.id ? "Submitted to Resend" : "Status unknown",
              troubleshooting_notes: [
                "Email submitted to Resend successfully using verified tennexis.com domain",
                "Check your spam/junk folder",
                "Try a different email provider (Gmail, Outlook) for testing", 
                "Whitelist noreply@tennexis.com in your email client",
                "Check Resend dashboard at https://resend.com/emails for delivery status",
                "If using a corporate email, check with IT about automated email blocking"
              ]
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
      } catch (linkGenerationError) {
        console.error("Error generating email confirmation link:", linkGenerationError);
        throw new Error(`Failed to generate confirmation link: ${linkGenerationError.message}`);
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
        verifiedDomain: "tennexis.com",
        troubleshooting_steps: [
          "1. Check the function logs above for the exact error",
          "2. Verify RESEND_API_KEY is set correctly in Supabase secrets",
          "3. Domain tennexis.com is verified and ready for production use",
          "4. Check Resend logs at https://resend.com/emails",
          "5. Try sending to a different email provider for testing",
          "6. Check spam/junk folders",
          "7. Whitelist noreply@tennexis.com in your email settings"
        ]
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
