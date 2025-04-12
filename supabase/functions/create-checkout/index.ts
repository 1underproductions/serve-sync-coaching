
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Initialize Supabase client with Deno runtime
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get the current user and verify authentication
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Parse request body
    const { 
      amount, 
      description, 
      playerId, 
      currency = "USD", 
      successPath, 
      cancelPath,
      sessionId,
      playerEmail,
      sendEmail 
    } = await req.json();

    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ error: "Invalid amount" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Create payment link in the database
    const { data: paymentLinkData, error: dbError } = await supabaseClient.rpc(
      "create_payment_link",
      {
        p_player_id: playerId || null,
        p_description: description || "Tennis coaching session",
        p_amount: amount,
        p_currency: currency,
        p_expires_in_days: 30,
        p_session_id: sessionId || null
      }
    );

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(JSON.stringify({ error: "Failed to create payment link" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Get coach profile for metadata
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: description || "Tennis coaching session",
              description: `Payment to ${profile?.full_name || "Tennis Coach"}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}${successPath || "/payment-success"}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}${cancelPath || "/payments"}`,
      metadata: {
        payment_link_id: paymentLinkData,
        coach_id: user.id,
        player_id: playerId || null,
        session_id: sessionId || null
      },
    });

    // Update payment link with Stripe checkout ID
    await supabaseClient
      .from("payment_links")
      .update({ stripe_checkout_id: session.id })
      .eq("id", paymentLinkData);

    // If email sending is requested and we have a player email
    if (sendEmail && playerEmail) {
      try {
        await supabaseClient.functions.invoke('custom-email', {
          body: { 
            type: 'payment-link', 
            email: playerEmail, 
            data: {
              payment_url: session.url,
              coach_name: profile?.full_name || "Your tennis coach",
              description: description || "Tennis coaching session",
              amount: amount,
              currency: currency.toUpperCase()
            }
          }
        });
        console.log("Payment link email sent to:", playerEmail);
      } catch (emailError) {
        console.error("Failed to send payment email:", emailError);
        // We don't want to fail the whole request if just the email fails
      }
    }

    return new Response(JSON.stringify({ id: paymentLinkData, url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
