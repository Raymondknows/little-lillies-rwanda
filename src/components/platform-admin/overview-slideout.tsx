"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, PieChart } from "lucide-react";

function formatDate(date?: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function PlatformOverviewSlideOut({ countryBreakdown, recentSchools, compact = false }: any) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3">
        <Button
          variant={compact ? "outline" : "secondary"}
          onClick={() => setOpen(true)}
          className={compact ? "gap-2 px-2 py-2 text-sm" : "gap-2"}
        >
          <PieChart className="h-4 w-4" />
          {compact ? "Insights" : "Open insights"}
        </Button>
        {!compact ? <p className="text-sm text-muted">Country analytics, recent signups and onboarding.</p> : null}
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 px-4 py-6 sm:px-6">
          <div className="absolute inset-0" onClick={() => setOpen(false)} />
          <aside className="relative mx-auto flex h-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <div>
                <p className="text-sm font-semibold text-foreground">Platform insights</p>
                <p className="text-sm text-muted">Country analytics, recent signups and onboarding progress.</p>
              </div>
              <Button type="button" variant="ghost" className="h-10 w-10 p-0" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="overflow-y-auto p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Country analytics</h3>
                <p className="text-sm text-muted">Platform adoption and school distribution across core markets.</p>
                <div className="mt-4 overflow-hidden rounded-xl border border-border bg-background">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-border bg-surface text-muted">
                      <tr>
                        <th className="px-4 py-3">Country</th>
                        <th className="px-4 py-3">Schools</th>
                      </tr>
                    </thead>
                    <tbody>
                      {countryBreakdown.map((c: any) => (
                        <tr key={c.country} className="border-t border-border hover:bg-surface/70 transition-colors">
                          <td className="px-4 py-3 font-medium text-foreground">{c.country}</td>
                          <td className="px-4 py-3">{c._count.id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground">Recent signups</h3>
                <div className="mt-4 overflow-hidden rounded-xl border border-border bg-background">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-border bg-surface text-muted">
                      <tr>
                        <th className="px-4 py-3">School</th>
                        <th className="px-4 py-3">Country / Plan</th>
                        <th className="px-4 py-3">Registered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentSchools.map((s: any) => (
                        <tr key={s.id} className="border-t border-border hover:bg-surface/70 transition-colors">
                          <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                          <td className="px-4 py-3 text-muted">{s.country} · {(s as any).plan}</td>
                          <td className="px-4 py-3 text-muted">{formatDate(s.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground">Onboarding progress</h3>
                <p className="text-sm text-muted">Most active schools and latest onboarding signals.</p>
                <div className="mt-4 overflow-hidden rounded-xl border border-border bg-background">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-border bg-surface text-muted">
                      <tr>
                        <th className="px-4 py-3">School</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Plan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentSchools.map((s: any) => (
                        <tr key={s.id} className="border-t border-border hover:bg-surface/70 transition-colors">
                          <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                          <td className="px-4 py-3 text-muted">{(s as any).status} · Trial ends {(s as any).trialEndsAt ? formatDate((s as any).trialEndsAt) : "n/a"}</td>
                          <td className="px-4 py-3"><span className="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold bg-sky-100 text-sky-700">{(s as any).plan}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}

export default PlatformOverviewSlideOut;
