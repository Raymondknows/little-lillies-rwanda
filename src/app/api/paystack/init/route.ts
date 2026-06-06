import { NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth";
import { getCurrentSchoolId } from "@/lib/school";

export async function POST(request: Request) {
  const body = await request.json();
  const { amountMinor, email, plan, schoolName, name, phone } = body ?? {};

  const secretKey = process.env.PAYSTACK_SUBSCRIPTION_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Subscription Paystack secret not configured." }, { status: 500 });
  }

  if (!amountMinor || !email) {
    return NextResponse.json({ error: "Missing amount or email." }, { status: 400 });
  }

  // Basic server-side email validation to catch obvious problems
  function isValidEmail(e: string) {
    // simple RFC-ish check: local@domain.tld and domain contains at least one dot
    if (!e || typeof e !== "string") return false;
    const parts = e.split("@");
    if (parts.length !== 2) return false;
    const domain = parts[1];
    if (!domain.includes(".")) return false;
    const tld = domain.split(".").pop() || "";
    if (tld.length < 2) return false;
    // reject obviously fake dev-only hostnames like .demo
    if (domain.endsWith(".demo") || domain.endsWith(".local")) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  if (!isValidEmail(email)) {
    console.error("Invalid email passed to Paystack init", { email });
    return NextResponse.json({ error: "Invalid email address passed." }, { status: 400 });
  }

  // Get schoolId from session
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const schoolId = await getCurrentSchoolId();
  if (!schoolId) {
    return NextResponse.json({ error: "School not found" }, { status: 400 });
  }

  try {
    const initRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountMinor, // Fixed NGN amounts
        email,
        currency: "NGN", // Always NGN
        metadata: { 
          type: "subscription",
          plan, 
          schoolName, 
          schoolId,
          contact_name: name, 
          contact_phone: phone,
        },
      }),
    });

    const data = await initRes.json();
    if (!initRes.ok || !data.status) {
      console.error("Paystack init error response:", {
        status: initRes.status,
        ok: initRes.ok,
        message: data.message,
        data: data.data,
        requestBody: { amount: amountMinor, email, plan, schoolName, schoolId }
      });
      return NextResponse.json({ error: data.message || "Paystack initialization failed." }, { status: 400 });
    }

    return NextResponse.json({ authorization_url: data.data.authorization_url });
  } catch (err) {
    console.error("Paystack init error:", err);
    return NextResponse.json({ error: "Initialization error" }, { status: 500 });
  }
}
