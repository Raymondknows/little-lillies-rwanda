import { prisma } from "@/lib/db";
import { getCurrentSchool } from "@/lib/school";
import StudentsPageClient from "./students-client";

export default async function StudentsPage() {
  const school = await getCurrentSchool();

  const pupils = await prisma.pupil.findMany({
    where: { schoolId: school.id, isActive: true },
    include: {
      class: true,
      guardians: { include: { guardian: true } },
    },
    orderBy: { lastName: "asc" },
  });

  const classes = await prisma.class.findMany({
    where: { schoolId: school.id },
    orderBy: { name: "asc" },
  });

  return <StudentsPageClient pupils={pupils} classes={classes} />;
}
