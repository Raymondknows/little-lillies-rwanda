import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

function getBackendUrl() {
  if (process.env.NODE_ENV === 'production') {
    return 'https://api.schoolbase.live';
  }
  return process.env.BACKEND_URL || 'http://localhost:3006';
}

function secret() {
  return new TextEncoder().encode(
    process.env.SESSION_SECRET ?? 'schoolbase-dev-secret-change-me',
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const BACKEND_URL = getBackendUrl();
    
    console.log('=== SCHOOL LOGIN API ROUTE ===');
    
    // Proxy to backend auth/school-login
    const response = await fetch(`${BACKEND_URL}/api/auth/school-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('School login failed:', { status: response.status, data });
      return NextResponse.json(data, { status: response.status });
    }

    // Decode token to get session data
    let session = null;
    if (data.token) {
      try {
        const decoded = await jwtVerify(data.token, secret());
        session = decoded.payload;
        console.log('School user login successful:', { 
          role: session?.role, 
          userId: session?.userId,
          schoolId: session?.schoolId
        });
      } catch (e) {
        console.error('Token decode error:', e);
      }
    }

    // Set httpOnly session cookie
    const res = NextResponse.json({
      success: true,
      session,
      token: data.token,
    });
    
    if (data.token) {
      res.cookies.set('schoolbase_session', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? '.schoolbase.live' : undefined,
      });
    }

    console.log('=== SCHOOL LOGIN SUCCESS ===');
    return res;
  } catch (error) {
    console.error('=== SCHOOL LOGIN ERROR ===', error);
    return NextResponse.json({ 
      error: 'Login failed',
      debug: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
