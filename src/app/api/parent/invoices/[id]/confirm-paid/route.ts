import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Use the backend API instead for confirming invoice payment." },
    { status: 503 },
  );
}
