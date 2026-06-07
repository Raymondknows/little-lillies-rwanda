import { NextResponse } from "next/server";
// Database access removed - use backend API instead
import { requirePlatformAdminSession } from "@/lib/auth";

export async function PATCH(request: Request) {
  await requirePlatformAdminSession();
  const body = await request.json();
  const { settings } = body as { settings: Record<string, string> };

  if (!settings || typeof settings !== "object") {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  try {
    // Upsert each setting key
    await Promise.all(
      Object.entries(settings).map(([key, value]) =>
        (prisma as any).platformSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        }),
      ),
    );

    return NextResponse.json({ message: "Saved" });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).message || "Save failed" }, { status: 500 });
  }
}
