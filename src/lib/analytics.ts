// Analytics removed - use backend API instead

export async function getClassAnalytics(): Promise<any> {
  throw new Error("Use GET /api/analytics/class instead");
}

export async function getSubjectAnalytics(): Promise<any> {
  throw new Error("Use GET /api/analytics/subject instead");
}

export async function getStudentAnalytics(): Promise<any> {
  throw new Error("Use GET /api/analytics/student instead");
}

export async function getSchoolAnalytics(): Promise<any> {
  throw new Error("Use GET /api/analytics/school instead");
}
