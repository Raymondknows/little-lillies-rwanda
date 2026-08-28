import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

const SESSION_COOKIE = "schoolbase_session";

function secret() {
  return new TextEncoder().encode(
    process.env.SESSION_SECRET ?? "schoolbase-dev-secret-change-me",
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = typeof body?.token === "string" ? body.token : "";
    if (!token) return NextResponse.json({ error: "Session token is required." }, { status: 400 });

    const { payload } = await jwtVerify(token, secret());
    if (!payload.userId || !payload.role) {
      return NextResponse.json({ error: "Invalid session token." }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid session token." }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
