import { getCurrentSchoolId } from '@/lib/school';
import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl } from '@/lib/api-client';

export async function GET(request: NextRequest) {
  try {
    const schoolId = await getCurrentSchoolId();
    console.log('[Subscription API] School ID:', schoolId);
    
    if (!schoolId) {
      return NextResponse.json(
        { error: 'Not authenticated or school ID not found' },
        { status: 401 }
      );
    }

    let backendUrl = buildApiUrl('/admin/subscription/status');

    if (schoolId) {
      backendUrl += `?schoolId=${encodeURIComponent(schoolId)}`;
    }

    console.log('[Subscription API] Fetching from:', backendUrl);

    const resp = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
        'Content-Type': 'application/json',
      },
    });

    console.log('[Subscription API] Backend response status:', resp.status);

    if (!resp.ok) {
      let errorBody = await resp.json().catch(() => null);
      console.error('[Subscription API] Backend error:', errorBody);
      
      // If it's a 403, it might be a subscription guard error
      if (resp.status === 403) {
        errorBody = errorBody || { error: 'Subscription required', reason: 'Your school subscription is not active' };
      }
      
      return NextResponse.json(
        errorBody || { error: `Backend error: ${resp.status}` },
        { status: resp.status }
      );
    }

    const body = await resp.json();
    console.log('[Subscription API] Response:', body);
    return NextResponse.json(body, { status: resp.status });
  } catch (error) {
    console.error('[Subscription API] Error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Failed to fetch subscription status: ${errorMsg}` },
      { status: 500 }
    );
  }
}
