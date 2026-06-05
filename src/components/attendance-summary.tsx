import { ReactNode } from "react";

type AttendanceTotals = {
  expected: number;
  recorded: number;
  present: number;
  absent: number;
  late: number;
};

type WeeklyTotals = {
  present: number;
  absent: number;
  late: number;
  total: number;
  startDate: string;
  endDate: string;
};

type Props = {
  className?: string;
  selectedDate: string;
  dailyTotals: AttendanceTotals;
  weeklyTotals?: WeeklyTotals;
  subtitle?: string;
};

export default function AttendanceSummary({
  className = "",
  selectedDate,
  dailyTotals,
  weeklyTotals,
  subtitle,
}: Props) {
  const completion = dailyTotals.expected > 0
    ? Math.round((dailyTotals.recorded / dailyTotals.expected) * 100)
    : 0;

  return (
    <section className={`rounded-3xl border border-border bg-surface p-6 shadow-sm ${className}`}>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Attendance summary</h2>
          <p className="mt-2 text-sm text-muted">
            {subtitle ?? "Daily register totals with weekly attendance collated for the selected class."}
          </p>
        </div>
        <div className="text-sm text-muted">
          <div>{selectedDate}</div>
          {weeklyTotals ? <div className="mt-1">Week: {weeklyTotals.startDate} – {weeklyTotals.endDate}</div> : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-background">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-surface text-muted">
            <tr>
              <th className="px-6 py-4 font-semibold">Metric</th>
              <th className="px-6 py-4 font-semibold">Value</th>
              <th className="px-6 py-4 font-semibold">Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-border">
              <td className="px-6 py-4 font-medium text-foreground">Expected pupils</td>
              <td className="px-6 py-4">{dailyTotals.expected}</td>
              <td className="px-6 py-4" />
            </tr>
            <tr className="border-t border-border bg-surface/80">
              <td className="px-6 py-4 font-medium text-foreground">Recorded</td>
              <td className="px-6 py-4">{dailyTotals.recorded}</td>
              <td className="px-6 py-4">{completion}% complete</td>
            </tr>
            <tr className="border-t border-border">
              <td className="px-6 py-4 font-medium text-foreground">Present</td>
              <td className="px-6 py-4">{dailyTotals.present}</td>
              <td className="px-6 py-4" />
            </tr>
            <tr className="border-t border-border bg-surface/80">
              <td className="px-6 py-4 font-medium text-foreground">Absent</td>
              <td className="px-6 py-4">{dailyTotals.absent}</td>
              <td className="px-6 py-4" />
            </tr>
            <tr className="border-t border-border">
              <td className="px-6 py-4 font-medium text-foreground">Late</td>
              <td className="px-6 py-4">{dailyTotals.late}</td>
              <td className="px-6 py-4" />
            </tr>
            <tr className="border-t border-border bg-surface/80">
              <td className="px-6 py-4 font-medium text-foreground">Weekly records</td>
              <td className="px-6 py-4">{weeklyTotals?.total ?? 0}</td>
              <td className="px-6 py-4">Last 7 days</td>
            </tr>
            <tr className="border-t border-border">
              <td className="px-6 py-4 font-medium text-foreground">Weekly present</td>
              <td className="px-6 py-4">{weeklyTotals ? weeklyTotals.present : 0}</td>
              <td className="px-6 py-4">Collated this week</td>
            </tr>
            <tr className="border-t border-border bg-surface/80">
              <td className="px-6 py-4 font-medium text-foreground">Weekly absent</td>
              <td className="px-6 py-4">{weeklyTotals ? weeklyTotals.absent : 0}</td>
              <td className="px-6 py-4" />
            </tr>
            <tr className="border-t border-border">
              <td className="px-6 py-4 font-medium text-foreground">Weekly late</td>
              <td className="px-6 py-4">{weeklyTotals ? weeklyTotals.late : 0}</td>
              <td className="px-6 py-4" />
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
