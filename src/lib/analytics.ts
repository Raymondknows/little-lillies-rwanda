import { prisma } from "@/lib/db";

export async function getClassAnalytics(classId: string, schoolId: string) {
  const results = await prisma.result.findMany({
    where: {
      pupil: { classId, schoolId },
      publishedAt: { not: null },
    },
    include: {
      assessment: true,
    },
  });

  if (results.length === 0) {
    return null;
  }

  // Calculate statistics
  const totalScores = results.map((r) => r.totalScore ?? 0).filter((s) => s > 0);
  const grades = results.map((r) => r.grade).filter((g): g is string => Boolean(g));

  const classAverage = totalScores.length > 0 ? totalScores.reduce((a, b) => a + b, 0) / totalScores.length : 0;
  const passCount = grades.filter((g) => !["E", "F"].includes(g)).length;
  const passRate = grades.length > 0 ? (passCount / grades.length) * 100 : 0;

  const gradeDistribution = {
    A: grades.filter((g) => g === "A").length,
    B: grades.filter((g) => g === "B").length,
    C: grades.filter((g) => g === "C").length,
    D: grades.filter((g) => g === "D").length,
    E: grades.filter((g) => g === "E").length,
    F: grades.filter((g) => g === "F").length,
  };

  return {
    classAverage: parseFloat(classAverage.toFixed(2)),
    passRate: parseFloat(passRate.toFixed(1)),
    totalResults: results.length,
    gradeDistribution,
  };
}

export async function getSubjectAnalytics(subjectId: string, schoolId: string) {
  const results = await prisma.result.findMany({
    where: {
      subjectId,
      pupil: { schoolId },
      publishedAt: { not: null },
    },
  });

  if (results.length === 0) {
    return null;
  }

  const totalScores = results.map((r) => r.totalScore ?? 0).filter((s) => s > 0);
  const grades = results.map((r) => r.grade).filter((g): g is string => Boolean(g));

  const subjectAverage = totalScores.length > 0 ? totalScores.reduce((a, b) => a + b, 0) / totalScores.length : 0;
  const passCount = grades.filter((g) => !["E", "F"].includes(g)).length;
  const passRate = grades.length > 0 ? (passCount / grades.length) * 100 : 0;

  return {
    subjectAverage: parseFloat(subjectAverage.toFixed(2)),
    passRate: parseFloat(passRate.toFixed(1)),
    totalResults: results.length,
  };
}

export async function getAssessmentAnalytics(assessmentId: string, schoolId: string) {
  const results = await prisma.result.findMany({
    where: {
      assessmentId,
      pupil: { schoolId },
      publishedAt: { not: null },
    },
    include: {
      pupil: { include: { class: true } },
    },
  });

  if (results.length === 0) {
    return null;
  }

  // Group by class
  const byClass = new Map<string, typeof results>();
  for (const result of results) {
    const classId = result.pupil.classId || "unknown";
    if (!byClass.has(classId)) {
      byClass.set(classId, []);
    }
    byClass.get(classId)!.push(result);
  }

  const classMetrics = Array.from(byClass.entries()).map(([classId, classResults]) => {
    const totalScores = classResults.map((r) => r.totalScore ?? 0).filter((s) => s > 0);
    const grades = classResults.map((r) => r.grade).filter((g): g is string => Boolean(g));
    const classAverage = totalScores.length > 0 ? totalScores.reduce((a, b) => a + b, 0) / totalScores.length : 0;
    const passCount = grades.filter((g) => !["E", "F"].includes(g)).length;
    const passRate = grades.length > 0 ? (passCount / grades.length) * 100 : 0;

    return {
      classId,
      className: classResults[0]?.pupil.class?.name || "Unknown",
      average: parseFloat(classAverage.toFixed(2)),
      passRate: parseFloat(passRate.toFixed(1)),
      studentCount: classResults.length,
    };
  });

  return {
    classMetrics,
    totalResults: results.length,
  };
}

export async function getSchoolAnalytics(schoolId: string) {
  const results = await prisma.result.findMany({
    where: {
      pupil: { schoolId },
      publishedAt: { not: null },
    },
    include: {
      pupil: { include: { class: true } },
    },
  });

  if (results.length === 0) {
    return null;
  }

  const totalScores = results.map((r) => r.totalScore ?? 0).filter((s) => s > 0);
  const grades = results.map((r) => r.grade).filter((g): g is string => Boolean(g));

  const schoolAverage = totalScores.length > 0 ? totalScores.reduce((a, b) => a + b, 0) / totalScores.length : 0;
  const passCount = grades.filter((g) => !["E", "F"].includes(g)).length;
  const passRate = grades.length > 0 ? (passCount / grades.length) * 100 : 0;

  const gradeDistribution = {
    A: grades.filter((g) => g === "A").length,
    B: grades.filter((g) => g === "B").length,
    C: grades.filter((g) => g === "C").length,
    D: grades.filter((g) => g === "D").length,
    E: grades.filter((g) => g === "E").length,
    F: grades.filter((g) => g === "F").length,
  };

  // Top performers
  const topPerformers = results
    .sort((a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0))
    .slice(0, 5)
    .map((r) => ({
      pupilId: r.pupilId,
      pupilName: `${r.pupil.firstName} ${r.pupil.lastName}`,
      className: r.pupil.class?.name || "Unknown",
      averageScore: r.totalScore ?? 0,
    }));

  // Struggling students (D, E, F grades)
  const strugglingStudents = results
    .filter((r) => r.grade && ["D", "E", "F"].includes(r.grade))
    .slice(0, 5)
    .map((r) => ({
      pupilId: r.pupilId,
      pupilName: `${r.pupil.firstName} ${r.pupil.lastName}`,
      className: r.pupil.class?.name || "Unknown",
      grade: r.grade,
      averageScore: r.totalScore ?? 0,
    }));

  return {
    schoolAverage: parseFloat(schoolAverage.toFixed(2)),
    passRate: parseFloat(passRate.toFixed(1)),
    totalResults: results.length,
    gradeDistribution,
    topPerformers,
    strugglingStudents,
  };
}
