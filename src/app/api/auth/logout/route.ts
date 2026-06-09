import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true }, { status: 200 });

  // ✅ CRITICAL: Delete cookies with EXACT same options as when they were set
  // This ensures the browser recognizes them as the same cookie
  response.cookies.set('schoolbase_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? '.schoolbase.live' : undefined,
    maxAge: 0, // This tells browser to DELETE the cookie
  });

  // Also clear legacy cookies
  response.cookies.set('schoolbase_staff', '', {
    maxAge: 0,
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
  });

  response.cookies.set('schoolbase_parent', '', {
    maxAge: 0,
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
  });

  return response;
}
