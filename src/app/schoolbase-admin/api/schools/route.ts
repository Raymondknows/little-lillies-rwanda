import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePlatformAdminSession } from "@/lib/auth";
import { recordPlatformAuditLog } from "@/lib/platform-admin";

export async function PATCH(request: NextRequest) {
  const session = await requirePlatformAdminSession();
  const body = await request.json();
  const { schoolId, action, plan, days } = body as {
    schoolId: string;
    action: string;
    plan?: string;
    days?: number;
  };

  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  if (!school) {
    return NextResponse.json({ message: "School not found." }, { status: 404 });
  }

  let updateData: Record<string, unknown> = {};
  let auditDetails = "";

  switch (action) {
    case "suspend":
      updateData.status = "SUSPENDED";
      auditDetails = `Suspended school ${school.name}`;
      break;
    case "activate":
      updateData.status = "ACTIVE";
      auditDetails = `Activated school ${school.name}`;
      break;
    case "upgrade":
      updateData.plan = plan ?? (school as any).plan;
      updateData.status = "ACTIVE";
      auditDetails = `Upgraded ${school.name} to ${plan}`;
      break;
    case "extendTrial":
      if (!days) {
        return NextResponse.json({ message: "Days are required to extend trial." }, { status: 400 });
      }
      updateData.trialEndsAt = (school as any).trialEndsAt
        ? new Date(((school as any).trialEndsAt as Date).getTime() + days * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      auditDetails = `Extended trial for ${school.name} by ${days} days`;
      break;
    case "cancel":
      updateData.status = "CANCELLED";
      auditDetails = `Cancelled subscription for ${school.name}`;
      break;
    default:
      return NextResponse.json({ message: "Unsupported action." }, { status: 400 });
  }

  const updated = await prisma.school.update({
    where: { id: schoolId },
    data: updateData,
  });

  await recordPlatformAuditLog({
    event: `platform.${action}`,
    details: auditDetails,
    schoolId: school.id,
    userId: session.userId,
  });

  return NextResponse.json({ message: "School updated.", school: updated });
}
