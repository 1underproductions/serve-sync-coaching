
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
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
    
    // Handle various email types
    if (type === "signup") {
      // Ensure we're using the correct format for the verification URL
      // The token_hash should be properly encoded and not double-encoded
      const token_hash = data.token_hash;
      // Use the /auth/v1/verify endpoint directly with clean parameters
      const confirmUrl = `${projectUrl}/auth/v1/verify?token=${token_hash}&type=signup&redirect_to=${encodeURIComponent(data.redirect_to)}`;
      console.log("Generated verification URL:", confirmUrl);
      
      const emailResponse = await resend.emails.send({
        from: "Tennexis <onboarding@resend.dev>",
        to: [email],
        subject: "Welcome to Tennexis - Please Confirm Your Account",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <img src="https://asset.brandfetch.io/idFdo8rNxK/idtYvV5iVs.jpeg" alt="Tennexis" style="max-width: 150px; margin-bottom: 20px;" />
            
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
              <p>&copy; 2023 Tennexis. All rights reserved.</p>
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
