"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Edit2, Mail, Phone, MapPin } from "lucide-react";
import { formatMoney, pupilName } from "@/lib/format";
import { resolveFileUrl } from "@/lib/api-client";

export default function StudentViewClient({ studentId }: { studentId: string }) {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadStudent = async () => {
      try {
        const response = await fetch(`/api/admin/students/${studentId}`);
        if (!response.ok) throw new Error("Failed to load student");
        const data = await response.json();
        setStudent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load student");
      } finally {
        setLoading(false);
      }
    };
    loadStudent();
  }, [studentId]);

  if (loading) return <div className="p-6">Loading student profile...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!student) return <div className="p-6">Student not found</div>;

  const photoUrl = resolveFileUrl(student.photoUrl, student.id);
  const fullName = pupilName(student.firstName, student.lastName);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm py-1.5 -mx-6 px-6 mb-4">
        <div className="flex items-center justify-between gap-3">
          <Link href="/admin/students" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <h1 className="flex-1 text-center text-lg font-semibold text-slate-900">{fullName}</h1>
          <Link href={`/admin/students/${studentId}/edit`}>
            <Button className="gap-2">
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6">
        <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-6 space-y-6">
          {/* Student Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Photo & Badges */}
            <div className="md:col-span-1">
            <div className="space-y-4">
              {photoUrl ? (
                <img src={photoUrl} alt={fullName} className="w-full rounded-xl border border-slate-200 object-cover aspect-square" />
              ) : (
                <div className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-100 aspect-square">
                  <span className="text-6xl text-slate-400">👤</span>
                </div>
              )}
              <div className="space-y-2">
                <div className={`rounded-lg p-3 text-center text-sm font-medium ${
                  student.status === "ACTIVE"
                    ? "bg-green-100 text-green-800"
                    : "bg-slate-100 text-slate-800"
                }`}>
                  {student.status === "ACTIVE" ? "Active" : "Inactive"}
                </div>
                <div className="rounded-lg bg-brand/10 p-3 text-center text-sm font-medium text-brand">
                  {student.class?.name || "No Class"}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Main Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{fullName}</h2>
              <p className="mt-2 text-sm text-slate-500">Current student profile and placement overview.</p>
              <p className="text-sm text-slate-600 mt-4">Admission #: <span className="font-semibold text-slate-900">{student.admissionNo}</span></p>
            </div>

            {/* Key Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Gender</p>
                <p className="mt-1 text-sm font-medium text-slate-900">{student.gender || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Date of Birth</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Phase</p>
                <p className="mt-1 text-sm font-medium text-slate-900">{student.class?.phase || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Enrollment date</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : "—"}
                </p>
              </div>
            </div>

            {/* Contact Details */}
            <div className="border-t border-slate-200 pt-4 space-y-3">
              {student.studentEmail && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm text-slate-900 truncate">{student.studentEmail}</p>
                  </div>
                </div>
              )}
              {student.studentPhone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Phone</p>
                    <p className="text-sm text-slate-900">{student.studentPhone}</p>
                  </div>
                </div>
              )}
              {student.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">Address</p>
                    <p className="text-sm text-slate-900 break-words">{student.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Key metrics</h3>
            <p className="text-sm text-slate-500">Snapshot of the student’s financial and academic status.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500 mb-3">Fees balance</p>
            <p className="text-3xl font-semibold text-slate-900">{formatMoney(student.feesBalance || 0)}</p>
            <p className="text-sm text-slate-500 mt-2">Outstanding balance</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500 mb-3">Attendance</p>
            <p className="text-3xl font-semibold text-slate-900">{(student.attendancePercentage || 0)}%</p>
            <p className="text-sm text-slate-500 mt-2">Term attendance</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500 mb-3">Performance</p>
            <p className="text-3xl font-semibold text-slate-900">{student.performanceGrade || "N/A"}</p>
            <p className="text-sm text-slate-500 mt-2">Average grade</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Quick actions</h3>
            <p className="text-sm text-slate-500">Jump to the most important student details.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <Link href="#fees" className="block">
            <Button variant="outline" className="w-full">View fees</Button>
          </Link>
          <Link href="#attendance" className="block">
            <Button variant="outline" className="w-full">Attendance</Button>
          </Link>
          <Link href="#results" className="block">
            <Button variant="outline" className="w-full">Results</Button>
          </Link>
          <Link href={`/admin/students/${studentId}/edit`} className="block">
            <Button className="w-full">Edit profile</Button>
          </Link>
        </div>

        {/* Additional Information */}
        {student.guardians && student.guardians.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase text-slate-500">Family contacts</h3>
            <div className="space-y-3">
              {student.guardians.map((g: any, i: number) => (
                <div key={i} className="rounded-lg border border-slate-200 p-4">
                  <div className="mb-3">
                    <h4 className="text-sm font-bold text-slate-900">
                      {g.guardian?.firstName} {g.guardian?.lastName}
                    </h4>
                    <p className="text-xs text-slate-500">{g.relationship}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {g.guardian?.phone && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Phone</p>
                        <p className="text-slate-900">{g.guardian.phone}</p>
                      </div>
                    )}
                    {g.guardian?.email && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Email</p>
                        <p className="text-slate-900 truncate">{g.guardian.email}</p>
                      </div>
                    )}
                    {g.guardian?.occupation && (
                      <div className="col-span-2">
                        <p className="text-xs text-slate-500 mb-1">Occupation</p>
                        <p className="text-slate-900">{g.guardian.occupation}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Medical Information */}
        {(student.bloodGroup || student.genotype || student.medicalNotes) && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase text-slate-500">Health record</h3>
            <div className="rounded-lg border border-slate-200 p-4 grid grid-cols-2 gap-4 text-sm">
              {student.bloodGroup && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Blood Group</p>
                  <p className="font-medium text-slate-900">{student.bloodGroup}</p>
                </div>
              )}
              {student.genotype && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Genotype</p>
                  <p className="font-medium text-slate-900">{student.genotype}</p>
                </div>
              )}
              {student.medicalNotes && (
                <div className="col-span-2">
                  <p className="text-xs text-slate-500 mb-1">Medical Notes</p>
                  <p className="text-slate-900 whitespace-pre-wrap">{student.medicalNotes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Academic Background */}
        {(student.previousSchool || student.previousClass) && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase text-slate-500">Academic background</h3>
            <div className="rounded-lg border border-slate-200 p-4 grid grid-cols-2 gap-4 text-sm">
              {student.previousSchool && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Previous School</p>
                  <p className="text-slate-900">{student.previousSchool}</p>
                </div>
              )}
              {student.previousClass && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Previous Class</p>
                  <p className="text-slate-900">{student.previousClass}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Action */}
        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <Link href={`/admin/students/${studentId}/edit`} className="flex-1">
            <Button className="w-full gap-2">
              <Edit2 className="h-4 w-4" />
              Edit Student
            </Button>
          </Link>
          <Link href="/admin/students" className="flex-1">
            <Button variant="outline" className="w-full">
              Back to List
            </Button>
          </Link>
        </div>
      </div>
    </div>
  </div>
  );
}

