// Server actions removed for Vercel compatibility
// All backend operations must use API routes (e.g., POST /api/admin/...)
// This file is kept for build compatibility but contains no functional code

export async function recordPayment() {
  throw new Error("Use POST /api/admin/payments instead");
}

export async function createFeeScheduleAction() {
  throw new Error("Use POST /api/admin/fees/schedules instead");
}

export async function issueTermInvoicesAction() {
  throw new Error("Use POST /api/admin/invoices/issue instead");
}

export async function sendFeeRemindersAction() {
  throw new Error("Use POST /api/admin/fees/reminders instead");
}

export async function publishAssessment() {
  throw new Error("Use POST /api/admin/assessments/publish instead");
}

export async function approveAssessment() {
  throw new Error("Use POST /api/admin/assessments/approve instead");
}

export async function returnAssessmentToDraft() {
  throw new Error("Use POST /api/admin/assessments/return-draft instead");
}

export async function createClass() {
  throw new Error("Use POST /api/admin/classes instead");
}

export async function updateClass() {
  throw new Error("Use PATCH /api/admin/classes instead");
}

export async function deleteClass() {
  throw new Error("Use DELETE /api/admin/classes instead");
}

export async function saveAttendance() {
  throw new Error("Use POST /api/admin/attendance instead");
}

export async function createAnnouncement() {
  throw new Error("Use POST /api/admin/announcements instead");
}

export async function saveTeacherAssignments() {
  throw new Error("Use POST /api/admin/teachers/assignments instead");
}

export async function createSubject() {
  throw new Error("Use POST /api/admin/subjects instead");
}

export async function updateSubject() {
  throw new Error("Use PATCH /api/admin/subjects instead");
}

export async function deleteSubject() {
  throw new Error("Use DELETE /api/admin/subjects instead");
}

export async function createTeacher() {
  throw new Error("Use POST /api/admin/teachers instead");
}

export async function updateTeacher() {
  throw new Error("Use PATCH /api/admin/teachers instead");
}

export async function addTeacherClass() {
  throw new Error("Use POST /api/admin/teachers/classes instead");
}

export async function removeTeacherClass() {
  throw new Error("Use DELETE /api/admin/teachers/classes instead");
}

export async function addTeacherSubject() {
  throw new Error("Use POST /api/admin/teachers/subjects instead");
}

export async function removeTeacherSubject() {
  throw new Error("Use DELETE /api/admin/teachers/subjects instead");
}

export async function createAssessment() {
  throw new Error("Use POST /api/admin/assessments instead");
}

export async function createStudent() {
  throw new Error("Use POST /api/admin/students instead");
}
