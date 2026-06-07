"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Edit2, FileText, Clock, CheckCircle, Mail, Phone, MapPin, Calendar, User, Users, LayoutGrid, BookOpen, Heart, Activity } from "lucide-react";
import { pupilName } from "@/lib/format";
import { resolveFileUrl } from "@/lib/api-client";

export default function StudentViewClient({ studentId }: { studentId: string }) {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState("overview");

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
  const yearsEnrolled = student.admissionDate ? new Date().getFullYear() - new Date(student.admissionDate).getFullYear() : 0;

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "personal", label: "Personal", icon: User },
    { id: "guardian", label: "Guardian", icon: Users },
    { id: "medical", label: "Medical", icon: Heart },
    { id: "academic", label: "Academic", icon: BookOpen },
  ];

  // Calculate real data
  const feesBalance = student.feesBalance || 0;
  const attendancePercentage = student.attendancePercentage || 0;
  const performanceGrade = student.performanceGrade || "N/A";

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm py-3 -mx-6 px-6 mb-6">
        <div className="flex items-center justify-between">
          <Link href="/admin/students" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <h1 className="flex-1 text-center text-lg font-semibold text-slate-900">{fullName}</h1>
          <div className="flex items-center gap-2">
            <Link href={`/admin/students/${studentId}/edit`}>
              <Button className="gap-2">
                <Edit2 className="h-4 w-4" />
                Edit
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6">
        {/* Profile Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-6">
          <div className="flex gap-6 items-start">
            {/* Photo */}
            <div className="flex-shrink-0">
              {photoUrl ? (
                <img src={photoUrl} alt={fullName} className="h-28 w-28 rounded-xl border-2 border-slate-200 object-cover" />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-xl border-2 border-slate-200 bg-slate-100">
                  <span className="text-4xl text-slate-400">👤</span>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-slate-900">{fullName}</h2>
                <p className="mt-1 text-sm text-slate-600">{student.admissionNo}</p>
              </div>

              <div className="flex flex-wrap gap-3 mb-4">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                  student.status === "ACTIVE" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-slate-100 text-slate-800"
                }`}>
                  <CheckCircle className="h-4 w-4" />
                  {student.status === "ACTIVE" ? "Active" : "Inactive"}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800">
                  <User className="h-4 w-4" />
                  {student.class?.name || "No Class"}
                </span>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500 uppercase">Years Enrolled</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{yearsEnrolled}+</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500 uppercase">Gender</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{student.gender || "—"}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500 uppercase">DOB</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : "—"}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500 uppercase">Admitted</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
          {/* Fees Status */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Fees Status</p>
                <p className="mt-2 text-lg font-bold text-slate-900">₦{feesBalance.toLocaleString()}</p>
                <p className="text-xs text-slate-600 mt-1">Balance due</p>
              </div>
              <div className="rounded-lg p-2.5" style={{ backgroundColor: "#E7F5FF", color: "#0A66C2" }}>
                <FileText className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Attendance */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Attendance</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{attendancePercentage}%</p>
                <p className="text-xs text-slate-600 mt-1">This term</p>
              </div>
              <div className="rounded-lg p-2.5" style={{ backgroundColor: "#E7F5FF", color: "#0A66C2" }}>
                <Activity className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Performance */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Performance</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{performanceGrade}</p>
                <p className="text-xs text-slate-600 mt-1">Average grade</p>
              </div>
              <div className="rounded-lg p-2.5" style={{ backgroundColor: "#E7F5FF", color: "#0A66C2" }}>
                <LayoutGrid className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
          <Link href={`#fees`}>
            <button className="w-full rounded-lg border border-slate-200 bg-white p-3 text-center hover:bg-slate-50 transition">
              <FileText className="mx-auto h-5 w-5 mb-1" style={{ color: "#0A66C2" }} />
              <p className="text-xs font-semibold text-slate-900">View Fees</p>
            </button>
          </Link>
          <Link href={`#attendance`}>
            <button className="w-full rounded-lg border border-slate-200 bg-white p-3 text-center hover:bg-slate-50 transition">
              <Calendar className="mx-auto h-5 w-5 mb-1" style={{ color: "#0A66C2" }} />
              <p className="text-xs font-semibold text-slate-900">Attendance</p>
            </button>
          </Link>
          <Link href={`#results`}>
            <button className="w-full rounded-lg border border-slate-200 bg-white p-3 text-center hover:bg-slate-50 transition">
              <CheckCircle className="mx-auto h-5 w-5 mb-1" style={{ color: "#0A66C2" }} />
              <p className="text-xs font-semibold text-slate-900">Results</p>
            </button>
          </Link>
          <Link href={`/admin/students/${studentId}/edit`}>
            <button className="w-full rounded-lg border border-slate-200 bg-white p-3 text-center hover:bg-slate-50 transition">
              <Edit2 className="mx-auto h-5 w-5 mb-1" style={{ color: "#0A66C2" }} />
              <p className="text-xs font-semibold text-slate-900">Edit Info</p>
            </button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-slate-200">
          <div className="flex gap-0">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "border-b-2 text-slate-900"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                  style={activeTab === tab.id ? { borderBottomColor: "#0A66C2", color: "#0A66C2" } : {}}
                >
                  <IconComponent className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "overview" && (
            <>
              {/* Quick Contact */}
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h3 className="mb-4 text-sm font-semibold uppercase text-slate-500">Contact Information</h3>
                <div className="space-y-3">
                  {student.studentEmail && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Email</p>
                        <p className="text-sm font-medium text-slate-900">{student.studentEmail}</p>
                      </div>
                    </div>
                  )}
                  {student.studentPhone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Phone</p>
                        <p className="text-sm font-medium text-slate-900">{student.studentPhone}</p>
                      </div>
                    </div>
                  )}
                  {student.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-slate-400 mt-1" />
                      <div>
                        <p className="text-xs text-slate-500">Address</p>
                        <p className="text-sm font-medium text-slate-900">{student.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Class Info */}
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h3 className="mb-4 text-sm font-semibold uppercase text-slate-500">Class Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Class</p>
                    <p className="mt-2 text-lg font-bold text-slate-900">{student.class?.name || "—"}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Phase</p>
                    <p className="mt-2 text-lg font-bold text-slate-900">{student.class?.phase || "—"}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Status</p>
                    <p className="mt-2 text-lg font-bold text-slate-900">{student.status}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Admitted</p>
                    <p className="mt-2 text-sm font-bold text-slate-900">
                      {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "personal" && (
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">First Name</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{student.firstName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Last Name</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{student.lastName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Middle Name</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{student.middleName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Gender</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{student.gender || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Date of Birth</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">
                      {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Admission #</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{student.admissionNo}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "guardian" && student.guardians && student.guardians.length > 0 && (
            <div className="space-y-4">
              {student.guardians.map((g: any, i: number) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-white p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="rounded-full bg-slate-100 p-3">
                      <Users className="h-6 w-6 text-slate-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {g.guardian?.firstName} {g.guardian?.lastName}
                      </h4>
                      <p className="text-xs text-slate-500">{g.relationship}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {g.guardian?.phone && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-semibold">Phone</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">{g.guardian.phone}</p>
                      </div>
                    )}
                    {g.guardian?.email && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-semibold">Email</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">{g.guardian.email}</p>
                      </div>
                    )}
                    {g.guardian?.occupation && (
                      <div className="col-span-2">
                        <p className="text-xs text-slate-500 uppercase font-semibold">Occupation</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">{g.guardian.occupation}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "medical" && (student.bloodGroup || student.genotype || student.medicalNotes) && (
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="space-y-4">
                {student.bloodGroup && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Blood Group</p>
                    <p className="mt-2 text-lg font-bold text-slate-900">{student.bloodGroup}</p>
                  </div>
                )}
                {student.genotype && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Genotype</p>
                    <p className="mt-2 text-lg font-bold text-slate-900">{student.genotype}</p>
                  </div>
                )}
                {student.medicalNotes && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Medical Notes</p>
                    <p className="mt-2 text-sm text-slate-900 whitespace-pre-wrap">{student.medicalNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "academic" && (student.previousSchool || student.previousClass) && (
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="grid grid-cols-2 gap-4">
                {student.previousSchool && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Previous School</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{student.previousSchool}</p>
                  </div>
                )}
                {student.previousClass && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Previous Class</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{student.previousClass}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
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
  );
}
