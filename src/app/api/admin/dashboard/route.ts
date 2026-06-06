import { NextResponse } from 'next/server';
import { getCurrentSchoolId } from '@/lib/school';
import { buildApiUrl } from '@/lib/api-client';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const search = url.search || '';

    let backendUrl = buildApiUrl('/admin/dashboard', search);

    const params = new URLSearchParams(search.replace(/^\?/, ''));

    if (!params.get('schoolId')) {
      try {
        const schoolId = await getCurrentSchoolId();
        const sep = backendUrl.includes('?') ? '&' : '?';
        backendUrl = `${backendUrl}${sep}schoolId=${encodeURIComponent(schoolId)}`;
      } catch (e) {
        console.warn('Could not determine current school id for dashboard proxy');
      }
    }

    const resp = await fetch(backendUrl, { headers: { cookie: request.headers.get('cookie') || '' } });
    const body = await resp.arrayBuffer();
    const headers = new Headers(resp.headers);
    return new NextResponse(body, { status: resp.status, headers });
  } catch (err) {
    console.error('Proxy /api/admin/dashboard error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
