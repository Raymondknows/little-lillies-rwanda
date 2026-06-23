import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend-url";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const backendUrl = getBackendUrl();

    const response = await fetch(`${backendUrl}/schoolbase-admin/api/support/reply`, {
      method: 'PATCH',
      headers: {
        Cookie: request.headers.get('cookie') || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({ message: 'Failed to parse response.' }));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error proxying support reply:', error);
    return NextResponse.json({ message: 'Failed to proxy support reply.' }, { status: 500 });
  }
}
