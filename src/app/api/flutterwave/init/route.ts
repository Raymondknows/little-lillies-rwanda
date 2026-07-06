import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amountMinor, currency, email, name, phone, plan, schoolName, slug, redirectUrl, isSubscription } = body || {};

    if (!amountMinor || !email || !name || !schoolName) {
      return NextResponse.json({ error: "Missing checkout details." }, { status: 400 });
    }

    const response = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY ?? ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Number(amountMinor) / 100,
        currency: currency || "USD",
        email,
        tx_ref: `schoolbase-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        redirect_url: redirectUrl,
        customer: {
          email,
          phone_number: phone || "",
          name,
        },
        customizations: {
          title: "SchoolBase Subscription",
          description: `${schoolName} • ${plan}`,
        },
        meta: {
          schoolName,
          slug: slug || "",
          plan,
          isSubscription: Boolean(isSubscription),
        },
      }),
    });

    const data = await response.json();

    if (!response.ok || !data?.data?.link) {
      return NextResponse.json({ error: data?.message || "Unable to initialize Flutterwave payment." }, { status: 502 });
    }

    return NextResponse.json({ authorization_url: data.data.link });
  } catch (error) {
    console.error("Flutterwave init failed:", error);
    return NextResponse.json({ error: "Unable to start Flutterwave checkout." }, { status: 500 });
  }
}
