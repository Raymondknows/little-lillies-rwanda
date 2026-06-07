import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

function secret() {
  return new TextEncoder().encode(
    process.env.SESSION_SECRET ?? 'schoolbase-dev-secret-change-me',
  );
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const staffToken = cookieStore.get('schoolbase_staff')?.value;

    if (!staffToken) {
      return Response.json({ session: null });
    }

    try {
      const { payload } = await jwtVerify(staffToken, secret());
      return Response.json({ session: payload });
    } catch {
      return Response.json({ session: null });
    }
  } catch (error) {
    console.error('Error fetching session:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
