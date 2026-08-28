import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend-url";

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await context.params;
    const url = new URL(`${getBackendUrl()}/schoolbase-admin/api/${path.join("/")}`);
    request.nextUrl.searchParams.forEach((value, key) => url.searchParams.append(key, value));

    const response = await fetch(url, {
      method: request.method,
      headers: {
        Cookie: request.headers.get("cookie") || "",
        "Content-Type": request.headers.get("content-type") || "application/json",
      },
      body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer(),
    });

    const data = await response.arrayBuffer();
    return new NextResponse(data, {
      status: response.status,
      headers: { "Content-Type": response.headers.get("content-type") || "application/json" },
    });
  } catch (error) {
    console.error("Error proxying platform admin request:", error);
    return NextResponse.json({ message: "Failed to proxy platform admin request." }, { status: 500 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
