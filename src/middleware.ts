import { jwtVerify, SignJWT } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const STAFF_COOKIE = "schoolbase_staff";
const PARENT_COOKIE = "schoolbase_parent";

function secret() {
  return new TextEncoder().encode(
    process.env.SESSION_SECRET ?? "schoolbase-dev-secret-change-me",
  );
}

async function hasValidToken(cookie?: string) {
  if (!cookie) return false;
  try {
    const result = await jwtVerify(cookie, secret());
    // Check if token is expired
    if (result.payload.exp) {
      const now = Math.floor(Date.now() / 1000);
      if (result.payload.exp < now) {
        return false; // Token is expired
      }
    }
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Clear invalid tokens to prevent infinite redirect loops
  const staffCookie = request.cookies.get(STAFF_COOKIE)?.value;
  const isValidStaffToken = staffCookie ? await hasValidToken(staffCookie) : false;

  if (pathname.startsWith("/admin")) {
    if (!isValidStaffToken) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname);
      const response = NextResponse.redirect(login);
      // Clear the invalid cookie
      response.cookies.delete(STAFF_COOKIE);
      return response;
    }
  }

  if (pathname.startsWith("/teacher")) {
    if (!isValidStaffToken) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname);
      const response = NextResponse.redirect(login);
      // Clear the invalid cookie
      response.cookies.delete(STAFF_COOKIE);
      return response;
    }
  }

  if (
    pathname.startsWith("/parent") &&
    !pathname.startsWith("/parent/login")
  ) {
    const ok = await hasValidToken(request.cookies.get(PARENT_COOKIE)?.value);
    if (!ok) {
      return NextResponse.redirect(new URL("/parent/login", request.url));
    }
  }

  // Multi-tenant: detect subdomain and set a `schoolSlug` cookie for server-side resolution.
  try {
    const hostname = request.nextUrl.hostname; // e.g. school1.example.com
    if (hostname && !hostname.startsWith("localhost") && hostname.includes(".")) {
      const parts = hostname.split(".");
      if (parts.length >= 3) {
        const subdomain = parts[0];
        const current = request.cookies.get("schoolSlug")?.value;
        // Prefer a versioned, signed cookie to avoid accidental or malicious tampering.
        const newCookieName = "schoolSlug_v2";
        if (current !== subdomain) {
          // Sign the slug to prevent client-side tampering and set as an httpOnly cookie
          const token = await new SignJWT({ slug: subdomain })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("1h")
            .sign(secret());

          const res = NextResponse.next();
          res.cookies.set(newCookieName, token, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60,
          });
          return res;
        }
      }
    }
  } catch (e) {
    // best-effort; don't block requests
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/parent/:path*"],
};
