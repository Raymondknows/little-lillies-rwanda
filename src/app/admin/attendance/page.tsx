"use client";

export default function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; date?: string; success?: string }>;
}) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Attendance Management</h1>
      <div className="text-muted">Attendance management coming soon</div>
    </div>
  );
}