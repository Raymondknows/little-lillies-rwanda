import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Legacy alias for the canonical frontend login proxy.
  // The active login page posts to /api/auth/login, so we keep /api/auth/school-login
  // as a compatible redirect target for any stale callers.
  return NextResponse.redirect(new URL('/api/auth/login', request.url), 307);
}
