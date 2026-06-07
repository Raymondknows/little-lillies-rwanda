import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Use the backend API instead for impersonation." },
    { status: 503 },
  );
}
