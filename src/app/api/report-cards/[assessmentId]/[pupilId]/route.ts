import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl } from '@/lib/api-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assessmentId: string; pupilId: string }> }
) {
  try {
    const { assessmentId, pupilId } = await params;
    const response = await fetch(
      buildApiUrl(`/report-cards/${assessmentId}/${pupilId}`),
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          // Forward cookies from the request
          ...(request.headers.get('cookie') && {
            cookie: request.headers.get('cookie') || '',
          }),
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || `Backend returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching report card:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch report card' },
      { status: 500 }
    );
  }
}
