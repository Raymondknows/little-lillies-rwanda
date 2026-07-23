import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/backend-url';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const backendUrl = getBackendUrl();
    
    // Get x-school-id from request headers
    const schoolId = request.headers.get('x-school-id');
    
    // Forward request body (e.g., optional `reason`) to backend
    const body = await request.json().catch(() => null);

    const response = await fetch(`${backendUrl}/api/results/unlock/${id}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        // Forward x-school-id header
        ...(schoolId && {
          'x-school-id': schoolId,
        }),
        // Forward cookies from the request
        ...(request.headers.get('cookie') && {
          cookie: request.headers.get('cookie') || '',
        }),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: errorData.error || `Backend returned ${response.status}`,
          message: errorData.message || errorData.error || `Backend returned ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error unlocking assessment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to unlock assessment' },
      { status: 500 }
    );
  }
}
