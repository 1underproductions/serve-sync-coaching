
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SessionNotificationRequest {
  sessionId: string;
  notificationType: 'session_created' | 'session_reminder' | 'payment_due' | 'payment_received';
  recipientEmail: string;
  sessionDetails: {
    title: string;
    date: string;
    time: string;
    location: string;
    coachName: string;
    playerName?: string;
    amount?: number;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { sessionId, notificationType, recipientEmail, sessionDetails }: SessionNotificationRequest = await req.json();

    console.log("Sending session notification:", { sessionId, notificationType, recipientEmail });

    // Create notification record
    const { data: notification, error: notificationError } = await supabase
      .from("session_notifications")
      .insert({
        session_id: sessionId,
        coach_id: (await supabase.auth.getUser()).data.user?.id,
        recipient_email: recipientEmail,
        notification_type: notificationType,
        email_content: sessionDetails,
        status: 'pending'
      })
      .select()
      .single();

    if (notificationError) {
      console.error("Error creating notification record:", notificationError);
      throw notificationError;
    }

    // Generate email content based on notification type
    let subject = "";
    let htmlContent = "";

    switch (notificationType) {
      case 'session_created':
        subject = "Tennis Session Confirmed";
        htmlContent = `
          <h2>Your Tennis Session is Confirmed!</h2>
          <p>Hi there,</p>
          <p>Your tennis session has been scheduled with ${sessionDetails.coachName}.</p>
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3>${sessionDetails.title}</h3>
            <p><strong>Date:</strong> ${sessionDetails.date}</p>
            <p><strong>Time:</strong> ${sessionDetails.time}</p>
            <p><strong>Location:</strong> ${sessionDetails.location}</p>
            ${sessionDetails.playerName ? `<p><strong>Player:</strong> ${sessionDetails.playerName}</p>` : ''}
            ${sessionDetails.amount ? `<p><strong>Amount:</strong> $${sessionDetails.amount}</p>` : ''}
          </div>
          <p>We look forward to seeing you on the court!</p>
          <p>Best regards,<br>${sessionDetails.coachName}</p>
        `;
        break;
      
      case 'session_reminder':
        subject = "Tennis Session Reminder - Tomorrow";
        htmlContent = `
          <h2>Session Reminder</h2>
          <p>Hi there,</p>
          <p>This is a friendly reminder about your tennis session tomorrow with ${sessionDetails.coachName}.</p>
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3>${sessionDetails.title}</h3>
            <p><strong>Date:</strong> ${sessionDetails.date}</p>
            <p><strong>Time:</strong> ${sessionDetails.time}</p>
            <p><strong>Location:</strong> ${sessionDetails.location}</p>
          </div>
          <p>Please arrive 10 minutes early and bring water and a towel.</p>
          <p>See you tomorrow!<br>${sessionDetails.coachName}</p>
        `;
        break;
      
      case 'payment_due':
        subject = "Payment Due for Tennis Session";
        htmlContent = `
          <h2>Payment Reminder</h2>
          <p>Hi there,</p>
          <p>This is a reminder that payment is due for your upcoming tennis session.</p>
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3>${sessionDetails.title}</h3>
            <p><strong>Date:</strong> ${sessionDetails.date}</p>
            <p><strong>Time:</strong> ${sessionDetails.time}</p>
            <p><strong>Amount Due:</strong> $${sessionDetails.amount}</p>
          </div>
          <p>Please arrange payment before your session.</p>
          <p>Thank you,<br>${sessionDetails.coachName}</p>
        `;
        break;
      
      case 'payment_received':
        subject = "Payment Received - Thank You!";
        htmlContent = `
          <h2>Payment Confirmed</h2>
          <p>Hi there,</p>
          <p>Thank you! We've received your payment for the tennis session.</p>
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3>${sessionDetails.title}</h3>
            <p><strong>Date:</strong> ${sessionDetails.date}</p>
            <p><strong>Amount Paid:</strong> $${sessionDetails.amount}</p>
            <p><strong>Status:</strong> Confirmed</p>
          </div>
          <p>We look forward to your session!</p>
          <p>Best regards,<br>${sessionDetails.coachName}</p>
        `;
        break;
    }

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Tennis Sessions <sessions@tennexis.com>",
      to: [recipientEmail],
      subject: subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    // Update notification status
    await supabase
      .from("session_notifications")
      .update({
        sent_at: new Date().toISOString(),
        status: 'sent'
      })
      .eq('id', notification.id);

    return new Response(JSON.stringify({ 
      success: true, 
      notificationId: notification.id,
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-session-notification:", error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
