import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
    if (!stripeSecretKey || stripeSecretKey.includes("placeholder")) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing valid STRIPE_SECRET_KEY in .env. Please set your Stripe Secret Key (e.g. sk_test_... or sk_live_...) in your .env file.",
        },
        { status: 400 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);
    const body = await req.json().catch(() => ({}));
    const { teacherEmail, teacherName } = body;

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: teacherEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            recurring: {
              interval: "year",
            },
            product_data: {
              name: "Testify Teacher Premium (1 Year)",
              description:
                "Full access to exam creation, question bank, live AI proctoring, and classroom analytics.",
            },
            unit_amount: 2000, // $20.00
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "TEACHER_PREMIUM",
        teacherEmail: teacherEmail || "",
      },
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}&email=${encodeURIComponent(teacherEmail || "")}`,
      cancel_url: `${origin}/payment/cancel`,
    });

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error("Stripe Teacher Premium Checkout Error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Failed to create Stripe Teacher Subscription session using backend credentials.",
      },
      { status: 500 }
    );
  }
}
