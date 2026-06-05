import { NextResponse } from "next/server";
import { readFile, appendFile } from "fs/promises";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST() {
  const path = "publish/whatsapp_deliveries.jsonl";
  let content: string;
  try {
    content = await readFile(path, "utf8");
  } catch (err) {
    return NextResponse.json({ error: "No deliveries log found." }, { status: 404 });
  }

  const lines = content.trim().split(/\r?\n/).filter(Boolean);
  const parsed = lines.map((l) => {
    try {
      return JSON.parse(l);
    } catch (e) {
      return null;
    }
  }).filter(Boolean) as Array<any>;

  // Find recent failures (most recent first)
  const failures = parsed.reverse().filter((p) => !p.success && p.reason !== "missing-credentials");

  const toRetry = failures.slice(0, 50);
  const results: Array<any> = [];

  for (const f of toRetry) {
    try {
      const ok = await sendWhatsAppMessage(f.to, f.body ?? "", f.schoolId);
      const entry = { time: new Date().toISOString(), to: f.to, body: (f.body ?? "").slice(0, 200), success: ok, retriedFrom: f.time, schoolId: f.schoolId ?? null };
      results.push(entry);
      await appendFile(path, JSON.stringify(entry) + "\n");
    } catch (err: any) {
      const entry = { time: new Date().toISOString(), to: f.to, body: (f.body ?? "").slice(0, 200), success: false, reason: err?.message ?? String(err), retriedFrom: f.time, schoolId: f.schoolId ?? null };
      results.push(entry);
      try {
        await appendFile(path, JSON.stringify(entry) + "\n");
      } catch (e) {
        console.error("Failed to append retry log:", e);
      }
    }
  }

  return NextResponse.json({ retried: results.length, results });
}
