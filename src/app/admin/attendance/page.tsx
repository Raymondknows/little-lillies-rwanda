import Link from "next/link";
import { saveAttendance } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { pupilName } from "@/lib/format";
import { getCurrentSchoolId } from "@/lib/school";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; date?: string; success?: string }>;
}) {
  const schoolId = await getCurrentSchoolId();
  const { classId, date, success } = await searchParams;
  const showSuccess = success === "1";
  const today = date ?? new Date().toISOString().slice(0, 10);

  const classes = await prisma.class.findMany({
    where: { schoolId },
    orderBy: { name: "asc" },
  });

  const selectedClass = classId ?? classes[0]?.id;
  const pupils = selectedClass
    ? await prisma.pupil.findMany({
        where: { schoolId, classId: selectedClass, isActive: true },
        orderBy: { lastName: "asc" },
      })
    : [];

  const selectedDate = new Date(today);
  const existing = selectedClass
    ? await prisma.attendanceRecord.findMany({
        where: {
          schoolId,
          classId: selectedClass,
          date: selectedDate,
        },
      })
    : [];

  const statusMap = new Map(existing.map((e) => [e.pupilId, e.status]));

  return (
    <div>
      <h1 className="text-2xl font-bold">Attendance</h1>
      <p className="mt-1 text-muted">Mark today&apos;s register — parents can be alerted later.</p>

      {showSuccess ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4 py-8">
          <div className="w-full max-w-xl rounded-3xl border border-border bg-surface p-8 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="mt-1 rounded-2xl bg-success/10 p-3 text-success">✓</div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Attendance saved successfully</h3>
                <p className="mt-2 text-sm text-muted">The register for the selected class and date has been updated.</p>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Link
                href={`/admin/attendance?classId=${classId ?? ""}&date=${today}`}
                className="w-full rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand/90 sm:w-auto"
              >
                Close
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <form method="get" className="mt-6 flex flex-wrap gap-4">
        <label className="text-sm">
          Class
          <select
            name="classId"
            defaultValue={selectedClass}
            className="ml-2 rounded-lg border border-border px-3 py-2 text-sm"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.arm ? ` ${c.arm}` : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Date
          <input
            type="date"
            name="date"
            defaultValue={today}
            className="ml-2 rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
        <Button type="submit" variant="secondary">
          Load class
        </Button>
        {selectedClass && (
          <Link
            href={`/admin/attendance/summary?classId=${selectedClass}&date=${today}`}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90 transition-colors"
          >
            View Summary
          </Link>
        )}
      </form>

      {selectedClass && pupils.length > 0 && (
        <form action={saveAttendance} className="mt-8 space-y-2">
          <input type="hidden" name="classId" value={selectedClass} />
          <input type="hidden" name="date" value={today} />
          {pupils.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3"
            >
              <span className="font-medium">
                {pupilName(p.firstName, p.lastName)}
              </span>
              <select
                name={`status_${p.id}`}
                defaultValue={statusMap.get(p.id) ?? "PRESENT"}
                className="rounded-lg border border-border px-2 py-1 text-sm"
              >
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="LATE">Late</option>
              </select>
            </div>
          ))}
          <Button type="submit" className="mt-4 w-full sm:w-auto">
            Save attendance
          </Button>
        </form>
      )}
    </div>
  );
}