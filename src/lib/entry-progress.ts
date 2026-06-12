/**
 * Calculate entry progress for assessments
 * Provides subject-level and overall completion metrics
 */

export interface SubjectProgress {
  name: string;
  completed: number;
  total: number;
  percentage: number;
  isAtRisk: boolean;
}

export interface EntryProgress {
  overallPercentage: number;
  entriesComplete: number;
  totalEntries: number;
  missingCount: number;
  subjects: SubjectProgress[];
  atRiskSubjects: SubjectProgress[];
}

export function calculateEntryProgress(
  results: Array<{
    pupilId: string;
    pupilName: string;
    subject?: string;
    caScore?: number | null;
    testScore?: number | null;
    examScore?: number | null;
    totalScore?: number | null;
  }>,
  subjects: Array<{ name: string }> = [],
  totalStudents: number = 0
): EntryProgress {
  if (!results || results.length === 0) {
    return {
      overallPercentage: 0,
      entriesComplete: 0,
      totalEntries: totalStudents,
      missingCount: totalStudents,
      subjects: subjects.map((s) => ({
        name: s.name,
        completed: 0,
        total: totalStudents,
        percentage: 0,
        isAtRisk: true,
      })),
      atRiskSubjects: subjects.map((s) => ({
        name: s.name,
        completed: 0,
        total: totalStudents,
        percentage: 0,
        isAtRisk: true,
      })),
    };
  }

  // Group results by subject and student
  const resultsBySubject = new Map<string, Set<string>>();
  const allStudents = new Set<string>();

  results.forEach((result) => {
    const hasScore =
      result.caScore !== null ||
      result.testScore !== null ||
      result.examScore !== null ||
      result.totalScore !== null;

    if (hasScore) {
      allStudents.add(result.pupilId);

      const subject = result.subject || "All";
      if (!resultsBySubject.has(subject)) {
        resultsBySubject.set(subject, new Set<string>());
      }
      resultsBySubject.get(subject)!.add(result.pupilId);
    }
  });

  // Calculate per-subject progress
  const subjectProgress: SubjectProgress[] = subjects.map((subject) => {
    const completed = resultsBySubject.get(subject.name)?.size || 0;
    const total = totalStudents || allStudents.size;
    const percentage = Math.round((completed / total) * 100);

    return {
      name: subject.name,
      completed,
      total,
      percentage,
      isAtRisk: percentage < 60,
    };
  });

  const totalEntries = totalStudents || allStudents.size;
  const entriesComplete = allStudents.size;
  const overallPercentage = Math.round((entriesComplete / totalEntries) * 100);

  return {
    overallPercentage,
    entriesComplete,
    totalEntries,
    missingCount: totalEntries - entriesComplete,
    subjects: subjectProgress,
    atRiskSubjects: subjectProgress.filter((s) => s.isAtRisk),
  };
}

/**
 * Format completion percentage with status label
 */
export function getCompletionStatus(percentage: number): string {
  if (percentage === 100) return "Complete";
  if (percentage >= 80) return "Almost Done";
  if (percentage >= 60) return "Good Progress";
  if (percentage >= 40) return "In Progress";
  if (percentage > 0) return "Just Started";
  return "Not Started";
}

/**
 * Get visual color for completion percentage
 */
export function getCompletionColor(
  percentage: number
): "success" | "brand" | "warning" | "muted" {
  if (percentage === 100) return "success";
  if (percentage >= 60) return "brand";
  if (percentage >= 30) return "warning";
  return "muted";
}
