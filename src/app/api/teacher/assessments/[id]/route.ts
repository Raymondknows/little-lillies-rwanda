import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/backend-url';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id = '';

  try {
    ({ id } = await params);
    const backendUrl = getBackendUrl();
    const search = request.nextUrl.search || '';
    
    const response = await fetch(`${backendUrl}/api/teacher/assessments/${id}${search}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        // Forward cookies from the request
        ...(request.headers.get('cookie') && {
          cookie: request.headers.get('cookie') || '',
        }),
      },
    });

    if (!response.ok) {
      const backendText = await response.text().catch(() => '');
      return NextResponse.json(
        {
          error: `Backend ${backendUrl} returned ${response.status}`,
          backendError: backendText || undefined,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    const backendUrl = getBackendUrl();
    console.error(`Error fetching assessment ${id || '<unknown>'} from ${backendUrl}:`, error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch assessment',
        backendUrl,
      },
      { status: 500 }
    );
  }
}
