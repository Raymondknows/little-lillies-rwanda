import { NextResponse } from 'next/server';
import { buildApiUrl } from '@/lib/api-client';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const backendUrl = buildApiUrl('/admin/impersonate');

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: request.headers.get('cookie') || '',
      },
      body: body || '{}',
    });

    const data = await response.json().catch(async () => {
      const text = await response.text();
      return { error: text };
    });

    const json = NextResponse.json(data, { status: response.status });

    if (response.ok && data?.token) {
      json.cookies.set('schoolbase_session', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    return json;
  } catch (error) {
    console.error('Proxy /api/admin/impersonate error:', error);
    return NextResponse.json({ error: 'Failed to exchange impersonation token.' }, { status: 500 });
  }
}
