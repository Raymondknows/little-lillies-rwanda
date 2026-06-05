"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { pupilName } from "@/lib/format";
import { resolvePhotoSrc } from "@/lib/photo";

export default function StudentProfileView({ pupil, classes }: { pupil: any; classes: any[] }) {
  const router = useRouter();
  const profileGuardian = pupil.guardians?.[0]?.guardian;

  const formatDate = (date: any) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAge = (dateOfBirth: any) => {
    if (!dateOfBirth) return "—";
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  };

  return (
    <div className="mx-auto max-w-5xl px-6 pb-12 pt-4">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/admin/students" className="text-sm text-brand hover:underline">
            ← Back to students
          </Link>
          <p className="text-xs uppercase tracking-[0.24em] text-muted mt-4">Student Profile</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">
            {pupilName(pupil.firstName, pupil.lastName)}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {pupil.class?.name}{pupil.class?.arm ? ` ${pupil.class.arm}` : ""}
          </p>
        </div>
        <Button onClick={() => router.push(`/admin/students/${pupil.id}/edit`)}>
          Edit Student
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,_1fr)]">
        <div className="space-y-6">
          <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-3xl bg-slate-100">
            {pupil.photoUrl ? (
              <img
                src={resolvePhotoSrc(pupil.photoUrl, pupil.id) ?? undefined}
                alt={pupilName(pupil.firstName, pupil.lastName)}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-4xl font-semibold text-primary">
                {pupilName(pupil.firstName, pupil.lastName)
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </span>
            )}
          </div>

          <div className="grid gap-3 text-sm">
            <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 border-b border-border py-3">
              <span className="text-xs uppercase tracking-[0.18em] text-muted">Admission No.</span>
              <span className="font-semibold text-foreground">{pupil.admissionNo ?? pupil.id}</span>
            </div>
            <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 border-b border-border py-3">
              <span className="text-xs uppercase tracking-[0.18em] text-muted">Class</span>
              <span className="font-semibold text-foreground">
                {pupil.class?.name ?? "—"}
                {pupil.class?.arm ? ` ${pupil.class.arm}` : ""}
              </span>
            </div>
            <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 border-b border-border py-3">
              <span className="text-xs uppercase tracking-[0.18em] text-muted">Phase</span>
              <span className="font-semibold text-foreground">{pupil.class?.phase ?? "—"}</span>
            </div>
            <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 border-b border-border py-3">
              <span className="text-xs uppercase tracking-[0.18em] text-muted">Status</span>
              <span className="font-semibold text-foreground">{pupil.status ?? "ACTIVE"}</span>
            </div>
            <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 border-b border-border py-3">
              <span className="text-xs uppercase tracking-[0.18em] text-muted">Date of birth</span>
              <span className="font-semibold text-foreground">{formatDate(pupil.dateOfBirth)}</span>
            </div>
            <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 py-3">
              <span className="text-xs uppercase tracking-[0.18em] text-muted">Age</span>
              <span className="font-semibold text-foreground">{formatAge(pupil.dateOfBirth)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-base font-semibold text-foreground">Student details</h3>
            <div className="mt-4 grid gap-2 text-sm">
              <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 border-b border-border py-3">
                <span className="text-xs uppercase tracking-[0.18em] text-muted">First name</span>
                <span className="font-semibold text-foreground">{pupil.firstName ?? "—"}</span>
              </div>
              <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 border-b border-border py-3">
                <span className="text-xs uppercase tracking-[0.18em] text-muted">Middle name</span>
                <span className="font-semibold text-foreground">{pupil.middleName || "—"}</span>
              </div>
              <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 border-b border-border py-3">
                <span className="text-xs uppercase tracking-[0.18em] text-muted">Last name</span>
                <span className="font-semibold text-foreground">{pupil.lastName ?? "—"}</span>
              </div>
              <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 border-b border-border py-3">
                <span className="text-xs uppercase tracking-[0.18em] text-muted">Gender</span>
                <span className="font-semibold text-foreground">{pupil.gender ?? "—"}</span>
              </div>
              <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-start gap-4 py-3">
                <span className="text-xs uppercase tracking-[0.18em] text-muted">Address</span>
                <span className="font-semibold text-foreground break-words">{pupil.address || "—"}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground">Contact information</h3>
            <div className="mt-4 grid gap-2 text-sm">
              <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 border-b border-border py-3">
                <span className="text-xs uppercase tracking-[0.18em] text-muted">Email</span>
                <span className="font-semibold text-foreground break-words">{pupil.studentEmail || "—"}</span>
              </div>
              <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 py-3">
                <span className="text-xs uppercase tracking-[0.18em] text-muted">Phone</span>
                <span className="font-semibold text-foreground">{pupil.studentPhone || "—"}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground">Parent / guardian</h3>
            <div className="mt-4 grid gap-2 text-sm">
              <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 border-b border-border py-3">
                <span className="text-xs uppercase tracking-[0.18em] text-muted">Name</span>
                <span className="font-semibold text-foreground">
                  {profileGuardian
                    ? `${profileGuardian.firstName ?? ""} ${profileGuardian.lastName ?? ""}`.trim() || "—"
                    : "—"}
                </span>
              </div>
              <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 border-b border-border py-3">
                <span className="text-xs uppercase tracking-[0.18em] text-muted">Relationship</span>
                <span className="font-semibold text-foreground">{pupil.guardians?.[0]?.relation ?? "—"}</span>
              </div>
              <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 border-b border-border py-3">
                <span className="text-xs uppercase tracking-[0.18em] text-muted">Phone</span>
                <span className="font-semibold text-foreground">
                  {profileGuardian?.phone ?? pupil.guardians?.[0]?.phone ?? "—"}
                </span>
              </div>
              <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 py-3">
                <span className="text-xs uppercase tracking-[0.18em] text-muted">Email</span>
                <span className="font-semibold text-foreground break-words">
                  {profileGuardian?.email ?? pupil.guardians?.[0]?.email ?? "—"}
                </span>
              </div>
            </div>
          </div>

          {(pupil.bloodGroup || pupil.genotype || pupil.medicalNotes) && (
            <div>
              <h3 className="text-base font-semibold text-foreground">Medical information</h3>
              <div className="mt-4 grid gap-2 text-sm">
                {pupil.bloodGroup && (
                  <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 border-b border-border py-3">
                    <span className="text-xs uppercase tracking-[0.18em] text-muted">Blood group</span>
                    <span className="font-semibold text-foreground">{pupil.bloodGroup}</span>
                  </div>
                )}
                {pupil.genotype && (
                  <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-center gap-4 border-b border-border py-3">
                    <span className="text-xs uppercase tracking-[0.18em] text-muted">Genotype</span>
                    <span className="font-semibold text-foreground">{pupil.genotype}</span>
                  </div>
                )}
                {pupil.medicalNotes && (
                  <div className="grid grid-cols-[160px_minmax(0,_1fr)] items-start gap-4 py-3">
                    <span className="text-xs uppercase tracking-[0.18em] text-muted">Notes</span>
                    <span className="font-semibold text-foreground break-words">{pupil.medicalNotes}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
