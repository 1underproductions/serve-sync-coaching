
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  playerName: string;
  playerEmail?: string;
  coachName: string;
  coachEmail: string;
  isChild: boolean;
  parentName?: string;
  parentEmail?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      playerName, 
      playerEmail, 
      coachName, 
      coachEmail, 
      isChild, 
      parentName, 
      parentEmail 
    }: WelcomeEmailRequest = await req.json();

    // Determine recipient and email content based on player type
    const recipientEmail = isChild ? parentEmail : playerEmail;
    const recipientName = isChild ? parentName : playerName;
    
    if (!recipientEmail) {
      throw new Error("Recipient email is required");
    }

    const emailSubject = `Welcome to ${coachName}'s Tennis Coaching Program!`;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2c5530; text-align: center;">Welcome to Tennis Excellence!</h1>
        
        <p>Dear ${recipientName},</p>
        
        ${isChild 
          ? `<p>Thank you for enrolling <strong>${playerName}</strong> in our tennis coaching program! We're excited to begin this tennis journey together.</p>`
          : `<p>Welcome to our tennis coaching program! We're excited to begin your tennis journey together.</p>`
        }
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2c5530; margin-top: 0;">What to Expect:</h3>
          <ul style="line-height: 1.6;">
            <li><strong>Personalized Training:</strong> Sessions tailored to ${isChild ? playerName + "'s" : "your"} skill level and goals</li>
            <li><strong>Progress Tracking:</strong> Regular updates on development and achievements</li>
            <li><strong>Session Reminders:</strong> Automatic email reminders before each session</li>
            <li><strong>Payment Links:</strong> Convenient online payment options when needed</li>
          </ul>
        </div>
        
        <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2c5530; margin-top: 0;">Your Coach Details:</h3>
          <p><strong>Coach:</strong> ${coachName}</p>
          <p><strong>Email:</strong> <a href="mailto:${coachEmail}" style="color: #2c5530;">${coachEmail}</a></p>
        </div>
        
        <div style="margin: 30px 0;">
          <h3 style="color: #2c5530;">Next Steps:</h3>
          <ol style="line-height: 1.6;">
            <li>You'll receive session confirmation emails when your coach schedules training sessions</li>
            <li>If you have any questions or concerns, please don't hesitate to reach out to your coach</li>
            <li>Keep an eye out for progress updates and session reminders</li>
          </ol>
        </div>
        
        <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
          <p style="margin: 0; color: #666;">We're committed to helping ${isChild ? playerName : "you"} reach ${isChild ? "their" : "your"} tennis potential!</p>
        </div>
        
        <p>Best regards,<br>
        <strong>${coachName}</strong><br>
        Tennis Coach</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666; text-align: center;">
          This email was sent because you were added to ${coachName}'s tennis coaching program. 
          If you have any questions, please contact your coach directly.
        </p>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Tennis Coach <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: emailSubject,
      html: emailHtml,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id,
      message: "Welcome email sent successfully" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
