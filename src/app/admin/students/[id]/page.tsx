import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { pupilName } from "@/lib/format";
import { getCurrentSchoolId } from "@/lib/school";
import { EditStudentForm } from "@/components/admin/edit-student-form";

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

  const guardianLink = pupil.guardians[0];
  const guardian = guardianLink?.guardian;

  const classes = await prisma.class.findMany({
    where: { schoolId },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/admin/students" className="text-sm text-brand hover:underline">
        ← Students
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Edit student</h1>
      <p className="mt-1 text-muted">Update pupil details and upload a new photo.</p>

      <EditStudentForm pupil={pupil} classes={classes} />
    </div>
  );
}
