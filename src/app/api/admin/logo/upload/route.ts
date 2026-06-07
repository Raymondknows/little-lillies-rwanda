import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "Use the backend API instead." }, { status: 503 });
}

export async function POST() {
  return NextResponse.json({ error: "Use the backend API instead." }, { status: 503 });
}
