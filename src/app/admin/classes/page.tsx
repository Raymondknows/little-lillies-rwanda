import { prisma } from "@/lib/db";
import { getCurrentSchoolId } from "@/lib/school";
import ClassesPageClient from "./classes-client";

export default async function AdminClassesPage() {
  const schoolId = await getCurrentSchoolId();
  const classes = await prisma.class.findMany({
    where: { schoolId },
    orderBy: [{ phase: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          pupils: true,
          subjectClasses: true,
        },
      },
    },
  });

  return <ClassesPageClient classes={classes} />;
}
