import { NextResponse } from "next/server";
import { processPaystackEventById } from "@/lib/paystack-processor";

export async function POST(request: Request, context: any) {
  const rawParams = context?.params;
  const params = rawParams && typeof rawParams.then === "function" ? await rawParams : rawParams;
  const eventId = params?.eventId as string;
  // internal secret check to prevent public invocation
  const header = request.headers.get("x-internal-secret");
  const secret = process.env.PAYSTACK_PROCESS_SECRET;
  if (secret && header !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await processPaystackEventById(eventId);
    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error("Process event error:", err);
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}
