import { getCurrentSchoolId } from '@/lib/school';
import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl } from '@/lib/api-client';

export async function GET(request: NextRequest) {
  try {
    const params = new URL(request.url).searchParams;
    let backendUrl = buildApiUrl('/admin/teachers/data');

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
    console.error('Error fetching teachers data:', error);
    return NextResponse.json({ error: 'Failed to fetch teachers data' }, { status: 500 });
  }
}
