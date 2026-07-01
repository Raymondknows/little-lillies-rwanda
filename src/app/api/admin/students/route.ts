import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl } from '@/lib/api-client';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const backendUrl = buildApiUrl('/admin/students');

    // Forward only safe headers + content-type when present
    const headers: Record<string, string> = {
      cookie: request.headers.get('cookie') || '',
      authorization: request.headers.get('authorization') || '',
    };
    const contentType = request.headers.get('content-type') || '';
    if (contentType) headers['content-type'] = contentType;

    const isMultipart = contentType.includes('multipart/form-data');
    const isJson = contentType.includes('application/json');

    if (isMultipart) {
      // stream raw body and preserve content-type (boundary)
      const fetchOptions: any = {
        method: 'POST',
        headers,
        body: request.body,
        duplex: 'half' as const,
      };
      const resp = await fetch(backendUrl, fetchOptions);

      // preserve status and either forward JSON or raw text
      const ct = resp.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const data = await resp.json();
        return NextResponse.json(data, { status: resp.status });
      } else {
        const text = await resp.text();
        return new NextResponse(text, {
          status: resp.status,
          headers: { 'content-type': ct || 'text/plain' },
        });
      }
    }

    if (isJson) {
      const body = await request.text();
      headers['content-type'] = 'application/json';
      const resp = await fetch(backendUrl, { method: 'POST', headers, body });
      const data = await resp.json().catch(() => ({}));
      return NextResponse.json(data, { status: resp.status });
    }

    // fallback: stream body + headers
    const fetchOptions: any = {
      method: 'POST',
      headers,
      body: request.body,
      duplex: 'half' as const,
    };
    const resp = await fetch(backendUrl, fetchOptions);
    const ct = resp.headers.get('content-type') || '';
    const text = await resp.text().catch(() => '');
    return new NextResponse(text, { status: resp.status, headers: { 'content-type': ct || 'text/plain' } });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
}