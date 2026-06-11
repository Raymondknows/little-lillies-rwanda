"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { UserGuide, type PageHelpGuide } from "@/components/ui/user-guide";
import type { PaymentMethod } from "@prisma/client";
import {
  formatMoney,
  invoiceStatusClass,
  invoiceStatusLabel,
  pupilName,
} from "@/lib/format";
import {
  groupInvoicesByHierarchy,
  getPhaseLabel,
  getPhaseColor,
  getPhaseFilterOptions,
  type Invoice,
  type TermItem,
  type Stats,
  type InvoiceStatus,
} from "@/lib/fees-grouping";
import { ArrowUpRight, TrendingUp, CheckCircle, AlertCircle, Clock } from "lucide-react";

const STATUS_CONFIG = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-800" },
  SENT: { label: "Sent", color: "bg-blue-100 text-blue-800" },
  PART_PAID: { label: "Part Paid", color: "bg-yellow-100 text-yellow-800" },
  PAID: { label: "Paid", color: "bg-green-100 text-green-800" },
  OVERDUE: { label: "Overdue", color: "bg-red-100 text-red-800" },
  ALL: { label: "All Statuses", color: "bg-gray-100 text-gray-800" },
};

const STATUS_ORDER = ["ALL", "OVERDUE", "PART_PAID", "SENT", "DRAFT", "PAID"];
const PAYMENT_METHODS = ["CASH", "BANK_TRANSFER", "CARD", "ONLINE", "OTHER"] as const;
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 500] as const;
const DEFAULT_ITEMS_PER_PAGE = 20;

const HELP_GUIDE: PageHelpGuide = {
  title: "Managing Fees & Invoices",
  overview: "Track and manage student fee invoices organized by academic year, school phase, term, and class. Record payments, send reminders, and filter by status.",
  steps: [
    "Issue invoices for a term to bill all eligible students.",
    "View invoices grouped by Early Years, Primary, Secondary phases.",
    "Each phase shows summary statistics and collapsible term details.",
    "Click 'Record payment' to log cash, bank transfer, or online payments.",
    "Send batch reminders to families with overdue or part-paid invoices.",
  ],
  commonTasks: [
    {
      title: "Issue Invoices for a Term",
      description: "Create invoices for all students in a specific term.",
      tips: [
        "Select the term from the dropdown at the top",
        "Click 'Issue term bills' to generate invoices",
        "Invoices appear automatically grouped by phase and term",
      ],
    },
    {
      title: "Record a Payment",
      description: "Log a payment against an invoice.",
      tips: [
        "Find the invoice row in any class group",
        "Click 'Record payment' to open the payment modal",
        "Enter amount, method (cash, bank, card, etc.), and reference",
        "Invoice status updates and groups recalculate automatically",
      ],
    },
    {
      title: "Send Reminders",
      description: "Send batch reminders for outstanding fees.",
      tips: [
        "Click 'Send reminders' at the top to queue reminders for overdue and part-paid invoices",
        "Reminders are sent via WhatsApp or email per school policy",
      ],
    },
  ],
  faqs: [
    {
      question: "What does 'Part Paid' mean?",
      answer: "A Part Paid invoice means the student has paid some, but not all, of the amount due.",
    },
    {
      question: "Why are invoices grouped by phase?",
      answer: "Phases (Early Years, Primary, Secondary) help you manage fees separately for each school section.",
    },
    {
      question: "How do I manage fee schedules?",
      answer: "Click 'Manage fee schedules' to set up or edit fee amounts for different student groups and terms.",
    },
  ],
};

export default function FeesPageClient({
  invoices = [],
  outstanding = 0,
  currency = "NGN",
  terms = [],
  onIssueBills = async () => {},
  onSendReminders = async () => {},
  recordPaymentAction = async () => {},
}: {
  invoices?: any[];
  outstanding?: number;
  currency?: string;
  terms?: TermItem[];
  onIssueBills?: (termId: string) => Promise<void>;
  onSendReminders?: () => Promise<void>;
  recordPaymentAction?: (formData: FormData) => Promise<void>;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const success = searchParams?.get("success") === "1";
  const created = Number(searchParams?.get("created") ?? 0);
  const reminders = searchParams?.get("reminders") === "1";
  const remindersSent = Number(searchParams?.get("sent") ?? 0);
  const paymentRecorded = searchParams?.get("paymentRecorded") === "1";
  const error = searchParams?.get("error") ?? undefined;
  const errorMessage = searchParams?.get("errorMessage") ?? undefined;

  const [activePhase, setActivePhase] = useState("ALL");
  const [activeStatus, setActiveStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [paymentReference, setPaymentReference] = useState("");
  
  // Issue bills and send reminders state
  const [issuingBills, setIssuingBills] = useState(false);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [selectedTermId, setSelectedTermId] = useState("");

  const handleIssueBillsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTermId) return;
    
    setIssuingBills(true);
    try {
      await onIssueBills(selectedTermId);
    } finally {
      setIssuingBills(false);
    }
  };

  const handleSendRemindersSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingReminders(true);
    try {
      await onSendReminders();
    } finally {
      setSendingReminders(false);
    }
  };

  const phaseOptions = getPhaseFilterOptions();

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    let filtered = invoices;

    // Filter by phase
    if (activePhase !== "ALL") {
      filtered = filtered.filter((inv) => {
        const phase = inv.pupil.class?.phase || "UNASSIGNED";
        return phase === activePhase;
      });
    }

    // Filter by status
    if (activeStatus !== "ALL") {
      filtered = filtered.filter((inv) => inv.status === activeStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((inv) => {
        const fullName = `${inv.pupil.firstName} ${inv.pupil.lastName}`.toLowerCase();
        const invoiceNo = (inv.invoiceNo || "").toLowerCase();
        const className = inv.pupil.class
          ? `${inv.pupil.class.name}${inv.pupil.class.arm ? ` ${inv.pupil.class.arm}` : ""}`.toLowerCase()
          : "";
        return fullName.includes(query) || invoiceNo.includes(query) || className.includes(query);
      });
    }

    return filtered;
  }, [invoices, activePhase, activeStatus, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / itemsPerPage));
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handlePhaseChange = (phase: string) => {
    setActivePhase(phase);
    handleFilterChange();
  };

  const handleStatusChange = (status: string) => {
    setActiveStatus(status);
    handleFilterChange();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    handleFilterChange();
  };

  const selectInvoiceForPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentAmount(((invoice.amountDue - invoice.amountPaid) / 100).toFixed(0));
    setPaymentMethod("CASH");
    setPaymentReference("");
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const stats: Stats = {
      count: filteredInvoices.length,
      totalDue: 0,
      totalPaid: 0,
      outstanding: 0,
      byStatus: {
        DRAFT: 0,
        SENT: 0,
        PART_PAID: 0,
        PAID: 0,
        OVERDUE: 0,
      },
    } as Stats;

    filteredInvoices.forEach((inv) => {
      stats.totalDue += inv.amountDue;
      stats.totalPaid += inv.amountPaid;
      stats.outstanding += Math.max(0, inv.amountDue - inv.amountPaid);
      if (inv.status in stats.byStatus) {
        stats.byStatus[inv.status as InvoiceStatus]++;
      }
    });

    return stats;
  }, [filteredInvoices]);

  const formatStatMoney = (amount: number) => formatMoney(amount, currency);

  return (
    <>
      {/* Success Modal: Invoices Issued */}
      {success ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4 py-8">
          <div className="w-full max-w-xl rounded-3xl border border-border bg-surface p-8 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="mt-1 rounded-2xl bg-success/10 p-3 text-success">✓</div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Invoices issued</h3>
                <p className="mt-2 text-sm text-muted">{created ?? 0} invoice{(created ?? 0) !== 1 ? "s" : ""} were created.</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <a href="/admin/fees" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand/90">Close</a>
            </div>
          </div>
        </div>
      ) : null}

      {/* Success Modal: Reminders Sent */}
      {reminders ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4 py-8">
          <div className="w-full max-w-xl rounded-3xl border border-border bg-surface p-8 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="mt-1 rounded-2xl bg-success/10 p-3 text-success">✓</div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Reminders sent</h3>
                <p className="mt-2 text-sm text-muted">{remindersSent ?? 0} reminders were queued for sending.</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <a href="/admin/fees" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand/90">Close</a>
            </div>
          </div>
        </div>
      ) : null}

      {/* Success Modal: Payment Recorded */}
      {paymentRecorded ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4 py-8">
          <div className="w-full max-w-xl rounded-3xl border border-border bg-surface p-8 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="mt-1 rounded-2xl bg-success/10 p-3 text-success">✓</div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Payment recorded</h3>
                <p className="mt-2 text-sm text-muted">The invoice has been updated and the dashboard is refreshed.</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <a href="/admin/fees" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand/90">Close</a>
            </div>
          </div>
        </div>
      ) : null}

      {/* Error Modal */}
      {error ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4 py-8">
          <div className="w-full max-w-xl rounded-3xl border border-border bg-surface p-8 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="mt-1 rounded-2xl bg-rose-50 p-3 text-rose-600">!</div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Could not issue invoices</h3>
                <p className="mt-2 text-sm text-muted">{errorMessage ?? (error === "no_schedules" ? "No fee schedules were found for the selected term." : "Selected term not found.")}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <a href="/admin/fees" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand/90">Close</a>
            </div>
          </div>
        </div>
      ) : null}

      {/* Payment Modal */}
      {selectedInvoice ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4 py-8 overflow-y-auto">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-lg my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">
                Record payment
              </h2>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="text-muted hover:text-foreground transition text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="mb-6 space-y-2 text-sm">
              <div>
                <p className="text-muted">Student</p>
                <p className="font-medium text-foreground">{pupilName(selectedInvoice.pupil.firstName, selectedInvoice.pupil.lastName)}</p>
              </div>
              <div>
                <p className="text-muted">Invoice</p>
                <p className="font-medium text-foreground">{selectedInvoice.invoiceNo}</p>
              </div>
              <div>
                <p className="text-muted">Outstanding Balance</p>
                <p className="font-semibold text-red-600">{formatStatMoney(selectedInvoice.amountDue - selectedInvoice.amountPaid)}</p>
              </div>
            </div>

            <form action={recordPaymentAction} className="space-y-4">
              <input type="hidden" name="invoiceId" value={selectedInvoice.id} />

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Amount Paid ({currency})
                </label>
                <input
                  type="number"
                  name="amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  step="0.01"
                  required
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Payment Method
                </label>
                <select
                  name="method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Reference (optional)
                </label>
                <input
                  type="text"
                  name="reference"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="Receipt number, bank reference, etc."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-background"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand/90"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Main Page */}
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fees & Invoices</h1>
          <p className="mt-1 text-muted">Manage student invoices and track fee payments by phase, term, and class</p>
        </div>

        {/* Summary Cards */}
        <div className="hidden sm:grid grid-cols-4 gap-3">
          <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md h-full cursor-pointer hover:border-brand/50 flex flex-col">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                <TrendingUp className="h-4 w-4 text-brand" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted">Total Due</p>
                <p className="mt-1 text-lg font-bold text-foreground">{formatStatMoney(summaryStats.totalDue)}</p>
              </div>
              <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
            </div>
            <p className="mt-2 text-[11px] text-muted">{summaryStats.count} invoice{summaryStats.count !== 1 ? "s" : ""}</p>
          </div>

          <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md h-full cursor-pointer hover:border-brand/50 flex flex-col">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                <CheckCircle className="h-4 w-4 text-brand" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted">Paid</p>
                <p className="mt-1 text-lg font-bold text-foreground">{formatStatMoney(summaryStats.totalPaid)}</p>
              </div>
              <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
            </div>
            <p className="mt-2 text-[11px] text-muted">{summaryStats.byStatus.PAID} fully paid</p>
          </div>

          <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md h-full cursor-pointer hover:border-brand/50 flex flex-col">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                <AlertCircle className="h-4 w-4 text-brand" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted">Outstanding</p>
                <p className="mt-1 text-lg font-bold text-foreground">{formatStatMoney(summaryStats.outstanding)}</p>
              </div>
              <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
            </div>
            <p className="mt-2 text-[11px] text-muted">{summaryStats.byStatus.OVERDUE} overdue</p>
          </div>

          <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md h-full cursor-pointer hover:border-brand/50 flex flex-col">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                <Clock className="h-4 w-4 text-brand" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted">Part Paid</p>
                <p className="mt-1 text-lg font-bold text-foreground">{summaryStats.byStatus.PART_PAID}</p>
              </div>
              <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
            </div>
            <p className="mt-2 text-[11px] text-muted">Partial payments recorded</p>
          </div>
        </div>

        {/* Mobile Summary Cards */}
        <div className="sm:hidden space-y-3">
          <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                <TrendingUp className="h-4 w-4 text-brand" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted">Total Due</p>
                <p className="mt-1 text-lg font-bold text-foreground">{formatStatMoney(summaryStats.totalDue)}</p>
              </div>
              <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
            </div>
            <p className="mt-2 text-[11px] text-muted">{summaryStats.count} invoice{summaryStats.count !== 1 ? "s" : ""}</p>
          </div>

          <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                <CheckCircle className="h-4 w-4 text-brand" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted">Paid</p>
                <p className="mt-1 text-lg font-bold text-foreground">{formatStatMoney(summaryStats.totalPaid)}</p>
              </div>
              <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
            </div>
            <p className="mt-2 text-[11px] text-muted">{summaryStats.byStatus.PAID} fully paid</p>
          </div>

          <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                <AlertCircle className="h-4 w-4 text-brand" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted">Outstanding</p>
                <p className="mt-1 text-lg font-bold text-foreground">{formatStatMoney(summaryStats.outstanding)}</p>
              </div>
              <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
            </div>
            <p className="mt-2 text-[11px] text-muted">{summaryStats.byStatus.OVERDUE} overdue</p>
          </div>

          <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                <Clock className="h-4 w-4 text-brand" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted">Part Paid</p>
                <p className="mt-1 text-lg font-bold text-foreground">{summaryStats.byStatus.PART_PAID}</p>
              </div>
              <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
            </div>
            <p className="mt-2 text-[11px] text-muted">Partial payments recorded</p>
          </div>
        </div>

        {/* Actions & Search Bar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Box - Left */}
          <input
            type="text"
            placeholder="Search by student name, invoice number, or class..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="flex-1 rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand"
          />

          {/* Buttons - Right */}
          <div className="flex flex-wrap gap-2">
            <form onSubmit={handleIssueBillsSubmit} className="flex gap-2">
              <select
                value={selectedTermId}
                onChange={(e) => setSelectedTermId(e.target.value)}
                required
                className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="">Select term</option>
                {terms.map((term) => (
                  <option key={term.id} value={term.id}>
                    {term.name}
                  </option>
                ))}
              </select>
              <Button type="submit" disabled={issuingBills} className="text-xs px-2.5 py-1.5 h-auto">
                {issuingBills ? "Issuing..." : "Issue Bills"}
              </Button>
            </form>

            <form onSubmit={handleSendRemindersSubmit}>
              <Button type="submit" disabled={sendingReminders} variant="secondary" className="text-xs px-2.5 py-1.5 h-auto">
                {sendingReminders ? "Sending..." : "Send Reminders"}
              </Button>
            </form>

            <Button href="/admin/fees/schedules" variant="secondary" className="text-xs px-2.5 py-1.5 h-auto">
              Fee Schedules
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <label className="text-sm font-medium text-muted">School Phase:</label>
            {phaseOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handlePhaseChange(option.value)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  activePhase === option.value
                    ? "bg-brand text-white"
                    : "bg-background text-muted hover:bg-surface"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="text-sm font-medium text-muted">Status:</label>
            {STATUS_ORDER.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  activeStatus === status
                    ? "bg-brand text-white"
                    : "bg-background text-muted hover:bg-surface"
                }`}
              >
                {STATUS_CONFIG[status as keyof typeof STATUS_CONFIG].label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            Showing {paginatedInvoices.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–
            {Math.min(currentPage * itemsPerPage, filteredInvoices.length)} of {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? "s" : ""}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
          <label className="text-sm text-muted whitespace-nowrap">
            Rows per page
            <select
              value={itemsPerPage}
              onChange={handlePageSizeChange}
              className="ml-2 rounded-lg border border-border bg-background px-2 py-1 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Table */}
        {paginatedInvoices.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto rounded-lg border border-border bg-surface mb-6">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-background text-muted">
                  <tr>
                    <th className="px-4 py-2 font-medium">Student</th>
                    <th className="px-4 py-2 font-medium">Phase / Class</th>
                    <th className="px-4 py-2 font-medium">Term</th>
                    <th className="px-4 py-2 font-medium">Invoice No.</th>
                    <th className="px-4 py-2 font-medium text-right">Amount Due</th>
                    <th className="px-4 py-2 font-medium text-right">Paid</th>
                    <th className="px-4 py-2 font-medium text-right">Balance</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedInvoices.map((inv, idx) => {
                    const balance = inv.amountDue - inv.amountPaid;
                    const classLabel = inv.pupil?.class
                      ? `${inv.pupil.class.name}${inv.pupil.class.arm ? ` ${inv.pupil.class.arm}` : ""}`
                      : "—";
                    const phase = inv.pupil?.class?.phase || "UNASSIGNED";
                    const pupilFullName = inv.pupil ? pupilName(inv.pupil.firstName, inv.pupil.lastName) : "Unknown";

                    return (
                      <tr key={inv.id || `invoice-${idx}`} className="border-t border-border hover:bg-background/50 transition-colors">
                        <td className="px-4 py-2 font-medium text-foreground">{pupilFullName}</td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <span className={`inline-block rounded-md border px-2 py-1 text-xs font-medium ${getPhaseColor(phase)}`}>
                              {getPhaseLabel(phase)}
                            </span>
                            <span className="text-muted text-xs">{classLabel}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-muted">{inv.feeSchedule?.term?.name ?? "—"}</td>
                        <td className="px-4 py-2 text-muted"><code className="text-xs">{inv.invoiceNo ?? "—"}</code></td>
                        <td className="px-4 py-2 text-right font-semibold">{formatStatMoney(inv.amountDue)}</td>
                        <td className="px-4 py-2 text-right font-semibold text-green-600">{formatStatMoney(inv.amountPaid)}</td>
                        <td className={`px-4 py-2 text-right font-semibold ${invoiceStatusClass(inv.status)}`}>{formatStatMoney(balance)}</td>
                        <td className="px-4 py-2"><Badge variant={inv.status === "PAID" ? "success" : inv.status === "OVERDUE" ? "error" : inv.status === "PART_PAID" ? "warning" : "secondary"}>{invoiceStatusLabel(inv.status)}</Badge></td>
                        <td className="px-4 py-2 flex flex-wrap gap-1">
                          <Link href={`/admin/fees/${inv.id}`} className="rounded-full border border-border bg-white px-2 py-0.5 text-xs font-semibold text-brand transition hover:bg-brand/5">View</Link>
                          {balance > 0 ? (
                            <button
                              type="button"
                              onClick={() => selectInvoiceForPayment(inv)}
                              className="rounded-full border border-border bg-surface px-2 py-0.5 text-xs font-semibold text-foreground transition hover:bg-background"
                            >
                              Pay
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile List */}
            <div className="sm:hidden space-y-2 mb-6">
              {paginatedInvoices.map((inv, idx) => {
                const balance = inv.amountDue - inv.amountPaid;
                const classLabel = inv.pupil?.class
                  ? `${inv.pupil.class.name}${inv.pupil.class.arm ? ` ${inv.pupil.class.arm}` : ""}`
                  : "Unassigned";
                const phase = inv.pupil?.class?.phase || "UNASSIGNED";
                const pupilFullName = inv.pupil ? pupilName(inv.pupil.firstName, inv.pupil.lastName) : "Unknown";

                return (
                  <div
                    key={inv.id || `invoice-${idx}`}
                    className="rounded-lg border border-border bg-surface px-3 py-2 hover:bg-background/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">
                          {pupilFullName}
                        </p>
                        <p className="text-xs text-muted mt-1">
                          <span className={`inline-block rounded-md border px-1 py-0.5 text-xs font-medium ${getPhaseColor(phase)}`}>
                            {getPhaseLabel(phase)}
                          </span>
                          <span className="ml-1">{classLabel}</span>
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={inv.status === "PAID" ? "success" : inv.status === "OVERDUE" ? "error" : inv.status === "PART_PAID" ? "warning" : "secondary"} className="text-xs whitespace-nowrap">
                          {invoiceStatusLabel(inv.status)}
                        </Badge>
                        <p className="text-xs font-semibold text-foreground">{formatStatMoney(balance)}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/admin/fees/${inv.id}`} className="rounded-full border border-border bg-white px-1.5 py-0.5 text-xs font-semibold text-brand transition hover:bg-brand/5">
                        View
                      </Link>
                      {balance > 0 ? (
                        <button
                          type="button"
                          onClick={() => selectInvoiceForPayment(inv)}
                          className="rounded-full border border-border bg-surface px-1.5 py-0.5 text-xs font-semibold text-foreground transition hover:bg-background"
                        >
                          Pay
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        ) : (
          <div className="rounded-lg border border-border bg-surface px-4 py-8 text-center sm:px-6 sm:py-12">
            <p className="text-sm text-muted">
              {searchQuery ? `No invoices found matching "${searchQuery}"` : "No invoices to display"}
            </p>
          </div>
        )}
      </div>

      <UserGuide guide={HELP_GUIDE} />
    </>
  );
}
