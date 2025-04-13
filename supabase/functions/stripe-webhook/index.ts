
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

serve(async (req) => {
  try {
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      return new Response(JSON.stringify({ error: "No signature provided" }), {
        status: 400,
      });
    }

    // Get the raw body
    const body = await req.text();
    let event;

    // Verify webhook signature
    try {
      // This will throw an error if the signature is invalid
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        Deno.env.get("STRIPE_WEBHOOK_SECRET") || ""
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(JSON.stringify({ error: `Webhook signature verification failed` }), {
        status: 400,
      });
    }

    // Initialize Supabase client with service role key for admin access
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Handle the event based on its type
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        
        // Update payment link status to paid
        if (session.metadata?.payment_link_id) {
          await supabaseAdmin
            .from("payment_links")
            .update({ status: "paid", updated_at: new Date().toISOString() })
            .eq("id", session.metadata.payment_link_id);
        }
        
        // If there's a session ID, update its payment status
        if (session.metadata?.session_id) {
          await supabaseAdmin
            .from("sessions")
            .update({ payment_status: "paid" })
            .eq("id", session.metadata.session_id);
          
          // Send confirmation email to coach
          if (session.metadata?.coach_id) {
            const { data: coach } = await supabaseAdmin
              .from("profiles")
              .select("email, full_name")
              .eq("id", session.metadata.coach_id)
              .single();
            
            if (coach?.email) {
              try {
                await supabaseAdmin.functions.invoke("custom-email", {
                  body: {
                    type: "payment-received",
                    email: coach.email,
                    data: {
                      amount: session.amount_total / 100,
                      currency: session.currency.toUpperCase(),
                      date: new Date().toISOString(),
                      session_id: session.metadata.session_id
                    }
                  }
                });
              } catch (emailError) {
                console.error("Failed to send confirmation email:", emailError);
              }
            }
          }
        }
        
        break;
      }
      
      case "charge.refunded": {
        const charge = event.data.object;
        
        // Find the checkout session associated with this charge
        const paymentIntentId = charge.payment_intent;
        if (!paymentIntentId) break;
        
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (!paymentIntent?.metadata?.session_id) break;
        
        // Update session payment status
        await supabaseAdmin
          .from("sessions")
          .update({ 
            payment_status: charge.refunded ? "refunded" : "partially_refunded",
            updated_at: new Date().toISOString()
          })
          .eq("id", paymentIntent.metadata.session_id);
          
        break;
      }
      
      case "customer.subscription.deleted":
      case "customer.subscription.updated": {
        // Handle subscription changes if you add recurring payments
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
});
