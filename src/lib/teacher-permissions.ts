// Database access removed for Vercel compatibility
// Use backend API endpoints instead

/**
 * Get all classes a teacher is assigned to
 */
export async function getTeacherClasses(teacherId: string, schoolId: string) {
  return prisma.teacherClass.findMany({
    where: { teacherId, schoolId },
    include: { class: true },
  });
}

/**
 * Get all subjects a teacher is assigned to
 */
export async function getTeacherSubjects(teacherId: string, schoolId: string) {
  return prisma.teacherSubject.findMany({
    where: { teacherId, schoolId },
    include: { subject: true },
  });
}

/**
 * Check if a teacher has access to a specific class
 */
export async function canTeacherAccessClass(
  teacherId: string,
  classId: string,
  schoolId: string,
): Promise<boolean> {
  const assignment = await prisma.teacherClass.findFirst({
    where: { teacherId, classId, schoolId },
  });
  return !!assignment;
}

/**
 * Check if a teacher has access to a specific subject
 */
export async function canTeacherAccessSubject(
  teacherId: string,
  subjectId: string,
  schoolId: string,
): Promise<boolean> {
  const assignment = await prisma.teacherSubject.findFirst({
    where: { teacherId, subjectId, schoolId },
  });
  return !!assignment;
}

/**
 * Check if a teacher can access a specific class+subject combination
 */
export async function canTeacherAccessClassSubject(
  teacherId: string,
  classId: string,
  subjectId: string,
  schoolId: string,
): Promise<boolean> {
  // Must have access to both class and subject
  const hasClass = await canTeacherAccessClass(teacherId, classId, schoolId);
  const hasSubject = await canTeacherAccessSubject(teacherId, subjectId, schoolId);
  return hasClass && hasSubject;
}

/**
 * Get all class IDs a teacher can access
 */
export async function getTeacherAccessibleClassIds(
  teacherId: string,
  schoolId: string,
): Promise<string[]> {
  const assignments = await getTeacherClasses(teacherId, schoolId);
  return assignments.map((a) => a.classId);
}

/**
 * Get all subject IDs a teacher can access
 */
export async function getTeacherAccessibleSubjectIds(
  teacherId: string,
  schoolId: string,
): Promise<string[]> {
  const assignments = await getTeacherSubjects(teacherId, schoolId);
  return assignments.map((a) => a.subjectId);
}
