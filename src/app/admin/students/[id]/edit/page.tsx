import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentSchoolId } from "@/lib/school";
import EditStudentClientForm from "@/components/admin/edit-student-client-form";

// Disable dynamic routes for static export
export async function generateStaticParams() {
  return [];
}
export default async function EditStudentPage({
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

  return <EditStudentClientForm pupil={pupil} classes={classes} />;
}
