import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/backend-url';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assessmentId: string; pupilId: string }> }
) {
  try {
    const { assessmentId, pupilId } = await params;
    const backendUrl = getBackendUrl();
    
    // Get x-school-id from request headers
    const schoolId = request.headers.get('x-school-id');
    
    const response = await fetch(
      `${backendUrl}/api/pdf-reports/${assessmentId}/${pupilId}`,
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
        'Content-Disposition': `attachment; filename="report-${assessmentId}-${pupilId}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Error downloading PDF:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to download PDF' },
      { status: 500 }
    );
  }
}
