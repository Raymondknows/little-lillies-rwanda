import { prisma } from "@/lib/db";

export type SetupStatus = {
  isComplete: boolean;
  completionPercentage: number;
  incompleteTasks: string[];
};

export async function checkSchoolSetup(schoolId: string): Promise<SetupStatus> {
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    include: {
      users: {
        where: { role: "TEACHER" },
        select: { id: true },
      },
      classes: {
        select: { id: true },
      },
      academicYears: {
        select: { id: true },
      },
    },
  });

  if (!school) {
    return {
      isComplete: false,
      completionPercentage: 0,
      incompleteTasks: ["School not found"],
    };
  }

  const incompleteTasks: string[] = [];
  let completedCount = 0;
  const totalTasks = 8;

  // 1. Principal name
  if (!school.principalName) {
    incompleteTasks.push("Add principal name and details");
  } else {
    completedCount++;
  }

  // 2. School logo
  if (!school.logoUrl) {
    incompleteTasks.push("Upload school logo");
  } else {
    completedCount++;
  }

  // 3. School contact email
  if (!school.email) {
    incompleteTasks.push("Add school contact email");
  } else {
    completedCount++;
  }

  // 4. School contact phone
  if (!school.phone) {
    incompleteTasks.push("Add school contact phone");
  } else {
    completedCount++;
  }

  // 5. School address
  if (!school.address) {
    incompleteTasks.push("Add school address and location");
  } else {
    completedCount++;
  }

  // 6. Academic year set up
  if (school.academicYears.length === 0) {
    incompleteTasks.push("Create an academic year");
  } else {
    completedCount++;
  }

  // 7. Classes/grades set up
  if (school.classes.length === 0) {
    incompleteTasks.push("Create at least one class");
  } else {
    completedCount++;
  }

  // 8. Staff members added
  if (school.users.length === 0) {
    incompleteTasks.push("Add at least one staff member");
  } else {
    completedCount++;
  }

  const completionPercentage = Math.round((completedCount / totalTasks) * 100);

  return {
    isComplete: incompleteTasks.length === 0,
    completionPercentage,
    incompleteTasks,
  };
}

/**
 * Check if a school should receive a setup completion reminder email.
 * Criteria:
 * - School is less than 7 days old
 * - Setup is incomplete (less than 100%)
 * - No reminder was sent in the last 24 hours
 */
export async function shouldSendSetupReminder(schoolId: string): Promise<boolean> {
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
  });

  if (!school) return false;

  // Check if school is less than 7 days old
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  if (school.createdAt < sevenDaysAgo) {
    return false; // School too old, likely already set up or abandoned
  }

  // Check if setup is incomplete
  const setup = await checkSchoolSetup(schoolId);
  if (setup.isComplete) {
    return false;
  }

  // TODO: Check if reminder was sent in last 24 hours (requires email tracking table)
  // For now, we'll send it every time (can be called by a cron job)

  return true;
}
