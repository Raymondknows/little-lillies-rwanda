import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { pupilName } from "@/lib/format";
import { AppLogo } from "@/components/app-logo";
import { PrintButton } from "@/components/admin/print-button";
import { getParentSession } from "@/lib/auth";

export default async function ParentStudentReportPage({
  params,
}: {
  params: Promise<{ assessmentId: string; studentId: string }>;
}) {
  const session = await getParentSession();
  if (!session) return notFound();

  const { assessmentId, studentId } = await params;

  const guardian = await prisma.guardian.findUnique({
    where: { id: session.guardianId },
    include: {
      pupils: {
        include: {
          pupil: true,
        },
      },
    },
  });

  if (!guardian) return notFound();

  const hasAccess = guardian.pupils.some((gp) => gp.pupil.id === studentId);
  if (!hasAccess) return notFound();

  const assessment = await prisma.assessment.findFirst({
    where: { id: assessmentId },
    include: { term: true },
  });
  if (!assessment) return notFound();

  const pupil = await prisma.pupil.findFirst({
    where: { id: studentId },
    include: { class: true },
  });
  if (!pupil) return notFound();

  const results = await prisma.result.findMany({
    where: { assessmentId, pupilId: studentId, publishedAt: { not: null } },
    include: { subjectRef: true },
    orderBy: { subjectRef: { name: "asc" } },
  });

  if (results.length === 0) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <Link href={`/parent/results`} className="text-sm text-brand hover:underline">
            ← Back to Results
          </Link>
          <div className="mt-6 rounded-lg border border-border bg-surface p-6 text-center">
            <p className="text-muted">No published results found for this student.</p>
          </div>
        </div>
      </div>
    );
  }

  const school = await prisma.school.findUnique({
    where: { id: pupil.schoolId },
    select: {
      name: true,
      logoUrl: true,
      principalComment: true,
      principalName: true,
      principalSignatureUrl: true,
      stampUrl: true,
    },
  });
  const scores = results.filter((r) => r.totalScore !== null).map((r) => r.totalScore as number);
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  return (
    <div className="min-h-screen bg-white p-6 sm:p-12 print:p-4">
      <div className="mx-auto w-full max-w-4xl print:w-full print:max-w-[190mm] print:mx-auto print:min-h-[297mm] bg-white print:shadow-none print:border-none">
        <div className="flex items-start justify-between gap-6 mb-6 print:hidden">
          <div>
            <Link href={`/parent/results`} className="text-sm text-muted hover:underline">
              ← Back to Results
            </Link>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <PrintButton label="Print" />
            <PrintButton label="Download PDF" />
          </div>
        </div>

        <div className="mb-4 text-center" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
          <div className="flex justify-center">
            {school?.logoUrl ? (
              <img
                src={school.logoUrl}
                alt={`${school.name} logo`}
                className="h-24 object-contain"
              />
            ) : (
              <AppLogo href="" size="lg" showText={false} />
            )}
          </div>
          <h1 className="text-3xl font-bold text-foreground mt-4">{school?.name}</h1>
          <p className="text-sm text-muted mt-2">{assessment.name} — {assessment.term.name}</p>
          <p className="text-xs text-muted mt-1">Generated {new Date().toLocaleDateString()}</p>
        </div>

        <div className="mb-8 border-t border-border pt-6" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
          <div className="mb-6 text-center">
            <p className="text-sm uppercase tracking-[0.24em] text-muted">Student Transcript</p>
          </div>

          <div className="text-sm text-foreground">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-[240px_minmax(200px,1fr)] items-start">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="h-20 w-20 sm:h-28 sm:w-28 rounded-md overflow-hidden border border-border bg-background flex-shrink-0">
                    {pupil.photoUrl ? (
                      <img src={pupil.photoUrl} alt={pupilName(pupil.firstName, pupil.lastName)} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted">No photo</div>
                    )}
                  </div>
                  <div className="grid gap-3 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-xs uppercase tracking-[0.24em] text-muted">Student</span>
                      <span className="text-2xl font-semibold text-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                        {pupilName(pupil.firstName, pupil.lastName)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-xs uppercase tracking-[0.24em] text-muted">Class</span>
                      <span className="font-semibold text-foreground whitespace-nowrap">{pupil.class?.name}</span>
                    </div>
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-xs uppercase tracking-[0.24em] text-muted">Admission No</span>
                      <span className="font-semibold text-foreground whitespace-nowrap">{pupil.admissionNo}</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 justify-end text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-muted">Subjects:</span>
                    <span className="font-semibold">{results.length}</span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-muted">Average:</span>
                    <span className="font-semibold">{avgScore.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-muted">Completed:</span>
                    <span className="font-semibold">{scores.length}/{results.length}</span>
                  </div>
                </div>
              </div>
          </div>
        </div>

        <div className="rounded-lg border border-border overflow-hidden" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
          <div className="hidden sm:block">
            <table className="w-full text-sm">
              <thead className="bg-surface text-muted">
                <tr>
                  <th className="px-4 py-3 text-left">Subject</th>
                  <th className="px-4 py-3 text-center">CA</th>
                  <th className="px-4 py-3 text-center">Test</th>
                  <th className="px-4 py-3 text-center">Exam</th>
                  <th className="px-4 py-3 text-center">Total</th>
                  <th className="px-4 py-3 text-center">Grade</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, idx) => (
                  <tr key={result.id} className={idx % 2 === 0 ? "bg-white" : "bg-background"}>
                    <td className="px-4 py-3 font-medium text-foreground">{result.subjectRef?.name || result.subject}</td>
                    <td className="px-4 py-3 text-center text-muted">{result.caScore !== null ? result.caScore.toFixed(1) : "—"}</td>
                    <td className="px-4 py-3 text-center text-muted">{result.testScore !== null ? result.testScore.toFixed(1) : "—"}</td>
                    <td className="px-4 py-3 text-center text-muted">{result.examScore !== null ? result.examScore.toFixed(1) : "—"}</td>
                    <td className="px-4 py-3 text-center font-bold text-brand">{result.totalScore !== null ? Math.round(result.totalScore) : "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block bg-brand/10 text-brand px-3 py-1 rounded font-semibold">{result.grade || '—'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sm:hidden space-y-3 p-4">
            {results.map((result) => (
              <div key={result.id} className="rounded-lg border border-border bg-background p-3">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{result.subjectRef?.name || result.subject}</p>
                    <p className="text-xs text-muted mt-1">{result.comment ? result.comment : ''}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-foreground">{result.totalScore !== null ? Math.round(result.totalScore) : '—'}</div>
                    <div className="text-xs inline-flex rounded-full bg-brand/10 px-2 py-0.5 mt-1 text-brand">{result.grade || '—'}</div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted">
                  <div className="text-center">
                    <div className="font-semibold text-foreground">{result.caScore !== null ? result.caScore.toFixed(1) : '—'}</div>
                    <div>CA</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-foreground">{result.testScore !== null ? result.testScore.toFixed(1) : '—'}</div>
                    <div>Test</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-foreground">{result.examScore !== null ? result.examScore.toFixed(1) : '—'}</div>
                    <div>Exam</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {results.some((r) => r.comment) && (
          <div className="mt-6" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
            <h3 className="text-lg font-semibold text-foreground mb-3">Comments</h3>
            <div className="flex flex-wrap gap-4 text-sm text-muted">
              {results.filter((r) => r.comment).map((r) => (
                <div key={r.id} className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{r.subjectRef?.name || r.subject}</span>
                  <span>=</span>
                  <span>{r.comment}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {school?.principalComment && (
          <div className="mt-8 pt-6 border-t" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
            <h3 className="text-lg font-semibold text-foreground mb-3">Principal&apos;s Comment</h3>
            <p className="text-sm text-foreground whitespace-pre-wrap">{school.principalComment}</p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t" style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
          <div className="grid grid-cols-[1fr_1fr] gap-8">
            <div className="text-center">
              {school?.principalSignatureUrl ? (
                <div className="mb-3">
                  <img src={school.principalSignatureUrl} alt="Principal Signature" className="h-16 mx-auto" />
                </div>
              ) : (
                <div className="mb-3 h-16 border-t border-foreground mt-4"></div>
              )}
              <p className="text-xs font-semibold text-foreground">
                {school?.principalName || "Principal/Head of School"}
              </p>
              <p className="text-xs text-muted mt-1">Signature</p>
            </div>

            <div className="text-center">
              {school?.stampUrl ? (
                <div className="flex justify-center mb-3">
                  <img src={school.stampUrl} alt="School Stamp" className="h-20 w-20" />
                </div>
              ) : (
                <div className="flex justify-center mb-3">
                  <div className="h-20 w-20 border-2 border-dashed border-foreground rounded-full flex items-center justify-center text-xs text-muted">
                    School Stamp
                  </div>
                </div>
              )}
              <p className="text-xs text-muted">School Seal</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t text-center text-xs text-muted">
          <p>Official Academic Transcript</p>
          <p className="mt-2">Page 1 of 1</p>
        </div>
      </div>
    </div>
  );
}
