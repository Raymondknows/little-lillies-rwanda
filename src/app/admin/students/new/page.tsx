import Link from "next/link";
import { createStudent } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { getCurrentSchoolId } from "@/lib/school";

export default async function NewStudentPage() {
  const schoolId = await getCurrentSchoolId();
  const classes = await prisma.class.findMany({
    where: { schoolId },
    orderBy: { name: "asc" },
  });
  const school = await prisma.school.findUnique({ where: { id: schoolId } });

  // Derive initials (prefer explicit `initials`), fallback to name-based initials
  let prefix = "SCH";
  const rawInitials = (school as any)?.initials;
  if (rawInitials && typeof rawInitials === "string" && rawInitials.trim()) {
    prefix = rawInitials.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  } else if (school?.name) {
    const words = school.name.split(/[^A-Za-z0-9]+/).filter(Boolean);
    let letters = words.slice(0, 3).map((w: string) => w[0]).join("").toUpperCase();
    if (letters.length < 3 && words[0]) {
      const remaining = words[0].slice(1).replace(/[^A-Za-z0-9]/g, "");
      for (const ch of remaining) {
        letters += ch.toUpperCase();
        if (letters.length >= 3) break;
      }
    }
    prefix = (letters || "SCH").replace(/[^A-Z0-9]/g, "").slice(0, 6);
  }

  const year = new Date().getFullYear();
  const existingCount = await prisma.pupil.count({
    where: { schoolId, admissionNo: { startsWith: `${prefix}-${year}-` } },
  });
  const nextSeq = String(existingCount + 1).padStart(4, "0");
  const nextAdmissionNo = `${prefix}-${year}-${nextSeq}`;

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/admin/students" className="text-sm text-brand hover:underline">
        ← Students
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Add student</h1>
      <p className="mt-1 text-muted">Register a pupil and link a parent contact.</p>

      <form
        action={createStudent}
        className="mt-8 space-y-4 rounded-xl border border-border bg-surface p-6"
      >
        <p className="text-sm font-semibold">Student information</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">
            First name *
            <input name="firstName" required className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-medium">
            Middle name
            <input name="middleName" className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Last name *
            <input name="lastName" required className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-medium">
            Gender *
            <select name="gender" required className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm">
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </label>
        </div>
        <label className="block text-sm font-medium">
          Date of birth
          <input name="dateOfBirth" type="date" className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm font-medium">
          Class *
          <select name="classId" required className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm">
            <option value="">Select class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.arm ? ` ${c.arm}` : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Admission number
          <input name="admissionNo" value={nextAdmissionNo} readOnly className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm" />
          <p className="text-xs text-muted mt-1">Automatically assigned when saving. Non-editable.</p>
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
        <hr className="border-border" />
        <p className="text-sm font-semibold">Parent / guardian</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">
            First name
            <input name="guardianFirst" className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-medium">
            Last name
            <input name="guardianLast" className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Relationship *
            <select name="guardianRelationship" required className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm">
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
            <input name="guardianEmail" type="email" className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" />
          </label>
        </div>
        <label className="block text-sm text-muted">
          The parent/guardian will receive a registration email if an email address is provided.
        </label>
        <label className="block text-sm font-medium">
          Phone (WhatsApp) *
          <input name="guardianPhone" type="tel" required placeholder="+234..." className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" />
        </label>
        <Button type="submit" className="w-full">
          Save pupil record
        </Button>
      </form>
    </div>
  );
}
