import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentSchoolId } from "@/lib/school";
import EditStudentClientForm from "@/components/admin/edit-student-client-form";

// Disable static generation for dynamic route
export const dynamic = "force-dynamic";

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;

    // 🔥 SAFE SCHOOL RESOLUTION (FIX LIVE ISSUE)
    const schoolId = await getCurrentSchoolId();

    if (!schoolId) {
      console.error("❌ Missing schoolId (cookie/session issue on live server)");
      notFound();
    }

    // 🔥 FETCH STUDENT SAFELY
    const pupil = await prisma.pupil.findFirst({
      where: {
        id,
        schoolId,
      },
      include: {
        class: true,
        guardians: {
          include: { guardian: true },
        },
      },
    });

    if (!pupil) {
      console.error("❌ Student not found:", { id, schoolId });
      notFound();
    }

    const classes = await prisma.class.findMany({
      where: { schoolId },
      orderBy: { name: "asc" },
    });

    return <EditStudentClientForm pupil={pupil} classes={classes} />;
  } catch (error) {
    console.error("🔥 Edit student page error:", error);
    throw error;
  }
}