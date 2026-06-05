"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { UserGuide, type PageHelpGuide } from "@/components/ui/user-guide";
import { createStudent, updateStudent } from "@/app/admin/actions";
import { pupilName } from "@/lib/format";

const PHASE_CONFIG = {
  EARLY_YEARS: { label: "Early Years", badge: "bg-amber-100 text-amber-800" },
  PRIMARY: { label: "Primary", badge: "bg-blue-100 text-blue-800" },
  SECONDARY: { label: "Secondary", badge: "bg-purple-100 text-purple-800" },
  ALL: { label: "All Students", badge: "bg-gray-100 text-gray-800" },
};

const PHASE_ORDER = ["ALL", "EARLY_YEARS", "PRIMARY", "SECONDARY"];
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 500] as const;
const DEFAULT_ITEMS_PER_PAGE = 10;

const HELP_GUIDE: PageHelpGuide = {
  title: "Managing Students",
  overview: "View, search, and manage all active students in your school. Organize by phase (grade level) or search by name and admission number.",
  steps: [
    "Click 'Add student' button to create a new student record",
    "Use the search bar to find students by name or admission number",
    "Filter by phase (Early Years, Primary, Secondary) using tabs",
    "Click a student to view details and edit information",
    "Use pagination to browse through large student lists",
  ],
  commonTasks: [
    {
      title: "Add a New Student",
      description: "Create a new student record in the system",
      tips: [
        "Fill in first name, last name, and admission number",
        "Select the student's class and phase",
        "Add guardian contact information",
        "Upload a student photo (optional)",
      ],
    },
    {
      title: "Search for a Student",
      description: "Quickly find a student using the search box",
      example: "Search: 'John' or 'ADM001' or 'Smith'",
      tips: [
        "Search works on first name, last name, or admission number",
        "Searches are case-insensitive",
        "Results update as you type",
      ],
    },
    {
      title: "Filter by Phase/Grade",
      description: "View students in a specific phase or all phases",
      tips: [
        "Early Years: Pre-K and K students",
        "Primary: Grades 1-6 students",
        "Secondary: Grades 7-12 students",
        "Click 'All Students' to see everyone",
      ],
    },
  ],
  faqs: [
    {
      question: "How do I deactivate a student?",
      answer: "Click the student's name to open details, then click 'Deactivate'. The student will no longer appear in active lists but the record is preserved.",
    },
    {
      question: "Can I bulk import students?",
      answer: "Yes. Click 'Import CSV' and upload a file with columns: firstName, lastName, admissionNo, classId. Consult the template for exact format.",
    },
    {
      question: "Why is a student not appearing in fees/results?",
      answer: "Make sure the student is assigned to a class. Use edit student to verify class assignment and that 'Active' is checked.",
    },
  ],
};

export default function StudentsPageClient({ pupils, classes }: { pupils: any[]; classes: any[] }) {
  const [activePhase, setActivePhase] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const [successModalMessage, setSuccessModalMessage] = useState<string | null>(() => {
    if (searchParams?.get("saved")) {
      return "Student registration completed successfully and the learner is now enrolled in the school roster.";
    }
    if (searchParams?.get("updated")) {
      return "Student record updated successfully and the information is now reflected across the school system.";
    }
    return null;
  });
  const [emailErrorMessage, setEmailErrorMessage] = useState<string | null>(
    searchParams?.get("emailError") ?? null
  );
  const [smtpTestRecipient, setSmtpTestRecipient] = useState("");
  const [smtpTestStatus, setSmtpTestStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [smtpTestMessage, setSmtpTestMessage] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileStudent, setProfileStudent] = useState<any | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("Male");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [classId, setClassId] = useState("");
  const [admissionNo, setAdmissionNo] = useState("");
  const [guardianFirst, setGuardianFirst] = useState("");
  const [guardianLast, setGuardianLast] = useState("");
  const [guardianRelationship, setGuardianRelationship] = useState("Parent");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isAdmissionAuto, setIsAdmissionAuto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const openStudentModal = (student?: any) => {
    setIsSubmitting(false);

    if (student) {
      const guardianLink = student.guardians?.[0];
      setSelectedStudent(student);
      setFirstName(student.firstName ?? "");
      setMiddleName(student.middleName ?? "");
      setLastName(student.lastName ?? "");
      setGender(student.gender ?? "Male");
      setDateOfBirth(student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().slice(0, 10) : "");
      setClassId(student.classId ?? "");
      setAdmissionNo(student.admissionNo ?? "");
      setGuardianFirst(guardianLink?.guardian?.firstName ?? "");
      setGuardianLast(guardianLink?.guardian?.lastName ?? "");
      setGuardianRelationship(guardianLink?.relation ?? "Parent");
      setGuardianEmail(guardianLink?.guardian?.email ?? "");
      setGuardianPhone(guardianLink?.guardian?.phone ?? "");
      setAddress(student.address ?? "");
    } else {
      setSelectedStudent(null);
      setFirstName("");
      setMiddleName("");
      setLastName("");
      setGender("Male");
      setDateOfBirth("");
      setClassId("");
      setAdmissionNo("Generating...");
      setGuardianFirst("");
      setGuardianLast("");
      setGuardianRelationship("Parent");
      setGuardianEmail("");
      setGuardianPhone("");
      setAddress("");
      // Fetch next admission number and keep the field read-only
      setIsAdmissionAuto(true);
      fetch("/api/admin/next-admission")
        .then((r) => r.json())
        .then((d) => {
          if (d?.nextAdmissionNo) {
            setAdmissionNo(d.nextAdmissionNo);
          }
        })
        .catch(() => {
          setAdmissionNo("");
          setIsAdmissionAuto(true);
        });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsSubmitting(false);
  };
  const openProfileModal = (student: any) => {
    setProfileStudent(student);
    setIsProfileOpen(true);
  };
  const closeProfileModal = () => {
    setIsProfileOpen(false);
    setProfileStudent(null);
  };

  const handleStudentSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (isSubmitting) {
      event.preventDefault();
      return;
    }

    startTransition(() => {
      setIsSubmitting(true);
    });
  };

  const formatDate = (value?: string | Date | null) => {
    if (!value) return "—";
    const date = value instanceof Date ? value : new Date(value);
    return date.toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" });
  };

  const formatAge = (value?: string | Date | null) => {
    if (!value) return "—";
    const dob = value instanceof Date ? value : new Date(value);
    const diff = Date.now() - dob.getTime();
    const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    return `${age} yrs`;
  };

  const getGuardian = (student: any) => {
    const entry = student.guardians?.[0] ?? null;
    return entry?.guardian ?? entry ?? null;
  };

  const profileGuardian = profileStudent ? getGuardian(profileStudent) : null;

  // Filter by phase and search
  const filteredPupils = useMemo(() => {
    let filtered = pupils;

    // Filter by phase
    if (activePhase !== "ALL") {
      filtered = filtered.filter((p) => p.class?.phase === activePhase);
    }

    // Filter by search (name or admission number)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p) => {
        const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
        const admissionNo = (p.admissionNo || "").toLowerCase();
        return fullName.includes(query) || admissionNo.includes(query);
      });
    }

    return filtered;
  }, [pupils, activePhase, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredPupils.length / itemsPerPage));
  const paginatedPupils = filteredPupils.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handlePhaseChange = (phase: string) => {
    setActivePhase(phase);
    handleFilterChange();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    handleFilterChange();
  };

  const getPhaseStats = (phase: string) => {
    if (phase === "ALL") {
      return pupils.length;
    }
    return pupils.filter((p) => p.class?.phase === phase).length;
  };

  return (
    <>
      <div>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Students</h1>
            <p className="mt-2 text-sm text-muted">
              {pupils.length} active student{pupils.length !== 1 ? "s" : ""} across all phases
            </p>
          </div>
          <Button type="button" onClick={() => openStudentModal()} className="w-full sm:w-auto px-3 py-2 text-sm">
            Register Student
          </Button>
        </div>

        {successModalMessage ? (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4 py-8">
            <div className="w-full max-w-xl rounded-3xl border border-border bg-surface p-8 shadow-2xl">
              <div className="flex items-start gap-4">
                <div className="mt-1 rounded-2xl bg-success/10 p-3 text-success">
                  ✓
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Student saved successfully</h3>
                  <p className="mt-2 text-sm text-muted">{successModalMessage}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button type="button" variant="secondary" onClick={() => setSuccessModalMessage(null)}>
                  Close
                </Button>
                <Button type="button" onClick={() => setSuccessModalMessage(null)}>
                  Back to roster
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {emailErrorMessage ? (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">Student registered, but guardian email failed to send.</p>
                <p className="mt-1 text-sm text-amber-900">{emailErrorMessage}</p>
                <p className="mt-1 text-sm text-amber-900">
                  Please verify the guardian's email address and SMTP settings. The student record was still created.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEmailErrorMessage(null)}
                className="rounded-full p-1 text-amber-700 transition hover:bg-amber-100"
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ) : null}
        

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name or admission number..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-1 border-b border-border sm:gap-2">
        {PHASE_ORDER.map((phase) => {
          const count = getPhaseStats(phase);
          const config = PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG];
          const isActive = activePhase === phase;

          return (
            <button
              key={phase}
              onClick={() => handlePhaseChange(phase)}
              className={`px-2 py-2 font-medium text-xs sm:px-4 sm:text-sm transition-colors border-b-2 ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {config.label}
              <span className="ml-1 inline-block rounded px-1.5 py-0.5 text-xs font-semibold bg-background text-foreground sm:ml-2 sm:px-2">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Results Info */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Showing {paginatedPupils.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–
          {Math.min(currentPage * itemsPerPage, filteredPupils.length)} of {filteredPupils.length}{" "}
          student{filteredPupils.length !== 1 ? "s" : ""}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
        <label className="text-sm text-muted">
          Rows per page
          <select
            value={itemsPerPage}
            onChange={handlePageSizeChange}
            className="ml-2 rounded-lg border border-border bg-background px-2 py-1 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Table */}
      {paginatedPupils.length > 0 ? (
        <>
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-hidden rounded-lg border border-border bg-surface">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-background text-muted">
                <tr>
                  <th className="px-4 py-2 font-medium">Photo</th>
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Class</th>
                  <th className="px-4 py-2 font-medium">Admission No.</th>
                  <th className="px-4 py-2 font-medium">Parent Contact</th>
                  <th className="px-4 py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPupils.map((p) => {
                  const guardian = p.guardians[0]?.guardian;
                  const classLabel = p.class
                    ? `${p.class.name}${p.class.arm ? ` ${p.class.arm}` : ""}`
                    : "Unassigned";

                  return (
                    <tr key={p.id} className="border-t border-border hover:bg-background/50 transition-colors">
                      <td className="px-4 py-2">
                        {p.photoUrl ? (
                          <img
                            src={p.photoUrl}
                            alt={`${p.firstName} ${p.lastName}`}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
                            No photo
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2 font-medium text-foreground">
                        {pupilName(p.firstName, p.lastName)}
                      </td>
                      <td className="px-4 py-2">
                        <span className="inline-block rounded px-2 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
                          {classLabel}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-muted">
                        {p.admissionNo ?? "—"}
                      </td>
                      <td className="px-4 py-2 text-muted">
                        {guardian?.phone ?? "—"}
                      </td>
                      <td className="px-4 py-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openProfileModal(p)}
                          className="rounded-full border border-border bg-white px-1.5 py-0.5 text-xs font-semibold text-foreground transition hover:bg-surface"
                        >
                          View
                        </button>
                        <Button type="button" variant="secondary" className="text-xs px-1.5 py-0.5" onClick={() => openStudentModal(p)}>
                          Edit
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile List View */}
          <div className="sm:hidden space-y-2">
            {paginatedPupils.map((p) => {
              const classLabel = p.class
                ? `${p.class.name}${p.class.arm ? ` ${p.class.arm}` : ""}`
                : "Unassigned";

              return (
                <div
                  key={p.id}
                  className="rounded-lg border border-border bg-surface px-3 py-2 hover:bg-background/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {pupilName(p.firstName, p.lastName)}
                      </p>
                      <p className="text-xs text-muted mt-1">{classLabel}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openProfileModal(p)}
                        className="rounded-full border border-border bg-white px-1.5 py-0.5 text-xs font-semibold text-foreground transition hover:bg-surface"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => openStudentModal(p)}
                        className="rounded-full border border-border bg-surface px-1.5 py-0.5 text-xs font-semibold text-foreground transition hover:bg-background"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded px-3 py-1.5 border border-border text-sm font-medium text-foreground hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first page, last page, current page, and ±1 pages around current
                    return (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    );
                  })
                  .map((page, index, arr) => (
                    <div key={page}>
                      {index > 0 && arr[index - 1] !== page - 1 && (
                        <span className="px-2 py-2 text-muted">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`rounded px-2.5 py-1.5 text-sm font-medium ${
                          page === currentPage
                            ? "bg-primary text-white"
                            : "border border-border text-foreground hover:bg-background"
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded px-3 py-1.5 border border-border text-sm font-medium text-foreground hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-lg border border-border bg-surface px-6 py-12 text-center">
          <p className="text-muted">
            {searchQuery
              ? `No students found matching "${searchQuery}"`
              : "No students in this phase"}
          </p>
        </div>
      )}
    </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-6xl overflow-hidden rounded-[28px] border border-border bg-surface shadow-2xl">
            <div className="flex flex-col gap-4 border-b border-border bg-background px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {selectedStudent ? "Edit student" : "Register student"}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {selectedStudent
                    ? "Update student details and guardian contact information."
                    : "Register a new student and link a guardian contact."}
                </p>
              </div>
              <Button type="button" variant="secondary" onClick={closeModal}>
                Close
              </Button>
            </div>

            <form
              action={selectedStudent ? updateStudent : createStudent}
              className="grid gap-6 p-6 xl:grid-cols-[1.1fr_0.9fr]"
              onSubmit={handleStudentSubmit}
            >
              <div className="space-y-6">
                {selectedStudent ? <input type="hidden" name="studentId" value={selectedStudent.id} /> : null}
                <div className="rounded-3xl border border-border bg-surface p-5">
                  <p className="text-sm font-semibold">Student information</p>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-medium">
                      First name *
                      <input
                        name="firstName"
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                        required
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="text-sm font-medium">
                      Middle name
                      <input
                        name="middleName"
                        value={middleName}
                        onChange={(event) => setMiddleName(event.target.value)}
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                      />
                    </label>
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-medium">
                      Last name *
                      <input
                        name="lastName"
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value)}
                        required
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="text-sm font-medium">
                      Gender *
                      <select
                        name="gender"
                        value={gender}
                        onChange={(event) => setGender(event.target.value)}
                        required
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </label>
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-medium">
                      Date of birth
                      <input
                        name="dateOfBirth"
                        type="date"
                        value={dateOfBirth}
                        onChange={(event) => setDateOfBirth(event.target.value)}
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="text-sm font-medium">
                      Class *
                      <select
                        name="classId"
                        value={classId}
                        onChange={(event) => setClassId(event.target.value)}
                        required
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                      >
                        <option value="">Select class</option>
                        {classes.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                            {c.arm ? ` ${c.arm}` : ""}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label className="block text-sm font-medium">
                    Address
                    <textarea
                      name="address"
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      placeholder="Home address or postal address"
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                      rows={3}
                    />
                  </label>
                  <label className="block text-sm font-medium">
                    Admission number
                    <input
                      name="admissionNo"
                      value={admissionNo}
                      readOnly
                      className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm font-medium">
                    Student photo
                    <input
                      name="photo"
                      type="file"
                      accept="image/*"
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                    />
                  </label>
                </div>

                <div className="rounded-3xl border border-border bg-surface p-5">
                  <p className="text-sm font-semibold">Parent / guardian</p>
                  {selectedStudent ? <input type="hidden" name="guardianId" value={selectedStudent.guardians?.[0]?.guardian?.id ?? ""} /> : null}
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-medium">
                      First name
                      <input
                        name="guardianFirst"
                        value={guardianFirst}
                        onChange={(event) => setGuardianFirst(event.target.value)}
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="text-sm font-medium">
                      Last name
                      <input
                        name="guardianLast"
                        value={guardianLast}
                        onChange={(event) => setGuardianLast(event.target.value)}
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                      />
                    </label>
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-medium">
                      Relationship *
                      <select
                        name="guardianRelationship"
                        value={guardianRelationship}
                        onChange={(event) => setGuardianRelationship(event.target.value)}
                        required
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                      >
                        <option value="">Select relationship</option>
                        <option value="Parent">Parent</option>
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Guardian">Guardian</option>
                        <option value="Other">Other</option>
                      </select>
                    </label>
                    <label className="text-sm font-medium">
                      Email
                      <input
                        name="guardianEmail"
                        type="email"
                        value={guardianEmail}
                        onChange={(event) => setGuardianEmail(event.target.value)}
                        className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                      />
                    </label>
                  </div>
                  <label className="block text-sm font-medium">
                    Phone (WhatsApp) *
                    <input
                      name="guardianPhone"
                      type="tel"
                      value={guardianPhone}
                      onChange={(event) => setGuardianPhone(event.target.value)}
                      required
                      placeholder="+234..."
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-6 rounded-3xl border border-border bg-background p-5">
                <div className="rounded-3xl bg-surface p-4">
                  <p className="text-sm font-semibold">Form summary</p>
                  <div className="mt-4 space-y-2 text-sm text-muted">
                    <p>
                      Use this form to {selectedStudent ? "update an existing student" : "create a new student"}. The layout is wider to fit more fields cleanly.
                    </p>
                    <p>Fields are grouped for clarity and mobile-friendly readability.</p>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {selectedStudent ? "Saving student details..." : "Registering student..."}
                    </>
                  ) : selectedStudent ? (
                    "Save student changes"
                  ) : (
                    "Register student"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isProfileOpen && profileStudent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-5xl overflow-hidden rounded-[32px] bg-white shadow-2xl ring-1 ring-slate-200">
            <div className="flex flex-col gap-4 border-b border-border px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted">Student Transcript</p>
                <h2 className="mt-2 text-3xl font-semibold text-foreground">{pupilName(profileStudent.firstName, profileStudent.lastName)}</h2>
                <p className="mt-1 text-sm text-muted">{profileStudent.class?.name}{profileStudent.class?.arm ? ` ${profileStudent.class.arm}` : ""}</p>
              </div>
              <button
                type="button"
                onClick={closeProfileModal}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition hover:bg-surface"
                aria-label="Close student details"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-8">
              <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,_1fr)]">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl bg-slate-100">
                      {profileStudent.photoUrl ? (
                        <img
                          src={profileStudent.photoUrl}
                          alt={pupilName(profileStudent.firstName, profileStudent.lastName)}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl font-semibold text-primary">
                          {pupilName(profileStudent.firstName, profileStudent.lastName)
                            .split(" ")
                            .map((part) => part[0])
                            .join("")}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.24em] text-muted">Admission No.</p>
                      <p className="mt-2 text-xl font-semibold text-foreground">{profileStudent.admissionNo ?? profileStudent.id}</p>
                      <p className="mt-3 text-sm text-muted">Enrolled {formatDate(profileStudent.createdAt)}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 text-sm">
                    <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 border-b border-border py-3">
                      <span className="text-xs uppercase tracking-[0.18em] text-muted">Class</span>
                      <span className="font-semibold text-foreground">{profileStudent.class?.name ?? "—"}{profileStudent.class?.arm ? ` ${profileStudent.class.arm}` : ""}</span>
                    </div>
                    <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 border-b border-border py-3">
                      <span className="text-xs uppercase tracking-[0.18em] text-muted">Phase</span>
                      <span className="font-semibold text-foreground">{profileStudent.class?.phase ?? "—"}</span>
                    </div>
                    <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 border-b border-border py-3">
                      <span className="text-xs uppercase tracking-[0.18em] text-muted">Date of birth</span>
                      <span className="font-semibold text-foreground">{formatDate(profileStudent.dateOfBirth)}</span>
                    </div>
                    <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 border-b border-border py-3">
                      <span className="text-xs uppercase tracking-[0.18em] text-muted">Age</span>
                      <span className="font-semibold text-foreground">{formatAge(profileStudent.dateOfBirth)}</span>
                    </div>
                    <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 py-3">
                      <span className="text-xs uppercase tracking-[0.18em] text-muted">Gender</span>
                      <span className="font-semibold text-foreground">{profileStudent.gender ?? "—"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Student details</h3>
                    <div className="mt-4 grid gap-2 text-sm">
                      <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 border-b border-border py-3">
                        <span className="text-xs uppercase tracking-[0.18em] text-muted">First name</span>
                        <span className="font-semibold text-foreground">{profileStudent.firstName ?? "—"}</span>
                      </div>
                      <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 border-b border-border py-3">
                        <span className="text-xs uppercase tracking-[0.18em] text-muted">Middle name</span>
                        <span className="font-semibold text-foreground">{profileStudent.middleName || "—"}</span>
                      </div>
                      <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 border-b border-border py-3">
                        <span className="text-xs uppercase tracking-[0.18em] text-muted">Last name</span>
                        <span className="font-semibold text-foreground">{profileStudent.lastName ?? "—"}</span>
                      </div>
                      <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-start gap-4 py-3">
                        <span className="text-xs uppercase tracking-[0.18em] text-muted">Address</span>
                        <span className="font-semibold text-foreground break-words">{profileStudent.address || "—"}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-foreground">Parent / guardian</h3>
                    <div className="mt-4 grid gap-2 text-sm">
                      <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 border-b border-border py-3">
                        <span className="text-xs uppercase tracking-[0.18em] text-muted">Name</span>
                        <span className="font-semibold text-foreground">{profileGuardian ? `${profileGuardian.firstName ?? ""} ${profileGuardian.lastName ?? ""}`.trim() || "—" : "—"}</span>
                      </div>
                      <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 border-b border-border py-3">
                        <span className="text-xs uppercase tracking-[0.18em] text-muted">Relationship</span>
                        <span className="font-semibold text-foreground">{profileStudent.guardians?.[0]?.relation ?? "—"}</span>
                      </div>
                      <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 border-b border-border py-3">
                        <span className="text-xs uppercase tracking-[0.18em] text-muted">Phone</span>
                        <span className="font-semibold text-foreground">{profileGuardian?.phone ?? profileStudent.guardians?.[0]?.phone ?? "—"}</span>
                      </div>
                      <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 py-3">
                        <span className="text-xs uppercase tracking-[0.18em] text-muted">Email</span>
                        <span className="font-semibold text-foreground">{profileGuardian?.email ?? profileStudent.guardians?.[0]?.email ?? "—"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={closeProfileModal}
                      className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <UserGuide guide={HELP_GUIDE} />
    </>
  );
}
