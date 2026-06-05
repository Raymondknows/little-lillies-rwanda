import { prisma } from "@/lib/db";
import { getCurrentSchool } from "@/lib/school";
import ResultsPageClient from "./results-client";
import type { SchoolPhase } from "@prisma/client";

export default async function ResultsPage() {
  const school = await getCurrentSchool();

  const assessments = await prisma.assessment.findMany({
    where: { schoolId: school.id },
    include: { _count: { select: { results: true } }, term: true },
    orderBy: [{ phase: "asc" }, { createdAt: "desc" }],
  });

  return <ResultsPageClient assessments={assessments} />;
}
