import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend-url";

const SESSION_COOKIE_NAME = "schoolbase_session";
const LEGACY_SESSION_COOKIE_NAMES = ["littlelillies_session", "schoolbase_staff", "schoolbase_parent"];

function getSessionCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  } as const;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const backendUrl = getBackendUrl();
    const incomingSessionToken =
      req.cookies.get(SESSION_COOKIE_NAME)?.value ||
      req.cookies.get("littlelillies_session")?.value ||
      req.cookies.get("schoolbase_staff")?.value ||
      req.cookies.get("schoolbase_parent")?.value;
    
    const response = await fetch(
      `${backendUrl}/schoolbase-admin/api/impersonate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(incomingSessionToken ? { "x-schoolbase-session": incomingSessionToken } : {}),
        },
        body: JSON.stringify(body),
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }
    
    const data = await response.json();
    let sessionToken = data?.token;

    if (sessionToken) {
      const exchangeResponse = await fetch(
        `${backendUrl}/schoolbase-admin/api/impersonate/exchange`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: sessionToken }),
        },
      );

      const exchangeData = await exchangeResponse.json();
      if (!exchangeResponse.ok || !exchangeData?.token) {
        return NextResponse.json(
          exchangeData?.message ? { message: exchangeData.message } : { message: "Impersonation exchange failed" },
          { status: exchangeResponse.ok ? 502 : exchangeResponse.status },
        );
      }

      sessionToken = exchangeData.token;
    }

    const json = NextResponse.json({
      message: "Impersonation session created.",
      redirectUrl: "/admin",
    });

    if (sessionToken) {
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
      json.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
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
