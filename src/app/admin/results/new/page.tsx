import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { getCurrentSchool } from "@/lib/school";
import { createAssessment } from "@/app/admin/actions";
import type { SchoolPhase } from "@prisma/client";

const PHASE_OPTIONS: Array<{ value: SchoolPhase; label: string }> = [
  { value: "EARLY_YEARS", label: "Early Years" },
  { value: "PRIMARY", label: "Primary" },
  { value: "SECONDARY", label: "Secondary" },
];

export default async function NewAssessmentPage() {
  const school = await getCurrentSchool();

  const currentAcademicYear = await prisma.academicYear.findFirst({
    where: { schoolId: school.id, isCurrent: true },
    orderBy: { createdAt: "desc" },
  });

  const terms = currentAcademicYear
    ? await prisma.term.findMany({
        where: { academicYearId: currentAcademicYear.id },
        orderBy: { sortOrder: "asc" },
      })
    : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <Link href="/admin/results" className="text-sm text-brand hover:underline">
        ← Back to results
      </Link>

      <div className="mt-4 rounded-3xl border border-border bg-surface p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm text-muted">Create a new assessment for the current academic year.</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">Create assessment</h1>
        </div>

        {terms.length === 0 ? (
          <div className="rounded-2xl border border-warning bg-warning/10 p-5 text-sm text-warning">
            No terms found for the current academic year. Please set up an academic year and term before creating an assessment.
          </div>
        ) : (
          <form action={createAssessment} className="space-y-6">
            <div className="grid gap-6">
              <label className="text-sm font-medium">
                Assessment name
                <input
                  name="name"
                  required
                  placeholder="Term 1 Assessment"
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </label>

              <label className="text-sm font-medium">
                Term
                <select
                  name="termId"
                  required
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                >
                  {terms.map((term) => (
                    <option key={term.id} value={term.id}>
                      {term.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium">
                Phase
                <select
                  name="phase"
                  required
                  defaultValue="PRIMARY"
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                >
                  {PHASE_OPTIONS.map((phase) => (
                    <option key={phase.value} value={phase.value}>
                      {phase.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
              <div className="space-y-1 text-sm text-muted">
                <p className="font-medium text-foreground">Ready to start?</p>
                <p>Create the assessment first, then add pupils and scores.</p>
              </div>
              <Button type="submit">Create assessment</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
