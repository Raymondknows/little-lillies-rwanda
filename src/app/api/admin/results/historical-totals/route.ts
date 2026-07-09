import { getStaffSession } from '@/lib/auth';
import { buildApiUrl } from '@/lib/api-client';
import { NextRequest, NextResponse } from 'next/server';

async function proxyHistoricalTotalsRequest(request: NextRequest) {
  try {
    const session = await getStaffSession();
    const schoolId = session?.schoolId || request.headers.get('x-school-id') || '';

    if (!schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = buildApiUrl('/admin/results/historical-totals');
    const headers: Record<string, string> = {
      'x-school-id': schoolId,
      cookie: request.headers.get('cookie') || '',
    };

    const method = request.method;
    const body = method === 'GET' ? undefined : await request.text();

    if (body) {
      headers['content-type'] = 'application/json';
    }

    const response = await fetch(url, {
      method,
      headers,
      body,
    });

    const responseText = await response.text();
    return new NextResponse(responseText, {
      status: response.status,
      headers: {
        'content-type': response.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('Error proxying historical totals request:', error);
    return NextResponse.json({ error: 'Failed to proxy historical totals request' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return proxyHistoricalTotalsRequest(request);
}

export async function POST(request: NextRequest) {
  return proxyHistoricalTotalsRequest(request);
}
