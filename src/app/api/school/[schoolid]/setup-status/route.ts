import { NextRequest, NextResponse } from "next/server";
import { requirePlatformAdminSession } from "@/lib/auth";
import { checkSchoolSetup } from "@/lib/setup-checker";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schoolid: string }> }
) {
  try {
    await requirePlatformAdminSession();

    const { schoolid: schoolId } = await params;
    const status = await checkSchoolSetup(schoolId);

    return NextResponse.json({
      ...status,
      completionPercent: status.completionPercentage,
    });
  } catch (error) {
    console.error("Failed to get setup status:", error);
    return NextResponse.json(
      { error: "Failed to get setup status" },
      { status: 500 }
    );
  }
}
