import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

function getBackendUrl() {
  // For production (Vercel), use api.schoolbase.live
  if (process.env.NODE_ENV === 'production') {
    return 'https://api.schoolbase.live';
  }
  // For development, use localhost
  return process.env.BACKEND_URL || 'http://localhost:3006';
}

function secret() {
  return new TextEncoder().encode(
    process.env.SESSION_SECRET ?? 'your-secret-key',
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const BACKEND_URL = getBackendUrl();
    
    console.log('=== LOGIN API ROUTE ===');
    console.log('Received body:', JSON.stringify(body));
    console.log('Content-Type header:', request.headers.get('content-type'));
    console.log('Backend URL:', BACKEND_URL);
    
    // Proxy to backend API
    const response = await fetch(`${BACKEND_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log('Backend response:', { status: response.status, success: data.success });

    if (!response.ok) {
      console.error('Backend error:', { status: response.status, data });
      return NextResponse.json(data, { status: response.status });
    }

    // Decode token to get session data
    let session = null;
    if (data.token) {
      try {
        const decoded = await jwtVerify(data.token, secret());
        session = decoded.payload;
        console.log('Decoded session:', { role: session?.role, userId: session?.userId });
      } catch (e) {
        console.error('Token decode error:', e);
        // Continue anyway, role-based routing will use redirect fallback
      }
    }

    // Extract token and set as httpOnly cookie
    const res = NextResponse.json({
      success: true,
      session, // Include decoded session data for role-based routing
      token: data.token, // Also include token in response
    });
    
    if (data.token) {
      console.log('Setting schoolbase_staff cookie');
      res.cookies.set('schoolbase_staff', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });
    }

    console.log('=== LOGIN RESPONSE SENT ===');
    return res;
  } catch (error) {
    const BACKEND_URL = getBackendUrl();
    console.error('=== LOGIN ERROR ===');
    console.error('Error:', error instanceof Error ? error.message : String(error));
    console.error('Backend URL:', BACKEND_URL);
    return NextResponse.json({ 
      error: 'Login failed',
      debug: {
        backendUrl: BACKEND_URL,
        errorMessage: error instanceof Error ? error.message : String(error)
      }
    }, { status: 500 });
  }
}
