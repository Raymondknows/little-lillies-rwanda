import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3006';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Login attempt:', { email: body.email, backendUrl: BACKEND_URL });
    
    // Proxy to backend API
    const response = await fetch(`${BACKEND_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Backend error:', { status: response.status, data });
      return NextResponse.json(data, { status: response.status });
    }

    // Extract token and set as httpOnly cookie
    const res = NextResponse.json(data);
    if (data.token) {
      res.cookies.set('schoolbase_staff', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });
    }

    return res;
  } catch (error) {
    console.error('Login error:', error);
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
