import { NextResponse } from 'next/server';
import { getCurrentSchoolId } from '@/lib/school';
import { buildApiUrl } from '@/lib/api-client';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const search = url.search || '';

    let backendUrl = buildApiUrl('/admin/settings/data', search);
    const params = new URLSearchParams(search.replace(/^\?/, ''));

    if (!params.get('schoolId')) {
      try {
        const schoolId = await getCurrentSchoolId();
        const sep = backendUrl.includes('?') ? '&' : '?';
        backendUrl = `${backendUrl}${sep}schoolId=${encodeURIComponent(schoolId)}`;
      } catch (e) {
        console.warn('Could not determine current school id for settings data proxy');
        return NextResponse.json(
          { error: 'Unauthorized', code: 'AUTH_REQUIRED', message: 'Please sign in to continue.' },
          { status: 401 }
        );
      }
    }

    const resp = await fetch(backendUrl, { headers: { cookie: request.headers.get('cookie') || '' } });
    
    if (!resp.ok) {
      const errorBody = await resp.json().catch(() => null);
      // Forward subscription error information if present
      if (resp.status === 403 && errorBody?.code === 'SUBSCRIPTION_INACTIVE') {
        return NextResponse.json(errorBody, { status: resp.status });
      }
      return NextResponse.json(
        errorBody || { error: `Backend error: ${resp.status}` },
        { status: resp.status }
      );
    }

    const body = await resp.json();
    return NextResponse.json(body, { status: resp.status });
  } catch (err) {
    console.error('Proxy /api/admin/settings/data error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
