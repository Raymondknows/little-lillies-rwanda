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
    console.log("API route - fetching setup status for school:", schoolId);
    if (!schoolId) {
      console.error("Missing school id in route params");
      return NextResponse.json(
        { error: "Missing school id in route params" },
        { status: 400 }
      );
    }

    const status = await checkSchoolSetup(schoolId);

    return NextResponse.json({
      ...status,
      completionPercent: status.completionPercentage,
    });
  } catch (error) {
    console.error("Failed to get setup status:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to get setup status", details: errorMessage },
      { status: 500 }
    );
  }
}
