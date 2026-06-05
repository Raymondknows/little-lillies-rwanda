import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentSchoolId } from "@/lib/school";
import { pupilName } from "@/lib/format";
import { PrintButton } from "@/components/admin/print-button";

export default async function SubjectReportPage({
  params,
}: {
  params: Promise<{ id: string; subjectId: string }>;
}) {
  const { id, subjectId } = await params;
  const schoolId = await getCurrentSchoolId();

  const assessment = await prisma.assessment.findFirst({
    where: { id, schoolId },
    include: { term: true },
  });
  if (!assessment) notFound();

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, schoolId },
  });
  if (!subject) notFound();

  // Get all results for this assessment and subject
  const results = await prisma.result.findMany({
    where: { assessmentId: id, subjectId },
    include: {
      pupil: { include: { class: true } },
    },
    orderBy: [{ totalScore: "desc" }, { pupil: { lastName: "asc" } }],
  });

  if (results.length === 0) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <Link href={`/admin/results/${id}/report`} className="text-sm text-brand hover:underline">
            ← Back to Full Report
          </Link>
          <div className="mt-6 rounded-lg border border-border bg-surface p-6 text-center">
            <p className="text-muted">No results found for this subject.</p>
          </div>
        </div>
      </div>
    );
  }

  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: { name: true, logoUrl: true },
  });
  
  // Calculate stats
  const scores = results.filter(r => r.totalScore !== null).map(r => r.totalScore as number);
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);

  return (
    <div className="min-h-screen bg-white p-4 sm:p-8 print:p-0">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <div className="mb-6 print:hidden">
          <Link
            href={`/admin/results/${id}/report`}
            className="text-sm text-brand hover:underline"
          >
            ← Back to Full Report
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
            {subject.name} Results
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

        {/* Subject Stats */}
        <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 print:bg-white print:border-gray-300">
            <p className="text-xs text-gray-600 print:text-gray-700">Students</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600 print:text-gray-900">
              {results.length}
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg border border-green-200 print:bg-white print:border-gray-300">
            <p className="text-xs text-gray-600 print:text-gray-700">Average</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600 print:text-gray-900">
              {avgScore.toFixed(1)}
            </p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 print:bg-white print:border-gray-300">
            <p className="text-xs text-gray-600 print:text-gray-700">Highest</p>
            <p className="text-xl sm:text-2xl font-bold text-purple-600 print:text-gray-900">
              {maxScore.toFixed(0)}
            </p>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 print:bg-white print:border-gray-300">
            <p className="text-xs text-gray-600 print:text-gray-700">Lowest</p>
            <p className="text-xl sm:text-2xl font-bold text-orange-600 print:text-gray-900">
              {minScore.toFixed(0)}
            </p>
          </div>
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 print:bg-gray-200">
                <th className="border border-gray-300 px-2 py-2 sm:px-3 text-left font-semibold text-gray-900 print:border-gray-400">
                  Rank
                </th>
                <th className="border border-gray-300 px-2 py-2 sm:px-3 text-left font-semibold text-gray-900 print:border-gray-400">
                  Student
                </th>
                <th className="border border-gray-300 px-2 py-2 sm:px-3 text-left font-semibold text-gray-900 print:border-gray-400">
                  Class
                </th>
                <th className="border border-gray-300 px-2 py-2 sm:px-3 text-center font-semibold text-gray-900 print:border-gray-400">
                  CA
                </th>
                <th className="border border-gray-300 px-2 py-2 sm:px-3 text-center font-semibold text-gray-900 print:border-gray-400">
                  Test
                </th>
                <th className="border border-gray-300 px-2 py-2 sm:px-3 text-center font-semibold text-gray-900 print:border-gray-400">
                  Exam
                </th>
                <th className="border border-gray-300 px-2 py-2 sm:px-3 text-center font-semibold text-gray-900 print:border-gray-400">
                  Total
                </th>
                <th className="border border-gray-300 px-2 py-2 sm:px-3 text-center font-semibold text-gray-900 print:border-gray-400">
                  Grade
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, idx) => (
                <tr
                  key={result.id}
                  className={
                    idx % 2 === 0
                      ? "bg-white print:bg-white"
                      : "bg-gray-50 print:bg-gray-50"
                  }
                >
                  <td className="border border-gray-300 px-2 py-2 sm:px-3 font-bold text-gray-900 print:border-gray-400 text-xs sm:text-sm">
                    {idx + 1}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 sm:px-3 font-medium text-gray-900 print:border-gray-400 text-xs sm:text-sm">
                    {pupilName(result.pupil.firstName, result.pupil.lastName)}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 sm:px-3 text-gray-600 print:border-gray-400 text-xs sm:text-sm">
                    {result.pupil.class?.name}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 sm:px-3 text-center text-gray-600 print:border-gray-400 text-xs sm:text-sm">
                    {result.caScore !== null ? result.caScore.toFixed(1) : "—"}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 sm:px-3 text-center text-gray-600 print:border-gray-400 text-xs sm:text-sm">
                    {result.testScore !== null ? result.testScore.toFixed(1) : "—"}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 sm:px-3 text-center text-gray-600 print:border-gray-400 text-xs sm:text-sm">
                    {result.examScore !== null ? result.examScore.toFixed(1) : "—"}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 sm:px-3 text-center font-bold text-gray-900 print:border-gray-400 text-xs sm:text-sm">
                    {result.totalScore !== null ? Math.round(result.totalScore) : "—"}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 sm:px-3 text-center text-gray-900 print:border-gray-400 text-xs sm:text-sm">
                    {result.grade || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t-2 border-gray-300 text-center text-xs text-gray-500 print:border-gray-400 print:text-gray-600">
          <p>
            {subject.name} — {results.length} student{results.length !== 1 ? "s" : ""}
          </p>
          <p className="mt-2">Page {1} of 1</p>
        </div>
      </div>
    </div>
  );
}
