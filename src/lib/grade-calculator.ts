// Prisma removed - use backend API instead

/**
 * In-memory cache for grading scales per school (schoolId -> scales[])
 * Cache is cleared when a result is recorded (via updateAssessmentPositions or other mutations)
 */
const gradingScaleCache = new Map<string, Array<{ grade: string; minScore: number; maxScore: number }>>();

/**
 * Calculate grade from total score using school's grading scale
 * Results are cached per school to avoid repeated database queries.
 */
export async function calculateGrade(
  schoolId: string,
  totalScore: number,
): Promise<string> {
  // Check cache first
  let scales = gradingScaleCache.get(schoolId);
  
  if (!scales) {
    // Load scales from database if not cached
    scales = await prisma.gradingScale.findMany({
      where: { schoolId },
      select: { grade: true, minScore: true, maxScore: true },
    });
    gradingScaleCache.set(schoolId, scales);
  }

  // Find matching scale
  const scale = scales.find(
    (s) => totalScore >= s.minScore && totalScore <= s.maxScore,
  );

  return scale?.grade ?? "F";
}

/**
 * Batch calculate grades for multiple scores (cached)
 */
export async function calculateGrades(
  schoolId: string,
  scores: number[],
): Promise<string[]> {
  // Use cached grades function
  let scales = gradingScaleCache.get(schoolId);
  
  if (!scales) {
    scales = await prisma.gradingScale.findMany({
      where: { schoolId },
      select: { grade: true, minScore: true, maxScore: true },
    });
    gradingScaleCache.set(schoolId, scales);
  }

  return scores.map((score) => {
    const scale = scales!.find(
      (s) => score >= s.minScore && score <= s.maxScore,
    );
    return scale?.grade ?? "F";
  });
}

/**
 * Clear grading scale cache (call after any updates to GradingScale)
 */
export function clearGradingScaleCache(schoolId?: string) {
  if (schoolId) {
    gradingScaleCache.delete(schoolId);
  } else {
    gradingScaleCache.clear();
  }
}

/**
 * Calculate class position (ranking) from assessment results
 * Returns mapping of pupilId -> position
 */
export async function calculateClassPositions(
  assessmentId: string,
): Promise<Map<string, number>> {
  const results = await prisma.result.findMany({
    where: { assessmentId },
    include: { pupil: { include: { class: true } } },
  });

  // Group by class
  const classPupils = new Map<string, typeof results>();
  for (const result of results) {
    const classId = result.pupil.classId ?? "unassigned";
    if (!classPupils.has(classId)) classPupils.set(classId, []);
    classPupils.get(classId)!.push(result);
  }

  const positions = new Map<string, number>();

  // Calculate position within each class
  for (const [classId, classResults] of classPupils) {
    // Group by pupil and calculate average score
    const pupilAverages = new Map<string, number>();
    for (const result of classResults) {
      const avg =
        pupilAverages.get(result.pupilId) ??
        (result.totalScore ?? 0);
      pupilAverages.set(
        result.pupilId,
        Math.max(avg, result.totalScore ?? 0),
      );
    }

    // Sort by score descending and assign positions (dense ranking)
    const sorted = Array.from(pupilAverages.entries())
      .sort((a, b) => b[1] - a[1]);

    let position = 1;
    let lastScore = sorted[0]?.[1] ?? 0;

    for (let i = 0; i < sorted.length; i++) {
      const [pupilId, score] = sorted[i];
      if (score < lastScore) position = i + 1;
      positions.set(pupilId, position);
      lastScore = score;
    }
  }

  return positions;
}

/**
 * Update result positions for an assessment
 */
export async function updateAssessmentPositions(
  assessmentId: string,
): Promise<void> {
  const positions = await calculateClassPositions(assessmentId);

  // Batch update all results
  for (const [pupilId, position] of positions) {
    await prisma.result.updateMany({
      where: { assessmentId, pupilId },
      data: { position },
    });
  }
}
