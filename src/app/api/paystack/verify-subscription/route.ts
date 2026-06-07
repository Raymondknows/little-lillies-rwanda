import { NextResponse } from "next/server";
// Database access removed - use backend API instead

/**
 * POST /api/paystack/verify-subscription
 * 
 * Verifies subscription payment and activates school
 * Called after user returns from Paystack checkout
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reference } = body ?? {};

    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    const secretKey = process.env.PAYSTACK_SUBSCRIPTION_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "Subscription Paystack secret not configured." }, { status: 500 });
    }

    // Verify payment with Paystack
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const verifyData = await verifyResponse.json();
    if (!verifyResponse.ok || verifyData.status !== true) {
      return NextResponse.json(
        { success: false, error: verifyData.message || "Paystack verification failed." },
        { status: 400 }
      );
    }

    const transaction = verifyData.data;
    if (transaction.status !== "success") {
      return NextResponse.json({ success: false, error: "Payment not successful." }, { status: 400 });
    }

    // Extract metadata
    const metadata = transaction.metadata ?? {};
    const { schoolName, plan } = metadata;
    
    if (!schoolName || !plan) {
      return NextResponse.json({ success: false, error: "Missing metadata in transaction" }, { status: 400 });
    }

    // Find school by name and update status
    const school = await prisma.school.findFirst({
      where: { name: schoolName },
    });

    if (!school) {
      return NextResponse.json({ success: false, error: "School not found" }, { status: 404 });
    }

    // Activate school and set subscription
    const expiresAt = new Date(Date.now() + 120 * 24 * 60 * 60 * 1000); // 120 days
    
    const updated = await prisma.school.update({
      where: { id: school.id },
      data: {
        status: "ACTIVE",
        plan: plan,
        subscriptionExpiresAt: expiresAt,
      },
    });

    // Log the activation
    await prisma.platformAuditLog.create({
      data: {
        schoolId: school.id,
        event: "subscription.activated",
        details: JSON.stringify({
          plan,
          reference,
          amount: transaction.amount / 100, // Convert from minor units
          expiresAt: expiresAt.toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      school: {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        plan: updated.plan,
        status: updated.status,
      },
    });
  } catch (err) {
    console.error("[Paystack] Subscription verification error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Verification failed" },
      { status: 500 }
    );
  }
}
