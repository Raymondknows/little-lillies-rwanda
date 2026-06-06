import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const backend = process.env.BACKEND_URL || process.env.API_URL || "http://127.0.0.1:3006";
    const url = `${backend.replace(/\/$/, '')}/api/whatsapp/retry`;

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: await req.text(),
    });

    const data = await resp.json().catch(() => ({}));
    return NextResponse.json(data, { status: resp.status });
  } catch (err) {
    console.error('[WHATSAPP RETRY] Proxy error:', err);
    return NextResponse.json({ error: 'Failed to proxy retry to backend' }, { status: 500 });
  }
}
