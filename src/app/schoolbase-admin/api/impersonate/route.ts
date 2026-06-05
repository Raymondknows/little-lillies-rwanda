import { NextRequest, NextResponse } from "next/server";
import { requirePlatformAdminSession, createStaffSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await requirePlatformAdminSession();
  const body = await request.json();
  const { schoolId } = body as { schoolId: string };
  if (!schoolId) {
    return NextResponse.json({ message: "School ID is required." }, { status: 400 });
  }

  await createStaffSession({
    userId: session.userId,
    schoolId,
    email: session.email,
    name: session.name,
    role: session.role,
  });

  return NextResponse.json({ message: "Impersonation session started." });
}
