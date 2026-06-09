import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true }, { status: 200 });

  // Clear unified session cookie and legacy cookies for backward compatibility
  response.cookies.set('schoolbase_session', '', {
    maxAge: 0,
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
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

  // Use header method for extra safety
  response.headers.append('Set-Cookie', 'schoolbase_session=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax');
  response.headers.append('Set-Cookie', 'schoolbase_staff=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax');
  response.headers.append('Set-Cookie', 'schoolbase_parent=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax');

  return response;
}
