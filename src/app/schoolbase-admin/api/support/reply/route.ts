import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  return NextResponse.json({ error: "Use backend API instead" }, { status: 503 });
}
