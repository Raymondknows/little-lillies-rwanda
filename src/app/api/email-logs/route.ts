import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "Use backend API instead" }, { status: 503 });
}
