import { getCurrentSchoolId } from '@/lib/school';
import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl } from '@/lib/api-client';

export async function GET(request: NextRequest) {
  try {
    const params = new URL(request.url).searchParams;
    let backendUrl = buildApiUrl('/admin/communications/rules');

    if (!params.get('schoolId')) {
      const schoolId = await getCurrentSchoolId();
      if (schoolId) {
        backendUrl += `?schoolId=${encodeURIComponent(schoolId)}`;
      }
    }

    const resp = await fetch(backendUrl, {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    });

    const body = await resp.text();
    const contentType = resp.headers.get('content-type') || '';

    if (!resp.ok) {
      try {
        const errorBody = body ? JSON.parse(body) : null;
        if (resp.status === 403 && errorBody?.code === 'SUBSCRIPTION_INACTIVE') {
          return NextResponse.json(errorBody, { status: resp.status });
        }
        return NextResponse.json(errorBody || { error: `Backend error: ${resp.status}` }, { status: resp.status });
      } catch {
        return new NextResponse(body || `Backend error: ${resp.status}`, {
          status: resp.status,
          headers: { 'content-type': contentType || 'application/json' },
        });
      }
    }

    if (!body) {
      return NextResponse.json({ success: true, rules: {} }, { status: 200 });
    }

    if (contentType.includes('application/json')) {
      return NextResponse.json(JSON.parse(body), { status: resp.status });
    }

    return new NextResponse(body, {
      status: resp.status,
      headers: { 'content-type': contentType || 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching communication rules:', error);
    return NextResponse.json({ error: 'Failed to fetch communication rules' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const params = new URL(request.url).searchParams;
    let backendUrl = buildApiUrl('/admin/communications/rules');

    if (!params.get('schoolId')) {
      const schoolId = await getCurrentSchoolId();
      if (schoolId) {
        backendUrl += `?schoolId=${encodeURIComponent(schoolId)}`;
      }
    }

    const body = await request.text();

    const resp = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        cookie: request.headers.get('cookie') || '',
      },
      body,
    });

    const responseBody = await resp.text();
    const contentType = resp.headers.get('content-type') || '';

    if (!resp.ok) {
      try {
        const errorBody = responseBody ? JSON.parse(responseBody) : null;
        return NextResponse.json(errorBody || { error: `Backend error: ${resp.status}` }, { status: resp.status });
      } catch {
        return new NextResponse(responseBody || `Backend error: ${resp.status}`, {
          status: resp.status,
          headers: { 'content-type': contentType || 'application/json' },
        });
      }
    }

    if (!responseBody) {
      return NextResponse.json({ success: true, rules: {} }, { status: 200 });
    }

    if (contentType.includes('application/json')) {
      return NextResponse.json(JSON.parse(responseBody), { status: resp.status });
    }

    return new NextResponse(responseBody, {
      status: resp.status,
      headers: { 'content-type': contentType || 'application/json' },
    });
  } catch (error) {
    console.error('Error updating communication rules:', error);
    return NextResponse.json({ error: 'Failed to update communication rules' }, { status: 500 });
  }
}
