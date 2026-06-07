import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentSchoolId } from "@/lib/school";
import { pupilName } from "@/lib/format";
import { PrintButton } from "@/components/admin/print-button";

export default async function AssessmentReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const schoolId = await getCurrentSchoolId();

  const assessment = await prisma.assessment.findFirst({
    where: { id, schoolId },
    include: { term: true },
  });
  if (!assessment) notFound();

  // Get all results for this assessment with pupil and subject info
  const results = await prisma.result.findMany({
    where: { assessmentId: id },
    include: {
      pupil: { include: { class: true } },
      subjectRef: true,
    },
    orderBy: [{ pupil: { lastName: "asc" } }, { subjectRef: { name: "asc" } }],
  });

  // Get all unique subjects in this assessment
  const uniqueSubjects = Array.from(
    new Map(results.map((r: typeof results[number]) => [r.subjectId, r.subjectRef])).values()
  ).filter(
    (subject): subject is NonNullable<typeof results[number]["subjectRef"]> =>
      Boolean(subject),
  );

  // Group results by pupil
  const resultsByPupil = new Map<
    string,
    {
      pupil: any;
      results: typeof results;
      totalSubjects: number;
      avgScore: number;
      totalEntries: number;
    }
  >();

  for (const result of results) {
    const key = result.pupilId;
    if (!resultsByPupil.has(key)) {
      resultsByPupil.set(key, {
        pupil: result.pupil,
        results: [],
        totalSubjects: 0,
        avgScore: 0,
        totalEntries: 0,
      });
    }
    resultsByPupil.get(key)!.results.push(result);
  }

  // Calculate stats for each pupil
  const pupilReports = Array.from(resultsByPupil.values()).map((entry) => {
    const totalScores = entry.results
      .filter((r: typeof entry.results[number]) => r.totalScore !== null)
      .map((r: typeof entry.results[number]) => r.totalScore as number);
    const avgScore =
      totalScores.length > 0
        ? totalScores.reduce((a: number, b: number) => a + b, 0) / totalScores.length
        : 0;

    return {
      ...entry,
      totalSubjects: entry.results.length,
      avgScore: Math.round(avgScore * 100) / 100,
      totalEntries: totalScores.length,
    };
  });

  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: { name: true, logoUrl: true },
  });

  return (
    <div className="min-h-screen bg-white p-4 sm:p-8 print:p-0">
      <div className="max-w-6xl mx-auto">
        {/* Back Link */}
        <div className="mb-6 print:hidden">
          <Link
            href={`/admin/results/${id}`}
            className="text-sm text-brand hover:underline"
          >
            ← Back to Assessment
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8 text-center pb-6 border-b-2 border-gray-300 print:border-gray-400">
          <div className="flex justify-center mb-4">
            {school?.logoUrl ? (
              <img
                src={school.logoUrl}
                alt={`${school.name} logo`}
                className="h-24 object-contain"
              />
            ) : null}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {school?.name}
          </h1>
          <h2 className="mt-2 text-lg sm:text-xl font-semibold text-gray-800">
            Results Report
          </h2>
          <p className="mt-1 text-sm sm:text-base text-gray-600">
            {assessment.name} — {assessment.term.name}
          </p>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Generated {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Print Button */}
        <div className="mb-6 print:hidden">
          <PrintButton label="🖨️ Print Report" />
        </div>

        {/* Summary Stats */}
        <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3 print:gap-2">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 print:bg-white print:border-gray-300">
            <p className="text-xs text-gray-600 print:text-gray-700">
              Total Students
            </p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600 print:text-gray-900">
              {pupilReports.length}
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg border border-green-200 print:bg-white print:border-gray-300">
            <p className="text-xs text-gray-600 print:text-gray-700">Subjects</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600 print:text-gray-900">
              {uniqueSubjects.length}
            </p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 print:bg-white print:border-gray-300">
            <p className="text-xs text-gray-600 print:text-gray-700">
              Total Entries
            </p>
            <p className="text-xl sm:text-2xl font-bold text-purple-600 print:text-gray-900">
              {results.length}
            </p>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 print:bg-white print:border-gray-300">
            <p className="text-xs text-gray-600 print:text-gray-700">
              Class Avg
            </p>
            <p className="text-xl sm:text-2xl font-bold text-orange-600 print:text-gray-900">
              {(
                pupilReports.reduce((sum: number, p: typeof pupilReports[number]) => sum + p.avgScore, 0) /
                  pupilReports.length || 0
              ).toFixed(1)}
            </p>
          </div>
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 print:bg-gray-200">
                <th className="border border-gray-300 px-2 py-2 sm:px-3 text-left font-semibold text-gray-900 print:border-gray-400">
                  Student
                </th>
                <th className="border border-gray-300 px-2 py-2 sm:px-3 text-left font-semibold text-gray-900 print:border-gray-400">
                  Class
                </th>
                {uniqueSubjects.map((subject) => (
                  <th
                    key={subject?.id}
                    className="border border-gray-300 px-1 py-2 sm:px-2 text-center font-semibold text-gray-900 print:border-gray-400 whitespace-nowrap"
                  >
                    <Link
                      href={`/admin/results/${id}/subject/${subject?.id}/report`}
                      target="_blank"
                      className="text-xs sm:text-sm text-brand hover:underline print:no-underline print:text-gray-900"
                    >
                      {subject?.name}
                    </Link>
                  </th>
                ))}
                <th className="border border-gray-300 px-2 py-2 sm:px-3 text-center font-semibold text-gray-900 print:border-gray-400">
                  Average
                </th>
              </tr>
            </thead>
            <tbody>
              {pupilReports.map((report, idx) => (
                <tr
                  key={report.pupil.id}
                  className={
                    idx % 2 === 0
                      ? "bg-white print:bg-white"
                      : "bg-gray-50 print:bg-gray-50"
                  }
                >
                  <td className="border border-gray-300 px-2 py-2 sm:px-3 font-medium text-gray-900 print:border-gray-400 text-xs sm:text-sm">
                    <Link
                      href={`/admin/results/${id}/student/${report.pupil.id}/report`}
                      target="_blank"
                      className="text-brand hover:underline print:no-underline print:text-gray-900"
                    >
                      {pupilName(report.pupil.firstName, report.pupil.lastName)}
                    </Link>
                  </td>
                  <td className="border border-gray-300 px-2 py-2 sm:px-3 text-gray-600 print:border-gray-400 text-xs sm:text-sm">
                    {report.pupil.class?.name}
                  </td>
                  {uniqueSubjects.map((subject) => {
                    const result = report.results.find(
                      (r: typeof report.results[number]) => r.subjectId === subject?.id
                    );
                    return (
                      <td
                        key={subject?.id}
                        className="border border-gray-300 px-1 py-2 sm:px-2 text-center print:border-gray-400"
                      >
                        {result ? (
                          <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                            <span className="font-semibold text-gray-900 text-xs sm:text-sm">
                              {result.totalScore !== null
                                ? Math.round(result.totalScore)
                                : "—"}
                            </span>
                            <span className="text-xs text-gray-500 print:text-gray-600">
                              {result.grade || "—"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 print:text-gray-500 text-xs">
                            —
                          </span>
                        )}
                      </td>
                    );
                  })}
                  <td className="border border-gray-300 px-2 py-2 sm:px-3 text-center font-bold text-blue-600 print:text-gray-900 print:border-gray-400 text-xs sm:text-sm">
                    {report.avgScore.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t-2 border-gray-300 text-center text-xs text-gray-500 print:border-gray-400 print:text-gray-600">
          <p>
            This is an official record. Please verify accuracy before
            publication.
          </p>
          <p className="mt-2">Page {1} of 1</p>
        </div>
      </div>
    </div>
  );
}
