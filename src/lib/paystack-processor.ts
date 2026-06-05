import { prisma } from "@/lib/db";

interface PaymentType {
  type: "subscription" | "school_fee";
  schoolId?: string;
}

/**
 * Process a Paystack webhook event by ID
 * Idempotent: safe to retry, will not create duplicate payments
 * Returns: { success, paymentId, warning?, error? }
 */
export async function processPaystackEventById(eventId: string) {
  const e = await prisma.paystackEvent.findUnique({ where: { id: eventId } });
  if (!e) throw new Error("Event not found");
  if (e.processed) {
    console.log(`[Paystack] Event ${eventId} already processed: ${e.result}`);
    return { already: true, result: e.result };
  }

  const payload = e.payload as any;
  const event = payload.event;
  const data = payload.data ?? {};

  try {
    if (event === "charge.success") {
      return await handleChargeSuccess(eventId, data);
    }

    if (event === "charge.failed") {
      return await handleChargeFailed(eventId, data);
    }

    // Mark other events as processed but ignored
    await prisma.paystackEvent.update({
      where: { id: eventId },
      data: { processed: true, processedAt: new Date(), result: `ignored:${event}` },
    });
    return { ignored: event };
  } catch (error) {
    console.error(`[Paystack] Error processing event ${eventId}:`, error);
    // Mark as failed, can retry later
    await prisma.paystackEvent.update({
      where: { id: eventId },
      data: { processed: false, result: `error:${error instanceof Error ? error.message : "unknown"}` },
    });
    throw error;
  }
}

/**
 * Handle charge.success event
 * Distinguishes between subscription payments and school fee payments
 */
async function handleChargeSuccess(eventId: string, data: any) {
  const reference = data.reference as string;
  const amount = Number(data.amount ?? 0) / 100; // Paystack amounts in kobo, convert to base currency
  const metadata = (data.metadata ?? {}) as Record<string, any>;

  if (!reference) {
    throw new Error("Missing reference in charge.success event");
  }

  // Determine payment type from metadata
  const paymentType = metadata.type as PaymentType["type"] | undefined;

  // IDEMPOTENCY CHECK: ensure payment doesn't already exist
  const existing = await prisma.payment.findFirst({
    where: { reference },
  });

  if (existing) {
    console.log(`[Paystack] Payment ${reference} already exists (ID: ${existing.id})`);
    await prisma.paystackEvent.update({
      where: { id: eventId },
      data: { processed: true, processedAt: new Date(), result: `idempotent:payment-exists:${existing.id}` },
    });
    return { already: true, paymentId: existing.id };
  }

  // SCHOOL FEE PAYMENT: invoice-based
  if (paymentType === "school_fee") {
    const invoiceId = metadata.invoiceId ?? metadata.invoice_id ?? metadata.invoice?.id;

    if (!invoiceId) {
      // No invoice found; record as unmatched payment
      const p = await prisma.payment.create({
        data: { amount, method: "ONLINE", reference, recordedBy: "Paystack-webhook" },
      });
      await prisma.paystackEvent.update({
        where: { id: eventId },
        data: {
          processed: true,
          processedAt: new Date(),
          result: `school-fee:no-invoice:created-payment:${p.id}`,
        },
      });
      console.warn(`[Paystack] School fee payment ${reference} has no matching invoice`);
      return { paymentId: p.id, warning: "no-matching-invoice" };
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      // Invoice does not exist
      const p = await prisma.payment.create({
        data: { amount, method: "ONLINE", reference, recordedBy: "Paystack-webhook" },
      });
      await prisma.paystackEvent.update({
        where: { id: eventId },
        data: {
          processed: true,
          processedAt: new Date(),
          result: `school-fee:invoice-not-found:${invoiceId}:created-payment:${p.id}`,
        },
      });
      console.warn(`[Paystack] School fee payment for missing invoice: ${invoiceId}`);
      return { paymentId: p.id, warning: "invoice-not-found" };
    }

    // Update invoice with payment
    const newPaid = invoice.amountPaid + amount;
    const status = newPaid >= invoice.amountDue ? "PAID" : "PART_PAID";

    const payment = await prisma.$transaction(async (tx) => {
      const p = await tx.payment.create({
        data: {
          invoiceId: invoice.id,
          amount,
          method: "ONLINE",
          reference,
          recordedBy: "Paystack-webhook",
        },
      });
      await tx.invoice.update({
        where: { id: invoice.id },
        data: { amountPaid: newPaid, status },
      });
      return p;
    });

    await prisma.paystackEvent.update({
      where: { id: eventId },
      data: {
        processed: true,
        processedAt: new Date(),
        result: `school-fee:invoice-reconciled:${payment.id}`,
      },
    });

    console.log(`[Paystack] School fee payment recorded: ${payment.id} (${amount} for invoice ${invoiceId})`);
    return { paymentId: payment.id, type: "school_fee" };
  }

  // SUBSCRIPTION PAYMENT: platform billing
  if (paymentType === "subscription") {
    const schoolId = metadata.schoolId ?? metadata.school_id;
    if (!schoolId) {
      throw new Error("Subscription payment missing schoolId");
    }

    // Create subscription payment record and activate school
    const subscriptionExpiresAt = new Date();
    subscriptionExpiresAt.setDate(subscriptionExpiresAt.getDate() + 120); // 120 days (4 terms)

    const result = await prisma.$transaction(async (tx) => {
      // Create payment record
      const p = await tx.payment.create({
        data: { amount, method: "ONLINE", reference, recordedBy: "Paystack-webhook" },
      });

      // Activate school and set subscription expiry
      const school = await tx.school.update({
        where: { id: schoolId },
        data: {
          status: "ACTIVE",
          subscriptionExpiresAt,
        },
      });

      // Log activation event
      await tx.platformAuditLog.create({
        data: {
          event: "SUBSCRIPTION_ACTIVATED",
          schoolId,
          details: `School activated after subscription payment. Reference: ${reference}, Amount: ${amount}, Expires: ${subscriptionExpiresAt.toISOString()}`,
        },
      });

      return { paymentId: p.id, school };
    });

    await prisma.paystackEvent.update({
      where: { id: eventId },
      data: {
        processed: true,
        processedAt: new Date(),
        result: `subscription:activated:school:${schoolId}:payment:${result.paymentId}`,
      },
    });

    console.log(
      `[Paystack] School ${schoolId} activated after subscription payment ${result.paymentId} (expires ${subscriptionExpiresAt.toISOString()})`
    );
    return { paymentId: result.paymentId, type: "subscription", activated: true, expiresAt: subscriptionExpiresAt };
  }

  // DEFAULT: untyped payment (backward compatibility)
  const invoiceId = metadata.invoiceId ?? metadata.invoice_id;
  if (invoiceId) {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (invoice) {
      const newPaid = invoice.amountPaid + amount;
      const status = newPaid >= invoice.amountDue ? "PAID" : "PART_PAID";
      const payment = await prisma.$transaction(async (tx) => {
        const p = await tx.payment.create({
          data: { invoiceId: invoice.id, amount, method: "ONLINE", reference, recordedBy: "Paystack-webhook" },
        });
        await tx.invoice.update({ where: { id: invoice.id }, data: { amountPaid: newPaid, status } });
        return p;
      });
      await prisma.paystackEvent.update({
        where: { id: eventId },
        data: { processed: true, processedAt: new Date(), result: `default:invoice-reconciled:${payment.id}` },
      });
      return { paymentId: payment.id };
    }
  }

  // Unmatched payment — record and log
  const p = await prisma.payment.create({
    data: { amount, method: "ONLINE", reference, recordedBy: "Paystack-webhook" },
  });
  await prisma.paystackEvent.update({
    where: { id: eventId },
    data: { processed: true, processedAt: new Date(), result: `default:unmatched:created-payment:${p.id}` },
  });

  console.warn(`[Paystack] Unmatched payment: ${reference} (${amount})`);
  return { paymentId: p.id, warning: "unmatched" };
}

/**
 * Handle charge.failed event
 */
async function handleChargeFailed(eventId: string, data: any) {
  const reference = data.reference as string;
  const reason = data.failure_reason ?? "unknown";

  console.error(`[Paystack] Charge failed: ${reference} - ${reason}`);

  await prisma.paystackEvent.update({
    where: { id: eventId },
    data: {
      processed: true,
      processedAt: new Date(),
      result: `charge-failed:${reason}`,
    },
  });

  return { failed: true, reference, reason };
}

/**
 * Fetch and process all pending Paystack events
 * Useful for background worker jobs
 */
export async function processPendingPaystackEvents() {
  const pending = await prisma.paystackEvent.findMany({
    where: { processed: false },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  let succeeded = 0;
  let failed = 0;

  for (const event of pending) {
    try {
      await processPaystackEventById(event.id);
      succeeded++;
    } catch (error) {
      console.error(`[Paystack] Failed to process event ${event.id}:`, error);
      failed++;
    }
  }

  return { processed: pending.length, succeeded, failed };
}
