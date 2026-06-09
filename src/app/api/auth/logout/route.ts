import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true }, { status: 200 });

  // Clear auth cookies - use multiple methods to ensure they're deleted
  response.cookies.set('schoolbase_staff', '', {
    maxAge: 0,
    path: '/',
    httpOnly: true,
    secure: false, // Set to false for development, true for production
    sameSite: 'lax',
  });

  response.cookies.set('schoolbase_parent', '', {
    maxAge: 0,
    path: '/',
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
  });

  // Also use header method for extra safety
  response.headers.append('Set-Cookie', 'schoolbase_staff=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax');
  response.headers.append('Set-Cookie', 'schoolbase_parent=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax');

  return response;
}
