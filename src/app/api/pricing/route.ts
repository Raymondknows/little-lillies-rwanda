import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend-url";

export async function GET() {
  try {
    const response = await fetch(`${getBackendUrl()}/api/pricing`, { cache: "no-store" });
    const data = await response.json().catch(() => null);
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ error: "Unable to load pricing." }, { status: 502 });
  }
}
