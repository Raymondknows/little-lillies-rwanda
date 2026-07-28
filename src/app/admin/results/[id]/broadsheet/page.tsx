import Link from "next/link";
import { cookies } from "next/headers";
import { getBackendUrl } from "@/lib/backend-url";
import BroadsheetClient from "./broadsheet-client";

interface AssessmentResult {
  id: string;
  assessmentId: string;
  pupilId: string;
  classId: string | null;
  subjectId: string | null;
  subject?: string | null;
  caScore: number | null;
  testScore: number | null;
  examScore: number | null;
  totalScore: number | null;
  grade?: string | null;
  pupil: {
    id: string;
    name: string;
    firstName?: string;
    lastName?: string;
    admissionNo?: string | null;
  };
  subjectRef?: {
    id: string;
    name: string;
  } | null;
}

interface AssessmentResponse {
  id: string;
  name: string;
  phase: string;
  status: string;
  term: { name: string };
  results: AssessmentResult[];
}

interface SchoolClass {
  id: string;
  name: string;
  arm?: string | null;
  phase: string;
}

interface PupilRecord {
  id: string;
  firstName: string;
  lastName: string;
  admissionNo?: string | null;
  class?: {
    id: string;
    name: string;
    arm?: string | null;
    phase: string;
  } | null;
}

interface SubjectRecord {
  id: string;
  name: string;
}

interface SubjectClassRecord {
  classId: string;
  subjectId: string;
}

function getDisplayClassName(classItem: SchoolClass) {
  return classItem.arm ? `${classItem.name} ${classItem.arm}` : classItem.name;
}

function resolveTotalScore(result: AssessmentResult): number | null {
  if (result.totalScore !== null && result.totalScore !== undefined) {
    return result.totalScore;
  }

  if (
    result.caScore === null ||
    result.testScore === null ||
    result.examScore === null
  ) {
    return null;
  }

  return result.caScore + result.testScore + result.examScore;
}

function resolveGrade(average: number | null): string | null {
  if (average === null) return null;
  if (average >= 70) return "A";
  if (average >= 60) return "B";
  if (average >= 50) return "C";
  if (average >= 45) return "D";
  if (average >= 40) return "E";
  return "F";
}

async function fetchBackendJson<T>(path: string): Promise<T> {
  const backendUrl = getBackendUrl().replace(/\/$/, "");
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${encodeURIComponent(cookie.value)}`)
    .join("; ");

  const response = await fetch(`${backendUrl}${path}`, {
    method: "GET",
    cache: "no-store",
    headers: {
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || `Backend returned ${response.status} for ${path}`);
  }

  return response.json();
}

export default async function BroadsheetPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ classId?: string }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  try {
    const [assessmentResponse, studentsResponse, subjectsResponse] = await Promise.all([
      fetchBackendJson<AssessmentResponse>(`/api/admin/results/${id}`),
      fetchBackendJson<{ pupils: PupilRecord[]; classes: SchoolClass[]; nextAdmissionNo?: string }>(
        `/api/admin/students/data`
      ),
      fetchBackendJson<{ subjects: SubjectRecord[]; classes: SchoolClass[]; subjectClasses: SubjectClassRecord[] }>(
        `/api/admin/subjects/data`
      ),
    ]);

    const assessment = assessmentResponse;
    const schoolClasses = studentsResponse.classes || [];
    const pupils = studentsResponse.pupils || [];
    const subjects = subjectsResponse.subjects || [];
    const subjectClasses = subjectsResponse.subjectClasses || [];

    const phaseClasses = schoolClasses.filter((classItem) => classItem.phase === assessment.phase);
    const requestedClassId = typeof resolvedSearchParams.classId === "string" ? resolvedSearchParams.classId : null;
    const selectedClassId =
      requestedClassId === "all" ||
      (requestedClassId && phaseClasses.some((classItem) => classItem.id === requestedClassId))
        ? requestedClassId
        : "all";

    const classLookup = new Map(pupils.map((pupil) => [pupil.id, pupil.class?.id || null]));
    const selectedClass = selectedClassId === "all"
      ? null
      : phaseClasses.find((classItem) => classItem.id === selectedClassId) || null;

    const selectedClassPupils = pupils
      .filter((pupil) => {
        const pupilClassId = pupil.class?.id || null;

        if (selectedClassId === "all") {
          return pupilClassId ? phaseClasses.some((classItem) => classItem.id === pupilClassId) : false;
        }

        return pupilClassId === selectedClassId;
      })
      .sort((a, b) => {
        if (selectedClassId === "all") {
          const classCompare = (a.class?.name || "").localeCompare(b.class?.name || "");
          if (classCompare !== 0) return classCompare;
        }

        return `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`);
      });

    const selectedClassResults = assessment.results.filter((result) => {
      const pupilClassId = result.classId || classLookup.get(result.pupilId) || null;
      if (selectedClassId === "all") {
        return pupilClassId ? phaseClasses.some((classItem) => classItem.id === pupilClassId) : false;
      }

      return pupilClassId === selectedClassId;
    });

    const subjectsForClass = new Map<string, SubjectRecord>();
    subjectClasses
      .filter((subjectClass) =>
        selectedClassId === "all"
          ? phaseClasses.some((classItem) => classItem.id === subjectClass.classId)
          : subjectClass.classId === selectedClassId
      )
      .forEach((subjectClass) => {
        const subject = subjects.find((item) => item.id === subjectClass.subjectId);
        if (subject) {
          subjectsForClass.set(subject.id, subject);
        }
      });

    selectedClassResults.forEach((result) => {
      const subjectId = result.subjectId || result.subjectRef?.id || null;
      if (!subjectId || subjectsForClass.has(subjectId)) {
        return;
      }

      const subject = subjects.find((item) => item.id === subjectId || item.name === result.subjectRef?.name || item.name === result.subject);
      if (subject) {
        subjectsForClass.set(subject.id, subject);
      }
    });

    const orderedSubjects = Array.from(subjectsForClass.values()).sort((a, b) => a.name.localeCompare(b.name));

    const resultByPupil = new Map<string, AssessmentResult[]>();
    selectedClassResults.forEach((result) => {
      const entries = resultByPupil.get(result.pupilId) ?? [];
      entries.push(result);
      resultByPupil.set(result.pupilId, entries);
    });

    const broadsheetData = selectedClassPupils.map((pupil) => {
      const pupilResults = resultByPupil.get(pupil.id) ?? [];

      const subjectScores = orderedSubjects.map((subject) => {
        const score = pupilResults.find((result) => {
          const resolvedSubjectId = result.subjectId || result.subjectRef?.id || null;
          return resolvedSubjectId === subject.id || result.subjectRef?.name === subject.name || result.subject === subject.name;
        });

        return {
          subjectId: subject.id,
          totalScore: score ? resolveTotalScore(score) : null,
        };
      });

      const totals = subjectScores.map((subjectScore) => subjectScore.totalScore).filter((value): value is number => value !== null);
      const total = totals.length > 0 ? totals.reduce((sum, value) => sum + value, 0) : null;
      const average = totals.length > 0 ? total! / totals.length : null;

      return {
        pupilId: pupil.id,
        name: `${pupil.lastName} ${pupil.firstName}`.trim(),
        admissionNo: pupil.admissionNo ?? null,
        className: pupil.class ? getDisplayClassName(pupil.class) : null,
        subjectScores,
        total,
        average,
        grade: resolveGrade(average),
      };
    });

    const sortedByAverage = [...broadsheetData]
      .filter((row) => row.average !== null)
      .sort((a, b) => (b.average ?? 0) - (a.average ?? 0));

    const positionMap: Record<string, number> = {};
    let currentPosition = 1;
    let lastAverage: number | null = null;

    sortedByAverage.forEach((row, index) => {
      if (lastAverage === null || row.average !== lastAverage) {
        currentPosition = index + 1;
        lastAverage = row.average;
      }
      positionMap[row.pupilId] = currentPosition;
    });

    const subjectStats = orderedSubjects.map((subject) => {
      const subjectTotals = broadsheetData
        .map((row) => row.subjectScores.find((score) => score.subjectId === subject.id)?.totalScore ?? null)
        .filter((value): value is number => value !== null);

      return {
        subjectId: subject.id,
        avg: subjectTotals.length > 0 ? subjectTotals.reduce((sum, value) => sum + value, 0) / subjectTotals.length : null,
        highest: subjectTotals.length > 0 ? Math.max(...subjectTotals) : null,
        lowest: subjectTotals.length > 0 ? Math.min(...subjectTotals) : null,
      };
    });

    const classAverageValues = broadsheetData.map((row) => row.average).filter((value): value is number => value !== null);
    const classAverage =
      classAverageValues.length > 0
        ? classAverageValues.reduce((sum, value) => sum + value, 0) / classAverageValues.length
        : null;

    const classes = phaseClasses.map((classItem) => ({
      id: classItem.id,
      name: getDisplayClassName(classItem),
    }));

    const broadsheetClassName =
      selectedClassId === "all"
        ? "All Classes"
        : selectedClass
          ? getDisplayClassName(selectedClass)
          : "Selected Class";

    return (
      <BroadsheetClient
        assessmentId={assessment.id}
        assessmentName={assessment.name}
        className={broadsheetClassName}
        classes={[{ id: "all", name: "All Classes" }, ...classes]}
        selectedClassId={selectedClassId}
        broadsheetData={broadsheetData}
        subjects={orderedSubjects}
        subjectStats={subjectStats}
        classAverage={classAverage}
        positionMap={positionMap}
      />
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load broadsheet";

    return (
      <div className="mx-auto max-w-6xl px-3 py-4">
        <Link href={`/admin/results/${id}`} className="text-sm font-medium text-brand hover:underline">
          ← Results
        </Link>
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{message}</p>
        </div>
      </div>
    );
  }
}