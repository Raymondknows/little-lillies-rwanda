import { NextRequest, NextResponse } from "next/server";
import { requirePlatformAdminSession } from "@/lib/auth";
// Database access removed - use backend API instead

export async function GET(request: NextRequest) {
  try {
    await requirePlatformAdminSession();

    const searchParams = request.nextUrl.searchParams;
    const emailType = searchParams.get("emailType") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const where: any = {};
    if (emailType) where.emailType = emailType;

    // Guard: some runtime environments may not have a generated Prisma client
    // that exposes the `emailLog` model (e.g. missing `prisma generate`). In
    // that case return an empty list and log a helpful message instead of
    // throwing a server error which breaks the admin UI.
    if (!prisma || !prisma.emailLog || typeof prisma.emailLog.findMany !== "function") {
      console.warn("Prisma client does not expose `emailLog`. Did you run `prisma generate`?");
      return NextResponse.json({ logs: [], totalCount: 0 });
    }

    const [logs, totalCount] = await Promise.all([
      prisma.emailLog.findMany({
        where,
        orderBy: { sentAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          school: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.emailLog.count({ where }),
    ]);

    const formattedLogs = logs.map((log) => ({
      id: log.id,
      schoolId: log.schoolId,
      schoolName: log.school?.name,
      recipientEmail: log.recipientEmail,
      recipientName: log.recipientName,
      emailType: log.emailType,
      subject: log.subject,
      sentAt: log.sentAt.toISOString(),
      status: log.status,
    }));

    return NextResponse.json({ logs: formattedLogs, totalCount });
  } catch (error) {
    console.error("Failed to get email logs:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
