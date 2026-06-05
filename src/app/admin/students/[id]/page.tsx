import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentSchoolId } from "@/lib/school";
import StudentProfileView from "@/components/admin/student-profile-view";

export default async function StudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const schoolId = await getCurrentSchoolId();

  const pupil = await prisma.pupil.findFirst({
    where: { id, schoolId },
    include: { class: true, guardians: { include: { guardian: true } } },
  });

  if (!pupil) notFound();

  const classes = await prisma.class.findMany({
    where: { schoolId },
    orderBy: { name: "asc" },
  });

  return <StudentProfileView pupil={pupil} classes={classes} />;
}
