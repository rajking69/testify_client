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
    const body = await req.json();
    const { examId, examTitle, examSubject, price, studentEmail } = body;

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";
    const amountInCents = Math.round(Number(price || 50) * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: studentEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: examTitle || "Testify Examination Access",
              description: `Subject: ${examSubject || "Academic"} • One-time assessment pass`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "EXAM_PURCHASE",
        examId: String(examId),
      },
      success_url: `${origin}/exam/payment/success?session_id={CHECKOUT_SESSION_ID}&exam_id=${encodeURIComponent(
        examId
      )}`,
      cancel_url: `${origin}/exam/payment/cancel?exam_id=${encodeURIComponent(
        examId
      )}`,
    });

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error("Stripe Exam Checkout Error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error.message || "Failed to create Stripe Checkout session using backend credentials.",
      },
      { status: 500 }
    );
  }
}
