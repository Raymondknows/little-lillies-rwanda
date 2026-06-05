import { NextResponse } from "next/server";
import { SUPPORTED_COUNTRIES, makeCountryCookie } from "@/lib/country";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const country = String(body.country || "").toUpperCase();
    if (!country) return NextResponse.json({ error: "country required" }, { status: 400 });
    if (!SUPPORTED_COUNTRIES.includes(country)) {
      return NextResponse.json({ error: "unsupported country" }, { status: 400 });
    }
    const cookie = await makeCountryCookie(country);
    return new Response(JSON.stringify({ ok: true, country }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Set-Cookie": cookie },
    });
  } catch (err) {
    console.error("/api/country/select error", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
