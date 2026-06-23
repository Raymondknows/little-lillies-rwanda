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
  } catch (error) {
    console.error('Error fetching teachers data:', error);
    return NextResponse.json({ error: 'Failed to fetch teachers data' }, { status: 500 });
  }
}
