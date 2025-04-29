
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
            .update({ 
              status: "paid", 
              updated_at: new Date().toISOString(),
              stripe_payment_id: session.payment_intent || null
            })
            .eq("id", session.metadata.payment_link_id);
          
          // Record the transaction in the transactions table
          try {
            await supabaseAdmin.from("transactions").insert({
              coach_id: session.metadata.coach_id,
              player_id: session.metadata.player_id || null,
              session_id: session.metadata.session_id || null,
              package_id: session.metadata.package_id || null,
              amount: session.amount_total / 100,
              currency: session.currency.toUpperCase(),
              status: "succeeded",
              payment_type: session.metadata.payment_type || "session",
              stripe_payment_id: session.payment_intent,
              payment_link_id: session.metadata.payment_link_id,
              description: session.metadata.description || `${session.metadata.payment_type} payment`,
              is_deposit: session.metadata.is_deposit === "true"
            });
          } catch (transactionError) {
            console.error("Failed to record transaction:", transactionError);
          }
        }
        
        // If there's a session ID, update its payment status
        if (session.metadata?.session_id) {
          await supabaseAdmin
            .from("sessions")
            .update({ 
              payment_status: "paid",
              status: "confirmed"  // Now explicitly confirm the session
            })
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
                      payment_type: session.metadata.payment_type,
                      session_id: session.metadata.session_id
                    }
                  }
                });
              } catch (emailError) {
                console.error("Failed to send confirmation email:", emailError);
              }
            }
          }
          
          // If there's a player email, send session confirmation to player
          if (session.customer_details?.email) {
            try {
              // Get session details
              const { data: sessionData } = await supabaseAdmin
                .from("sessions")
                .select("title, start_time, end_time, location")
                .eq("id", session.metadata.session_id)
                .single();
                
              if (sessionData) {
                const formattedDate = new Date(sessionData.start_time).toLocaleString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                });
                
                // Send session confirmation email
                await supabaseAdmin.functions.invoke("custom-email", {
                  body: {
                    type: "session-reminder",
                    email: session.customer_details.email,
                    data: {
                      player_name: session.customer_details.name || "Player",
                      coach_name: "Your coach", // Would be better to get coach name
                      session_details: sessionData.title,
                      session_date: formattedDate,
                      location: sessionData.location || "Tennis courts"
                    }
                  }
                });
              }
            } catch (emailError) {
              console.error("Failed to send session confirmation email:", emailError);
            }
          }
        }
        
        // If there's a package ID, update package purchases
        if (session.metadata?.package_id && session.metadata?.player_id) {
          try {
            // Get the package details
            const { data: packageDetails } = await supabaseAdmin
              .from("packages")
              .select("sessions, name")
              .eq("id", session.metadata.package_id)
              .single();
              
            if (packageDetails) {
              // Record the package purchase
              await supabaseAdmin.from("player_packages").insert({
                player_id: session.metadata.player_id,
                coach_id: session.metadata.coach_id,
                package_id: session.metadata.package_id,
                sessions_total: packageDetails.sessions,
                sessions_used: 0,
                sessions_remaining: packageDetails.sessions,
                payment_id: session.payment_intent,
                amount_paid: session.amount_total / 100,
                status: "active"
              });
              
              // Send package confirmation email to player
              if (session.customer_details?.email) {
                try {
                  await supabaseAdmin.functions.invoke("custom-email", {
                    body: {
                      type: "package-confirmation",
                      email: session.customer_details.email,
                      data: {
                        player_name: session.customer_details.name || "Player",
                        package_name: packageDetails.name,
                        sessions_count: packageDetails.sessions,
                        amount: session.amount_total / 100,
                        currency: session.currency.toUpperCase()
                      }
                    }
                  });
                } catch (emailError) {
                  console.error("Failed to send package confirmation email:", emailError);
                }
              }
            }
          } catch (packageError) {
            console.error("Failed to process package purchase:", packageError);
          }
        }
        
        break;
      }
      
      // Handle payment link expiration
      case "checkout.session.expired": {
        const session = event.data.object;
        
        // Update payment link status to expired
        if (session.metadata?.payment_link_id) {
          await supabaseAdmin
            .from("payment_links")
            .update({ 
              status: "expired", 
              updated_at: new Date().toISOString()
            })
            .eq("id", session.metadata.payment_link_id);
          
          // If there's a linked session, mark it as expired too
          if (session.metadata.session_id) {
            // Check if the session was a deposit (soft booking)
            const isDeposit = session.metadata.is_deposit === "true";
            
            await supabaseAdmin
              .from("sessions")
              .update({
                payment_status: "expired",
                status: isDeposit ? "cancelled" : "scheduled" // If it was a deposit, cancel it; otherwise keep it scheduled
              })
              .eq("id", session.metadata.session_id);
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
        
        // Update payment link status
        const { data: paymentLinks } = await supabaseAdmin
          .from("payment_links")
          .select("id")
          .eq("stripe_payment_id", paymentIntentId)
          .limit(1);
          
        if (paymentLinks?.length > 0) {
          await supabaseAdmin
            .from("payment_links")
            .update({ 
              status: charge.refunded ? "refunded" : "partially_refunded",
              updated_at: new Date().toISOString()
            })
            .eq("id", paymentLinks[0].id);
        }
        
        // Update session payment status if associated
        if (paymentIntent?.metadata?.session_id) {
          await supabaseAdmin
            .from("sessions")
            .update({ 
              payment_status: charge.refunded ? "refunded" : "partially_refunded",
              updated_at: new Date().toISOString()
            })
            .eq("id", paymentIntent.metadata.session_id);
        }
        
        // Update transaction status
        await supabaseAdmin
          .from("transactions")
          .update({
            status: charge.refunded ? "refunded" : "partially_refunded",
            updated_at: new Date().toISOString()
          })
          .eq("stripe_payment_id", paymentIntentId);
          
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
