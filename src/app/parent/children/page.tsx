import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { getParentSession } from "@/lib/auth";
import { pupilName } from "@/lib/format";

export const metadata: Metadata = {
  title: "Child profiles | SchoolBase",
  description: "View your child or children’s profile details, including photo, age, class, and contact information.",
};

const formatDate = (dateString: string) =>
  new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));

const calculateAge = (dateString?: string | null) => {
  if (!dateString) return "—";
  const birth = new Date(dateString);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  return `${age} year${age === 1 ? "" : "s"}`;
};

export default async function ParentChildrenPage() {
  const session = await getParentSession();
  if (!session) redirect("/parent/login");

  const guardian = await prisma.guardian.findUnique({
    where: { id: session.guardianId },
    include: {
      pupils: {
        include: {
          pupil: {
            include: {
              class: true,
            },
          },
        },
      },
    },
  });

  if (!guardian) redirect("/parent/login");

  const pupils = guardian.pupils.map((item) => item.pupil);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Student information</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Review each child’s profile details, including full name, gender, birthdate, class, address, admission number, and photo.
          </p>
        </div>
        <Button href="/parent" variant="secondary" className="w-full sm:w-auto">
          Back to dashboard
        </Button>
      </div>

      {pupils.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-5 text-sm text-muted">
          No linked children were found for this account.
        </div>
      ) : (
        <div className="space-y-4">
          {pupils.map((pupil) => (
            <section key={pupil.id} className="rounded-2xl border border-border bg-white px-4 py-4 sm:px-5 sm:py-5">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
                <div className="flex-shrink-0">
                  <div className="h-24 w-24 overflow-hidden rounded-2xl bg-slate-100">
                    {pupil.photoUrl ? (
                      <img
                        src={pupil.photoUrl}
                        alt={pupilName(pupil.firstName, pupil.lastName)}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted">No file chosen</div>
                    )}
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted">Student photo</p>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-foreground truncate">{pupilName(pupil.firstName, pupil.lastName)}</p>
                      <p className="text-sm text-muted">{pupil.class?.name || "Unassigned class"}</p>
                    </div>
                    <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                      {calculateAge(pupil.dateOfBirth?.toISOString())}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1 text-sm text-foreground">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted">First name</p>
                      <p className="font-medium">{pupil.firstName}</p>
                    </div>
                    <div className="space-y-1 text-sm text-foreground">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted">Middle name</p>
                      <p className="font-medium">{pupil.middleName || "Not set"}</p>
                    </div>
                    <div className="space-y-1 text-sm text-foreground">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted">Last name</p>
                      <p className="font-medium">{pupil.lastName}</p>
                    </div>
                    <div className="space-y-1 text-sm text-foreground">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted">Gender</p>
                      <p className="font-medium">{pupil.gender || "Not set"}</p>
                    </div>
                    <div className="space-y-1 text-sm text-foreground">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted">Date of birth</p>
                      <p className="font-medium">{pupil.dateOfBirth ? formatDate(pupil.dateOfBirth.toISOString()) : "Not set"}</p>
                    </div>
                    <div className="space-y-1 text-sm text-foreground">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted">Admission number</p>
                      <p className="font-medium">{pupil.admissionNo || "Not set"}</p>
                    </div>
                    <div className="space-y-1 text-sm text-foreground col-span-full">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted">Address</p>
                      <p>{pupil.address || "Not set"}</p>
                    </div>
                    <div className="space-y-1 text-sm text-foreground">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted">Status</p>
                      <p>{pupil.isActive ? "Active" : "Inactive"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
