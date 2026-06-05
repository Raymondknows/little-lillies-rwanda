"use client";

import { type FormEvent, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateStudent } from "@/app/admin/actions";
import { pupilName } from "@/lib/format";

type GuardianLink = {
  guardian?: {
    id?: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  relation?: string | null;
};

type Student = {
  id: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  gender?: string | null;
  dateOfBirth?: string | Date | null;
  classId?: string | null;
  admissionNo?: string | null;
  photoUrl?: string | null;
  guardians?: GuardianLink[];
};

type ClassOption = {
  id: string;
  name: string;
  arm?: string | null;
};

export function EditStudentForm({ pupil, classes }: { pupil: Student; classes: ClassOption[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const guardianLink = pupil.guardians?.[0];
  const guardian = guardianLink?.guardian;
  const dateOfBirthValue =
    typeof pupil.dateOfBirth === "string"
      ? pupil.dateOfBirth
      : pupil.dateOfBirth instanceof Date
      ? pupil.dateOfBirth.toISOString().slice(0, 10)
      : "";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (isSubmitting) {
      event.preventDefault();
      return;
    }

    startTransition(() => {
      setIsSubmitting(true);
    });
  };

  return (
    <form
      action={updateStudent}
      className="mt-8 space-y-4 rounded-xl border border-border bg-surface p-6"
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="studentId" value={pupil.id} />
      <input type="hidden" name="guardianId" value={guardian?.id ?? ""} />
      <p className="text-sm font-semibold">Student information</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">
          First name *
          <input
            name="firstName"
            required
            defaultValue={pupil.firstName}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm font-medium">
          Middle name
          <input
            name="middleName"
            defaultValue={pupil.middleName ?? ""}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Last name *
          <input
            name="lastName"
            required
            defaultValue={pupil.lastName}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm font-medium">
          Gender *
          <select
            name="gender"
            required
            defaultValue={pupil.gender ?? ""}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </label>
      </div>
      <label className="block text-sm font-medium">
        Date of birth
        <input
          name="dateOfBirth"
          type="date"
          defaultValue={dateOfBirthValue}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-sm font-medium">
        Class *
        <select
          name="classId"
          required
          defaultValue={pupil.classId ?? ""}
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
      <label className="block text-sm font-medium">
        Admission number
        <input
          name="admissionNo"
          defaultValue={pupil.admissionNo ?? ""}
          placeholder="GFA-2100"
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
        />
      </label>

      <hr className="border-border" />
      <p className="text-sm font-semibold">Parent / guardian</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">
          First name
          <input
            name="guardianFirst"
            defaultValue={guardian?.firstName ?? ""}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm font-medium">
          Last name
          <input
            name="guardianLast"
            defaultValue={guardian?.lastName ?? ""}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Relationship *
          <select
            name="guardianRelationship"
            required
            defaultValue={guardianLink?.relation ?? "Guardian"}
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
            defaultValue={guardian?.email ?? ""}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
      </div>
      <label className="block text-sm font-medium">
        Phone (WhatsApp) *
        <input
          name="guardianPhone"
          type="tel"
          required
          defaultValue={guardian?.phone ?? ""}
          placeholder="+234..."
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
        />
      </label>
      {pupil.photoUrl ? (
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-sm text-muted">Current photo</p>
          <img
            src={pupil.photoUrl}
            alt={pupilName(pupil.firstName, pupil.lastName)}
            className="mt-3 h-24 w-24 rounded-full object-cover"
          />
        </div>
      ) : null}

      <label className="block text-sm font-medium">
        Replace student photo
        <input
          name="photo"
          type="file"
          accept="image/*"
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
        />
      </label>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving student details...
          </>
        ) : (
          "Save student details"
        )}
      </Button>
    </form>
  );
}
