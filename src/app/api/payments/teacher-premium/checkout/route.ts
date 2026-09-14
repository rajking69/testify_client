import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      code: "DEPRECATED_ROUTE",
      message: "Please use the official backend payment endpoint at /api/payments/teacher/premium/checkout.",
    },
    { status: 400 }
  );
}
