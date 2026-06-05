import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/$/, '');
    const url = new URL(request.url);
    const prefix = '/uploads/';
    const uploadPath = url.pathname.startsWith(prefix) ? url.pathname.slice(prefix.length) : '';
    if (!uploadPath) {
      return NextResponse.json({ error: 'Upload path required' }, { status: 400 });
    }

    const backendUrl = `${apiBase}/uploads/${uploadPath}`;
    const resp = await fetch(backendUrl, {
      headers: { cookie: request.headers.get('cookie') || '' },
      redirect: 'follow',
    });

    const body = await resp.arrayBuffer();
    const headers = new Headers(resp.headers);
    return new NextResponse(body, { status: resp.status, headers });
  } catch (err) {
    console.error('Proxy /uploads error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
