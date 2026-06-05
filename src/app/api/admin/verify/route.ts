import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/proxy-url';

export async function POST(request: Request) {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api';
    const backendUrl = getBackendUrl(apiBase, '/api/admin/verify');

    const body = await request.text();
    
    const resp = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: request.headers.get('cookie') || '',
      },
      body: body || '{}',
    });

    const data = await resp.json().catch(async () => {
      const text = await resp.text();
      return { text };
    });

    return NextResponse.json(data, { status: resp.status });
  } catch (err) {
    console.error('Proxy /api/admin/verify error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
