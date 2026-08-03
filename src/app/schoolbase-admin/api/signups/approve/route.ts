import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend-url";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const backendUrl = getBackendUrl();

    const response = await fetch(`${backendUrl}/schoolbase-admin/api/signups/approve`, {
      method: 'POST',
      headers: {
        'Cookie': req.headers.get('cookie') || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    if (!response.ok) {
      try {
        const json = JSON.parse(text);
        return NextResponse.json(json, { status: response.status });
      } catch {
        return NextResponse.json({ error: text || 'Failed to approve signup' }, { status: response.status });
      }
    }

    try {
      const data = JSON.parse(text);
      return NextResponse.json(data);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid JSON from backend' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error proxying signup approve:', error);
    return NextResponse.json({ error: 'Failed to approve signup' }, { status: 500 });
  }
}
