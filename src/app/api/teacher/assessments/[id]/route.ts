import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/backend-url';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const backendUrl = getBackendUrl();
    
    const response = await fetch(`${backendUrl}/api/teacher/assessments/${id}`, {
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
      return NextResponse.json(
        { error: `Backend returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching assessment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch assessment' },
      { status: 500 }
    );
  }
}
