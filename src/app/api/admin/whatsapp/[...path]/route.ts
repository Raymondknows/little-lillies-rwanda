import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || process.env.API_URL || "http://localhost:3006";

const getBackendUrl = (pathSegments: string[]): string => {
  const path = pathSegments.join("/");
  return `${BACKEND_URL.replace(/\/+$/, "")}/api/admin/whatsapp/${path}`;
};

const forwardRequest = async (request: NextRequest, pathSegments: string[]) => {
  const url = new URL(getBackendUrl(pathSegments));
  url.search = request.nextUrl.search;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (key === "host" || key === "content-length") {
      return;
    }
    headers.set(key, value);
  });

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD" && request.method !== "OPTIONS") {
    const bodyText = await request.text();
    if (bodyText) {
      init.body = bodyText;
    }
  }

  try {
    const response = await fetch(url.toString(), init);
    const responseBody = await response.arrayBuffer();
    const responseHeaders = new Headers(response.headers);

    // Remove hop-by-hop headers that NextResponse will handle itself.
    responseHeaders.delete("transfer-encoding");
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("connection");

    return new NextResponse(responseBody, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('[WHATSAPP PROXY] Failed to forward request to backend:', url.toString(), error);
    return NextResponse.json(
      { error: 'Failed to forward request to backend', details: String(error) },
      { status: 502 }
    );
  }
};

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { params } = context;
  return forwardRequest(request, (await params).path);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { params } = context;
  return forwardRequest(request, (await params).path);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { params } = context;
  return forwardRequest(request, (await params).path);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { params } = context;
  return forwardRequest(request, (await params).path);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { params } = context;
  return forwardRequest(request, (await params).path);
}

export async function OPTIONS(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { params } = context;
  return forwardRequest(request, (await params).path);
}
