import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl } from '@/lib/api-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assessmentId: string }> }
) {
  try {
    const { assessmentId } = await params;
    // Get x-school-id from request headers
    const schoolId = request.headers.get('x-school-id');
    
    const response = await fetch(
      buildApiUrl(`/pdf-reports/ranking/${assessmentId}`),
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          // Forward x-school-id header
          ...(schoolId && {
            'x-school-id': schoolId,
          }),
          // Forward cookies from the request
          ...(request.headers.get('cookie') && {
            cookie: request.headers.get('cookie') || '',
          }),
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `Backend returned ${response.status}` },
        { status: response.status }
      );
    }

    // Return PDF blob
    const blob = await response.blob();
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ranking-${assessmentId}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Error downloading ranking PDF:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to download ranking PDF' },
      { status: 500 }
    );
  }
}
