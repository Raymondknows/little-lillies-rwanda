"use server";

// Server actions removed for Vercel compatibility
// All backend operations must use API routes (e.g., POST /api/admin/...)
// This file is kept for build compatibility but contains no functional code

export async function recordPayment(formData: FormData) {
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

export async function publishAssessment(...args: any[]): Promise<any> {
  throw new Error("Use POST /api/admin/assessments/publish instead");
}

export async function approveAssessment(...args: any[]): Promise<any> {
  throw new Error("Use POST /api/admin/assessments/approve instead");
}

export async function returnAssessmentToDraft(...args: any[]): Promise<any> {
  throw new Error("Use POST /api/admin/assessments/return-draft instead");
}

export async function returnAssessmentToDraftForm(...args: any[]): Promise<any> {
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

export async function createAnnouncement(formData: FormData) {
  throw new Error("Use POST /api/admin/announcements instead");
}

export async function saveTeacherAssignments(formData: FormData) {
  throw new Error("Use POST /api/admin/teachers/assignments instead");
}

export async function createSubject(formData: FormData) {
  throw new Error("Use POST /api/admin/subjects instead");
}

export async function updateSubject(formData: FormData) {
  throw new Error("Use PATCH /api/admin/subjects instead");
}

export async function deleteSubject(formData: FormData) {
  throw new Error("Use DELETE /api/admin/subjects instead");
}

export async function createTeacher(formData: FormData) {
  throw new Error("Use POST /api/admin/teachers instead");
}

export async function updateTeacher(formData: FormData) {
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

export async function updateStudent(...args: any[]): Promise<any> {
  throw new Error("Use PATCH /api/admin/students/[id] instead");
}


export async function createAcademicYear() {
  throw new Error("Use POST /api/admin/academic-years instead");
}

export async function createTerm() {
  throw new Error("Use POST /api/admin/terms instead");
}

export async function setCurrentAcademicYear() {
  throw new Error("Use PATCH /api/admin/academic-years/current instead");
}

export async function updateTerm(formData: FormData) {
  throw new Error("Use PATCH /api/admin/terms instead");
}

export async function saveResultMarks() {
  throw new Error("Use POST /api/admin/results instead");
}
