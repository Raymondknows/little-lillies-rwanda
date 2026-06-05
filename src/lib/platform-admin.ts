import { prisma } from "@/lib/db";
import { getPlatformAdminSession, requirePlatformAdminSession } from "@/lib/auth";

export async function getPlatformAdminDashboardData() {
  const [schoolCount, studentCount, teacherCount, recentSchools] = await Promise.all([
    prisma.school.count(),
    prisma.pupil.count(),
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.school.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        users: {
          where: { role: "SCHOOL_ADMIN" },
          select: { id: true, name: true, email: true, role: true },
        },
      },
    }),
  ]);

  // Enrich recent schools with verification status
  const recentSchoolsWithVerification = await Promise.all(
    recentSchools.map(async (school: any) => {
      const adminUser = school.users[0];
      const signupOtp = adminUser
        ? await (prisma as any).signupOtp.findUnique({
            where: { email: adminUser.email },
            select: { verifiedAt: true },
          })
        : null;

      return {
        ...school,
        isVerified: signupOtp?.verifiedAt != null || !!adminUser, // Verified if has verifiedAt OR has admin user (legacy)
      };
    })
  );

  // Prisma groupBy invocation may fail in some runtime bundles; use explicit counts instead.
  const activeCount = await prisma.school.count({ where: { status: "ACTIVE" } });
  const trialCount = await prisma.school.count({ where: { status: "TRIAL" } });
  const suspendedCount = await prisma.school.count({ where: { status: "SUSPENDED" } });

  const countryBreakdown = await prisma.school.groupBy({
    by: ["country"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  const recentActivity = await (prisma as any).platformAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { school: { select: { name: true } }, user: { select: { name: true } } },
  });

  const supportRequests = await (prisma as any).supportRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
    include: { school: { select: { name: true } } },
  });

  const attentionInvoices = await (prisma as any).invoice.findMany({
    where: { status: { in: ["PART_PAID", "OVERDUE"] } },
    orderBy: { updatedAt: "desc" },
    take: 5,
    include: { pupil: true, school: true },
  });

  return {
    schoolCount,
    activeCount,
    trialCount,
    suspendedCount,
    studentCount,
    teacherCount,
    recentSchools: recentSchoolsWithVerification,
    countryBreakdown,
    recentActivity,
    supportRequests,
    attentionInvoices,
  };
}

export async function getPlatformSettings() {
  const settings = await (prisma as any).platformSetting.findMany();
  return settings.reduce((acc: Record<string, string>, setting: any) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {} as Record<string, string>);
}

export async function getPlatformSchools() {
  const schools = await prisma.school.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      users: {
        where: { role: "SCHOOL_ADMIN" },
        select: { id: true, name: true, email: true, role: true },
      },
    },
  });

  // Enrich schools with verification status from SignupOtp table
  const schoolsWithVerification = await Promise.all(
    schools.map(async (school) => {
      const adminUser = school.users[0];
      
      let isVerified = false;
      if (adminUser) {
        const signupOtp = await (prisma as any).signupOtp.findUnique({
          where: { email: adminUser.email },
          select: { verifiedAt: true },
        });
        
        // Legacy schools (created before SignupOtp) have no record but have an admin user
        // So they must be verified. Only show as unverified if they have a SignupOtp record
        // with NO verifiedAt timestamp.
        isVerified = signupOtp == null || signupOtp.verifiedAt != null;
      }

      return {
        ...school,
        isVerified,
      };
    })
  );

  return schoolsWithVerification;
}

export async function getPlatformSchoolById(id: string) {
  return prisma.school.findUnique({
    where: { id },
    include: {
      users: {
        where: { role: "SCHOOL_ADMIN" },
        select: { id: true, name: true, email: true, role: true },
      },
    },
  });
}

export async function getPlatformSupportRequests() {
  return (prisma as any).supportRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      school: {
        select: {
          id: true,
          name: true,
          country: true,
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function recordPlatformAuditLog({
  event,
  details,
  schoolId,
  userId,
}: {
  event: string;
  details: string;
  schoolId?: string;
  userId?: string;
}) {
  return (prisma as any).platformAuditLog.create({
    data: {
      event,
      details,
      schoolId,
      userId,
    },
  });
}

export async function ensurePlatformAdmin() {
  return requirePlatformAdminSession();
}

export async function getPlatformAdminSessionSafe() {
  return getPlatformAdminSession();
}

export async function getEmailLogs(options: {
  limit?: number;
  emailType?: string;
  schoolId?: string;
  offset?: number;
} = {}) {
  const { limit = 50, emailType, schoolId, offset = 0 } = options;

  const where: any = {};
  if (emailType) where.emailType = emailType;
  if (schoolId) where.schoolId = schoolId;

  try {
    const { prisma: runtimePrisma } = await import("@/lib/db");
    if (!runtimePrisma.emailLog) {
      console.warn("Prisma client does not expose emailLog; returning empty logs.");
      return [];
    }

    const logs = await runtimePrisma.emailLog.findMany({
      where,
      orderBy: { sentAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        school: {
          select: { id: true, name: true },
        },
      },
    });

    return logs.map((log: any) => ({
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
  } catch (error) {
    console.error("Failed to load email logs:", error);
    return [];
  }
}
