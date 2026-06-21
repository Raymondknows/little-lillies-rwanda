"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CreditCard, AlertCircle, Eye, Filter } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { getBackendUrl } from "@/lib/backend-url";

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

  useEffect(() => {
    async function loadData() {
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
    }

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
          <p className="mt-4 text-muted">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted uppercase tracking-wider font-medium">Outstanding Balance</p>
              <p className={`text-3xl font-bold mt-3 ${totalOutstanding > 0 ? 'text-error' : 'text-success'}`}>
                {formatMoney(totalOutstanding)}
              </p>
              <p className="text-xs text-muted mt-2">{invoices.filter(inv => ["SENT", "PART_PAID", "OVERDUE"].includes(inv.status)).length} invoice(s)</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted uppercase tracking-wider font-medium">Total Paid</p>
              <p className="text-3xl font-bold mt-3 text-success">
                {formatMoney(totalPaid)}
              </p>
              <p className="text-xs text-muted mt-2">{invoices.filter(inv => inv.status === "PAID").length} paid invoice(s)</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <CreditCard className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted uppercase tracking-wider font-medium">Total Invoiced</p>
              <p className="text-3xl font-bold mt-3 text-brand">
                {formatMoney(totalOutstanding + totalPaid)}
              </p>
              <p className="text-xs text-muted mt-2">{invoices.length} invoice(s) total</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted uppercase tracking-wider font-medium">Payment Rate</p>
              <p className="text-3xl font-bold mt-3 text-brand">
                {invoices.length > 0 ? Math.round((totalPaid / (totalPaid + totalOutstanding)) * 100) : 0}%
              </p>
              <p className="text-xs text-muted mt-2">of total billed</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <Filter className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-xl border border-border bg-surface shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-6 border-b border-border bg-background">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Invoice History</h2>
              <p className="text-sm text-muted mt-1">All invoices and payment records</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoices..."
                className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {[
              { value: "all", label: "All Invoices" },
              { value: "outstanding", label: "Outstanding" },
              { value: "paid", label: "Paid" },
            ].map((btn) => (
              <button
                key={btn.value}
                onClick={() => setFilter(btn.value as any)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  filter === btn.value
                    ? "bg-brand text-white shadow-sm"
                    : "bg-background text-foreground border border-border hover:border-brand/50"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 px-6">
            <CreditCard className="h-16 w-16 text-muted mx-auto mb-4 opacity-50" />
            <p className="text-muted font-medium">No invoices found</p>
            <p className="text-sm text-muted mt-1">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-background/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Invoice #</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Child</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Description</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-muted">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Due Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-muted">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
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
                    <tr key={invoice.id} className="hover:bg-background/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10">
                            <CreditCard className="h-5 w-5 text-brand" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-sm">{invoice.id.slice(0, 8).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-foreground font-medium text-sm">{invoice.childName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-muted text-sm">{invoice.description || "School Fees"}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-bold text-foreground text-sm">{formatMoney(invoice.amountDue || 0)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-foreground">{new Date(invoice.dueDate).toLocaleDateString()}</div>
                        {isOverdue && <div className="text-xs text-error font-bold mt-1">OVERDUE</div>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(invoice.status)}`}>
                          {invoice.status === "PART_PAID" ? "Partial" : invoice.status === "DRAFT" ? "Draft" : invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => router.push(`/parent/invoices/${invoice.id}`)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-brand border border-brand rounded-lg hover:bg-brand/5 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Open
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
    </div>
  );
}
