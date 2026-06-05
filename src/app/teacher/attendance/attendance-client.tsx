"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { pupilName } from "@/lib/format";
import { saveAttendance } from "@/app/admin/actions";

export default function TeacherAttendancePageClient({
  classes,
  selectedClass,
  pupils,
  today,
  existingRecords,
  success,
}: {
  classes: any[];
  selectedClass: string | undefined;
  pupils: any[];
  today: string;
  existingRecords: { pupilId: string; status: string }[];
  success?: boolean;
}) {
  const [showSuccess, setShowSuccess] = useState(success ?? false);
  const [classId, setClassId] = useState(selectedClass ?? classes[0]?.id);
  const [date, setDate] = useState(today);
  const statusMap = useMemo(
    () => new Map(existingRecords.map((record) => [record.pupilId, record.status])),
    [existingRecords],
  );

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
                href={`/teacher/attendance?classId=${classId ?? ""}&date=${date}`}
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
            value={classId}
            onChange={(event) => setClassId(event.target.value)}
            className="ml-2 rounded-lg border border-border px-3 py-2 text-sm"
          >
            {classes.map((teacherClass) => (
              <option key={teacherClass.id} value={teacherClass.id}>
                {teacherClass.name}{teacherClass.arm ? ` ${teacherClass.arm}` : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Date
          <input
            type="date"
            name="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="ml-2 rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
        <Button type="submit" className="whitespace-nowrap bg-brand text-white hover:bg-brand-hover">
          Load class
        </Button>
        <Link
          href={`/teacher/attendance/summary?classId=${classId}&date=${date}`}
          className="inline-flex rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-hover"
        >
          View Summary
        </Link>
      </form>

      {pupils.length > 0 ? (
        <form action={saveAttendance} className="mt-8 space-y-2">
          <input type="hidden" name="classId" value={classId} />
          <input type="hidden" name="date" value={date} />
          {pupils.map((pupil) => (
            <div
              key={pupil.id}
              className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3"
            >
              <span className="font-medium">
                {pupilName(pupil.firstName, pupil.lastName)}
              </span>
              <select
                name={`status_${pupil.id}`}
                defaultValue={statusMap.get(pupil.id) ?? "PRESENT"}
                className="rounded-lg border border-border px-2 py-1 text-sm whitespace-nowrap"
              >
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="LATE">Late</option>
              </select>
            </div>
          ))}
          <Button type="submit" className="mt-4 w-full bg-brand text-white hover:bg-brand-hover sm:w-auto">
            Save attendance
          </Button>
        </form>
      ) : (
        <div className="rounded-3xl border border-border bg-surface p-6 text-center text-sm text-muted">
          No students were found for the selected class.
        </div>
      )}
    </div>
  );
}
