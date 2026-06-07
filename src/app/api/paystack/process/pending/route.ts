import { NextResponse } from "next/server";
// Database access removed - use backend API instead
import { processPaystackEventById } from "@/lib/paystack-processor";

export async function POST(request: Request) {
  // internal secret check to prevent public invocation
  const header = request.headers.get("x-internal-secret");
  const secret = process.env.PAYSTACK_PROCESS_SECRET;
  if (secret && header !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Process a batch of pending events
  const pending = await prisma.paystackEvent.findMany({ where: { processed: false }, orderBy: { createdAt: "asc" }, take: 100 });
  const results: Array<any> = [];

  for (const e of pending) {
    try {
      const res = await processPaystackEventById(e.id);
      results.push({ id: e.id, ok: true, res });
    } catch (err: any) {
      console.error("Failed processing event:", e.id, err);
      // mark with error result
      await prisma.paystackEvent.update({ where: { id: e.id }, data: { result: `error:${String(err?.message ?? err)}` } });
      results.push({ id: e.id, ok: false, error: String(err?.message ?? err) });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
