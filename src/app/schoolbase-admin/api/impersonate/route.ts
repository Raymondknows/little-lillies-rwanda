import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend-url";

const SESSION_COOKIE_NAME = "littlelillies_session";
const LEGACY_SESSION_COOKIE_NAMES = ["schoolbase_staff", "schoolbase_parent"];

function getSessionCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    ...(isProduction ? { domain: ".schoolbase.live" } : {}),
  } as const;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const backendUrl = getBackendUrl();
    
    const response = await fetch(
      `${backendUrl}/schoolbase-admin/api/impersonate`,
      {
        method: "POST",
        headers: {
          "Cookie": req.headers.get("cookie") || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }
    
    const data = await response.json();
    const json = NextResponse.json(data);

    if (data?.token) {
      const cookieOptions = getSessionCookieOptions();
      json.cookies.set(SESSION_COOKIE_NAME, "", {
        ...cookieOptions,
        maxAge: 0,
      });
      for (const legacyCookieName of LEGACY_SESSION_COOKIE_NAMES) {
        json.cookies.set(legacyCookieName, "", {
          ...cookieOptions,
          maxAge: 0,
        });
      }
      json.cookies.set(SESSION_COOKIE_NAME, data.token, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    return json;
  } catch (error) {
    console.error("Error impersonating school:", error);
    return NextResponse.json({ message: "Impersonation failed" }, { status: 500 });
  }
}
