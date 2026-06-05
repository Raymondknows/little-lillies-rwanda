import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

/**
 * POST /api/paystack/webhook
 * 
 * Webhook endpoint for Paystack events
 * Verifies webhook signature and stores event for idempotent processing
 * 
 * Webhook secret: PAYSTACK_WEBHOOK_SECRET (from Paystack dashboard)
 * Reference: https://paystack.com/docs/payments/webhooks/
 */
export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[Paystack] PAYSTACK_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const raw = await request.text();
  const signature = request.headers.get("x-paystack-signature") ?? "";

  // Verify webhook signature (critical for security)
  try {
    const expected = crypto
      .createHmac("sha512", secret)
      .update(raw)
      .digest("hex");

    // Use timingSafeEqual to prevent timing attacks
    const sigBuf = Buffer.from(signature, "utf8");
    const expBuf = Buffer.from(expected, "utf8");
    const valid =
      sigBuf.length === expBuf.length &&
      crypto.timingSafeEqual(sigBuf, expBuf);

    if (!valid) {
      console.warn(
        "[Paystack] Invalid webhook signature. Possible tampering or misconfigured secret."
      );
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }
  } catch (err) {
    console.error("[Paystack] Signature verification failed:", err);
    return NextResponse.json(
      { error: "Signature verification failed" },
      { status: 401 }
    );
  }

  // Parse JSON payload
  let payload: any;
  try {
    payload = JSON.parse(raw);
  } catch (err) {
    console.error("[Paystack] Invalid JSON payload:", err);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = payload.event || "unknown";
  const reference = payload?.data?.reference || "unknown";

  try {
    // Store the event for idempotent processing
    // Duplicate webhooks from Paystack will be deduplicated here
    const stored = await prisma.paystackEvent.create({
      data: {
        event,
        reference: reference === "unknown" ? null : reference,
        payload: payload,
        // processed, processedAt, result are defaults
      },
    });

    console.log(
      `[Paystack] Webhook stored: ${event} (ref: ${reference}, ID: ${stored.id})`
    );

    // Acknowledge receipt immediately (Paystack will retry if no 200 response)
    return NextResponse.json(
      { success: true, received: event, eventId: stored.id },
      { status: 200 }
    );
  } catch (err) {
    // Even if storage fails, acknowledge receipt to avoid Paystack retries
    console.error("[Paystack] Failed to store webhook event:", err);
    return NextResponse.json(
      { success: true, received: event, warning: "storage-failed" },
      { status: 200 }
    );
  }
}
