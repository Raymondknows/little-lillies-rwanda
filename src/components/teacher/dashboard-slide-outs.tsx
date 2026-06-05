"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, ClipboardList, Bell, Users, FileText, CalendarCheck, BookOpen, X } from "lucide-react";
import { pupilName } from "@/lib/format";

interface AssignedRow {
  assessment: {
    id: string;
    name: string;
    phase: string;
    status: string;
  };
  classItem: {
    id: string;
    name: string;
    arm?: string | null;
  };
}

interface AttendanceItem {
  classItem: {
    id: string;
    name: string;
    arm?: string | null;
    phase: string;
  };
  status: string;
}

interface AnnouncementItem {
  id: string;
  title: string;
  body: string;
  publishedAt?: string | Date | null;
}

interface StudentItem {
  id: string;
  firstName: string;
  lastName: string;
  admissionNo?: string | null;
  class?: {
    name: string;
    arm?: string | null;
  } | null;
}

interface AssignmentCard {
  classItem: {
    id: string;
    name: string;
    arm?: string | null;
  };
  subject: {
    name: string;
  };
}

interface ContinueAssessment {
  id: string;
  name: string;
  term: { name: string };
  phase: string;
  status: string;
  updatedAt?: string | null;
}

interface TeacherDashboardSlideOutProps {
  continueAssessment?: ContinueAssessment | null;
  pendingRows: AssignedRow[];
  attendanceByClass: AttendanceItem[];
  announcements: AnnouncementItem[];
  students: StudentItem[];
  assignmentCards: AssignmentCard[];
}

function mapTeacherStatus(status: string) {
  switch (status) {
    case "DRAFT":
      return "Pending";
    case "APPROVED":
      return "Submitted";
    case "PUBLISHED":
      return "Published";
    default:
      return status;
  }
}

export function TeacherDashboardSlideOuts({
  continueAssessment,
  pendingRows,
  attendanceByClass,
  announcements,
  students,
  assignmentCards,
}: TeacherDashboardSlideOutProps) {
  const [activePanel, setActivePanel] = useState<"results" | "attendance" | "announcements" | "students" | "assignments" | null>(null);

  const panelTitle = {
    results: "Pending results",
    attendance: "Attendance today",
    announcements: "Latest announcements",
    students: "Class students",
    assignments: "Assigned teaching",
  }[activePanel ?? "results"];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Button
          type="button"
          variant="secondary"
          className="justify-start gap-3 py-5"
          onClick={() => setActivePanel("results")}
        >
          <FileText className="h-5 w-5" />
          Results
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="justify-start gap-3 py-5"
          onClick={() => setActivePanel("attendance")}
        >
          <CalendarCheck className="h-5 w-5" />
          Attendance
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="justify-start gap-3 py-5"
          onClick={() => setActivePanel("announcements")}
        >
          <Bell className="h-5 w-5" />
          Announcements
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="justify-start gap-3 py-5"
          onClick={() => setActivePanel("students")}
        >
          <Users className="h-5 w-5" />
          Students
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="justify-start gap-3 py-5"
          onClick={() => setActivePanel("assignments")}
        >
          <BookOpen className="h-5 w-5" />
          Assigned
        </Button>
      </div>

      {activePanel ? (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 px-4 py-6 sm:px-6">
          <div className="absolute inset-0" onClick={() => setActivePanel(null)} />
          <aside className="relative mx-auto flex h-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <div>
                <p className="text-sm font-semibold text-foreground">{panelTitle}</p>
                <p className="text-sm text-muted">A focused view for faster workflow and less scrolling.</p>
              </div>
              <Button type="button" variant="ghost" className="h-10 w-10 p-0" onClick={() => setActivePanel(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="overflow-y-auto p-6">
              {activePanel === "results" && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border border-border bg-background p-4">
                      <p className="text-sm text-muted">Pending assessments</p>
                      <p className="mt-2 text-3xl font-semibold text-foreground">{pendingRows.length}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-background p-4">
                      <p className="text-sm text-muted">Continue from</p>
                      <p className="mt-2 text-lg font-medium text-foreground">{continueAssessment?.name ?? "No active assessment"}</p>
                      {continueAssessment ? (
                        <p className="mt-1 text-sm text-muted">{mapTeacherStatus(continueAssessment.status)}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-border bg-background">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-border bg-surface text-muted">
                        <tr>
                          <th className="px-4 py-3">Assessment</th>
                          <th className="px-4 py-3">Class</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3" />
                        </tr>
                      </thead>
                      <tbody>
                        {pendingRows.slice(0, 5).map((row) => (
                          <tr key={`${row.assessment.id}-${row.classItem.id}`} className="border-t border-border hover:bg-surface/70 transition-colors">
                            <td className="px-4 py-3 font-medium text-foreground">{row.assessment.name}</td>
                            <td className="px-4 py-3">{row.classItem.name}{row.classItem.arm ? ` ${row.classItem.arm}` : ""}</td>
                            <td className="px-4 py-3">
                              <Badge variant={row.assessment.status === "PUBLISHED" ? "success" : row.assessment.status === "APPROVED" ? "brand" : "default"}>
                                {mapTeacherStatus(row.assessment.status)}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Link href={`/teacher/results/${row.assessment.id}?classId=${row.classItem.id}`} className="text-brand hover:underline">
                                Open
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between gap-4 pt-4">
                    <Link href="/teacher/results" className="text-brand hover:underline">
                      View all results
                    </Link>
                    <Button href="/teacher/results" variant="secondary">
                      Open workflow
                    </Button>
                  </div>
                </div>
              )}

              {activePanel === "assignments" && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border border-border bg-background p-4">
                      <p className="text-sm text-muted">Assigned teaching</p>
                      <p className="mt-2 text-3xl font-semibold text-foreground">{assignmentCards.length}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-background p-4">
                      <p className="text-sm text-muted">Active pairing</p>
                      <p className="mt-2 text-lg font-medium text-foreground">{assignmentCards[0]?.classItem.name ?? "No assignment"}</p>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-border bg-background">
                    <ul className="divide-y divide-border">
                      {assignmentCards.slice(0, 6).map((assignment) => (
                        <li key={`${assignment.classItem.id}-${assignment.subject.name}`} className="flex items-center justify-between gap-4 px-4 py-4">
                          <div>
                            <p className="font-semibold text-foreground">{assignment.classItem.name}{assignment.classItem.arm ? ` ${assignment.classItem.arm}` : ""}</p>
                            <p className="text-sm text-muted">{assignment.subject.name}</p>
                          </div>
                          <Badge variant={attendanceByClass.find((item) => item.classItem.id === assignment.classItem.id)?.status === "Completed" ? "success" : "default"}>
                            {attendanceByClass.find((item) => item.classItem.id === assignment.classItem.id)?.status ?? "Not taken"}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {assignmentCards.length > 2 && (
                    <p className="text-sm text-muted">{assignmentCards.length - 2} more assignments. Open the workflow to see all.</p>
                  )}
                  <div className="flex items-center justify-between gap-4 pt-4">
                    <Link href="/teacher/results" className="text-brand hover:underline">
                      View all assessments
                    </Link>
                    <Button href="/teacher/results" variant="secondary">
                      Open workflow
                    </Button>
                  </div>
                </div>
              )}

              {activePanel === "attendance" && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border border-border bg-background p-4">
                      <p className="text-sm text-muted">Classes with attendance</p>
                      <p className="mt-2 text-3xl font-semibold text-foreground">{attendanceByClass.length}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-background p-4">
                      <p className="text-sm text-muted">Completed today</p>
                      <p className="mt-2 text-3xl font-semibold text-foreground">{attendanceByClass.filter((item) => item.status === "Completed").length}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {attendanceByClass.slice(0, 6).map((item) => (
                      <div key={item.classItem.id} className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-4">
                        <div>
                          <p className="font-medium text-foreground">{item.classItem.name}{item.classItem.arm ? ` ${item.classItem.arm}` : ""}</p>
                          <p className="text-sm text-muted">{item.classItem.phase}</p>
                        </div>
                        <Badge variant={item.status === "Completed" ? "success" : "default"}>{item.status}</Badge>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between gap-4 pt-4">
                    <Link href="/teacher/attendance" className="text-brand hover:underline">
                      View attendance register
                    </Link>
                    <Button href="/teacher/attendance" variant="secondary">
                      Take attendance
                    </Button>
                  </div>
                </div>
              )}

              {activePanel === "announcements" && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border border-border bg-background p-4">
                      <p className="text-sm text-muted">Published announcements</p>
                      <p className="mt-2 text-3xl font-semibold text-foreground">{announcements.length}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-background p-4">
                      <p className="text-sm text-muted">Latest update</p>
                      <p className="mt-2 text-lg font-medium text-foreground">{announcements[0]?.title ?? "No updates"}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {announcements.slice(0, 5).map((announcement) => (
                      <article key={announcement.id} className="rounded-xl border border-border bg-background p-4">
                        <p className="font-semibold text-foreground">{announcement.title}</p>
                        <p className="mt-2 text-sm text-muted">{announcement.body}</p>
                        <p className="mt-3 text-xs text-muted">
                          {announcement.publishedAt ? new Date(announcement.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                        </p>
                      </article>
                    ))}
                  </div>
                  <div className="flex justify-end pt-4">
                    <Link href="/teacher/announcements" className="text-brand hover:underline">
                      View all announcements
                    </Link>
                  </div>
                </div>
              )}

              {activePanel === "students" && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border border-border bg-background p-4">
                      <p className="text-sm text-muted">Students in assigned classes</p>
                      <p className="mt-2 text-3xl font-semibold text-foreground">{students.length}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-background p-4">
                      <p className="text-sm text-muted">Example student</p>
                      <p className="mt-2 text-lg font-medium text-foreground">{students[0] ? pupilName(students[0].firstName, students[0].lastName) : "No students"}</p>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-border bg-background">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-border bg-surface text-muted">
                        <tr>
                          <th className="px-4 py-3">Student</th>
                          <th className="px-4 py-3">Class</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.slice(0, 6).map((student) => (
                          <tr key={student.id} className="border-t border-border hover:bg-surface/70 transition-colors">
                            <td className="px-4 py-3 font-medium text-foreground">{pupilName(student.firstName, student.lastName)}</td>
                            <td className="px-4 py-3 text-muted">{student.class?.name ?? "-"}{student.class?.arm ? ` ${student.class.arm}` : ""}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-between gap-4 pt-4 text-sm text-muted">
                    <span>{students.length} students in your classes</span>
                    <Link href="/teacher/students" className="text-brand hover:underline">
                      View full list
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
