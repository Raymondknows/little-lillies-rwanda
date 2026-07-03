"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CreditCard, AlertCircle, Eye, Filter } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { getBackendUrl } from "@/lib/backend-url";
import ParentPageShell from "@/components/parent-page-shell";

interface Invoice {
  id: string;
  childId: string;
  childName: string;
  amountDue: number;
  status: "SENT" | "PART_PAID" | "PAID" | "OVERDUE" | "DRAFT";
  dueDate: string;
  description?: string;
}

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filter, setFilter] = useState<"all" | "outstanding" | "paid">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    try {
      const backendUrl = getBackendUrl();
      
      const res = await fetch(`${backendUrl}/api/parent/invoices`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error('Failed to load invoices');
      }

      const data = await res.json();
      console.log('Invoices data:', data); // Debug
      setInvoices(data.invoices || []);
      setLoading(false);
    } catch (err) {
      console.error("Error loading invoices:", err);
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter invoices
  const filtered = invoices.filter((invoice) => {
    const searchLower = search.toLowerCase();
    const matchesSearch = [invoice.childName, invoice.description, invoice.id]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(searchLower);
    
    if (filter === "paid") return invoice.status === "PAID" && matchesSearch;
    if (filter === "outstanding") return ["SENT", "PART_PAID", "OVERDUE"].includes(invoice.status) && matchesSearch;
    return matchesSearch;
  });

  // Calculate totals
  const totalOutstanding = invoices
    .filter(inv => ["SENT", "PART_PAID", "OVERDUE"].includes(inv.status))
    .reduce((sum, inv) => sum + (inv.amountDue || 0), 0);
  const totalPaid = invoices
    .filter(inv => inv.status === "PAID")
    .reduce((sum, inv) => sum + (inv.amountDue || 0), 0);

  if (loading) {
    return (
      <ParentPageShell onRefresh={loadData}>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-10 w-48 bg-slate-200 rounded-lg animate-pulse"></div>
            <div className="h-5 w-64 bg-slate-100 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-3xl bg-surface p-5 border border-border space-y-2">
                <div className="h-4 w-16 bg-slate-100 rounded animate-pulse"></div>
                <div className="h-6 w-20 bg-slate-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
          {[1, 2].map((i) => (
            <div key={i} className="rounded-3xl border border-border bg-surface p-4 space-y-3 animate-pulse">
              <div className="h-5 w-32 bg-slate-200 rounded"></div>
              <div className="h-4 w-48 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      </ParentPageShell>
    );
  }

  return (
    <ParentPageShell onRefresh={loadData}>
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Billing & Invoices</h1>
        <p className="mt-2 text-muted">Manage school fees and payment history</p>
      </div>

      {error && (
        <div className="rounded-xl border border-error bg-error/10 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-error">Error Loading Invoices</h3>
            <p className="text-sm text-error/80 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Quick Totals */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-3xl border border-border bg-surface p-4 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted">Outstanding</p>
          <p className="mt-3 text-xl font-semibold text-error">{formatMoney(totalOutstanding)}</p>
          <p className="text-xs text-muted mt-1">{invoices.filter(inv => ["SENT", "PART_PAID", "OVERDUE"].includes(inv.status)).length} pending</p>
        </div>
        <div className="rounded-3xl border border-border bg-surface p-4 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted">Paid</p>
          <p className="mt-3 text-xl font-semibold text-success">{formatMoney(totalPaid)}</p>
          <p className="text-xs text-muted mt-1">{invoices.filter(inv => inv.status === "PAID").length} paid</p>
        </div>
        <div className="rounded-3xl border border-border bg-surface p-4 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted">Total</p>
          <p className="mt-3 text-xl font-semibold text-brand">{formatMoney(totalOutstanding + totalPaid)}</p>
          <p className="text-xs text-muted mt-1">{invoices.length} invoices</p>
        </div>
        <div className="rounded-3xl border border-border bg-surface p-4 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted">Payment Rate</p>
          <p className="mt-3 text-xl font-semibold text-brand">{invoices.length > 0 ? Math.round((totalPaid / (totalPaid + totalOutstanding)) * 100) : 0}%</p>
          <p className="text-xs text-muted mt-1">of billed total</p>
        </div>
      </div>

      {/* Invoice List */}
      <div className="rounded-3xl border border-border bg-surface shadow-sm overflow-hidden">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b border-border bg-background">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Invoice History</h2>
            <p className="text-sm text-muted mt-1">A clean, mobile-style billing list</p>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoices..."
            className="min-w-[200px] rounded-2xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <div className="flex flex-wrap gap-2 px-5 py-4 border-b border-border bg-surface">
          {[
            { value: "all", label: "All" },
            { value: "outstanding", label: "Outstanding" },
            { value: "paid", label: "Paid" },
          ].map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value as any)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === btn.value
                  ? "bg-brand text-white"
                  : "bg-background text-foreground border border-border hover:border-brand/70"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 px-6">
            <CreditCard className="h-16 w-16 text-muted mx-auto mb-4 opacity-50" />
            <p className="text-muted font-medium">No invoices found</p>
            <p className="text-sm text-muted mt-1">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((invoice) => {
              const isOverdue = new Date(invoice.dueDate) < new Date() && invoice.status !== "PAID";

              const getStatusBadge = (status: string) => {
                switch (status) {
                  case "PAID":
                    return "bg-emerald-100 text-emerald-700 border-emerald-200";
                  case "OVERDUE":
                    return "bg-red-100 text-red-700 border-red-200";
                  case "PART_PAID":
                    return "bg-amber-100 text-amber-700 border-amber-200";
                  case "SENT":
                    return "bg-blue-100 text-blue-700 border-blue-200";
                  default:
                    return "bg-slate-100 text-slate-700 border-slate-200";
                }
              };

              return (
                <div key={invoice.id} className="px-5 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Invoice {invoice.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-base font-semibold text-foreground truncate">{invoice.childName}</p>
                      <p className="text-sm text-muted mt-1 truncate">{invoice.description || "School Fees"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-semibold text-foreground">{formatMoney(invoice.amountDue || 0)}</p>
                      <p className="text-xs text-muted mt-1">Amount</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadge(invoice.status)}`}>
                      {invoice.status === "PART_PAID" ? "Partial" : invoice.status === "DRAFT" ? "Draft" : invoice.status}
                    </span>
                    <span className="text-xs text-muted">Due {new Date(invoice.dueDate).toLocaleDateString()}</span>
                    <button
                      onClick={() => router.push(`/parent/invoices/${invoice.id}`)}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90 transition"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                  </div>
                  {isOverdue && <p className="mt-3 text-sm font-semibold text-error">This invoice is overdue.</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Instructions */}
      {totalOutstanding > 0 && (
        <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-6">
          <h3 className="font-bold text-lg text-amber-900">Payment Reminder</h3>
          <p className="text-amber-800 mt-2">You have an outstanding balance of <span className="font-bold">{formatMoney(totalOutstanding)}</span> due. Please make payment as soon as possible to avoid late fees.</p>
          <button className="mt-4 px-6 py-2.5 bg-brand text-white rounded-lg font-semibold hover:bg-brand/90 shadow-sm transition-colors">
            Make Payment
          </button>
        </div>
      )}
    </ParentPageShell>
  );
}
