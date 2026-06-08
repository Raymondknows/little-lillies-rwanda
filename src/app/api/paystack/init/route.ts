import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3006';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amountMinor, email, plan, schoolName, name, phone } = body ?? {};

    if (!amountMinor || !email) {
      return NextResponse.json({ error: "Missing amount or email." }, { status: 400 });
    }

    // Proxy to backend Paystack init endpoint
    // amountMinor is already in kobo, don't multiply by 100 again
    const backendRes = await fetch(`${BACKEND_URL}/api/paystack/init`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.floor(amountMinor / 100),
        metadata: {
          type: "subscription",
          plan,
          schoolName,
          contact_name: name,
          contact_phone: phone,
        },
      }),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      console.error("Backend Paystack init error:", data);
      return NextResponse.json(
        { error: data.error || "Paystack initialization failed" },
        { status: backendRes.status }
      );
    }

    // Return the authorization URL from backend
    if (data.data?.authorization_url) {
      return NextResponse.json({ authorization_url: data.data.authorization_url });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Paystack init error:", err);
    return NextResponse.json({ error: "Initialization error" }, { status: 500 });
  }
}
