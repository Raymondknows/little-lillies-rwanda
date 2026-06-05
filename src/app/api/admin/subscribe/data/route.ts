import { getCurrentSchoolId } from '@/lib/school';
import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/proxy-url';

const apiBase = process.env.BACKEND_API_URL || '/api';

export async function GET(request: NextRequest) {
  try {
    const params = new URL(request.url).searchParams;
    let backendUrl = getBackendUrl(apiBase, '/api/admin/subscribe/data');

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

    if (!resp.ok) {
      return NextResponse.json({ error: `Backend error: ${resp.status}` }, { status: resp.status });
    }

    const body = await resp.json();
    return NextResponse.json(body, { status: resp.status });
  } catch (error) {
    console.error('Error fetching subscribe data:', error);
    return NextResponse.json({ error: 'Failed to fetch subscribe data' }, { status: 500 });
  }
}
