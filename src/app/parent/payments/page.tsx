"use client";

import { useEffect, useState } from "react";
import { CreditCard, AlertCircle, Download } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { getBackendUrl } from "@/lib/backend-url";

interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paidAt: string;
  method: "PAYSTACK" | "BANK_TRANSFER" | "CASH" | "POS" | "CHEQUE";
  status: string;
  reference?: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const backendUrl = getBackendUrl();
        
        const res = await fetch(`${backendUrl}/api/parent/payments`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
          throw new Error('Failed to load payments');
        }

        const data = await res.json();
        const paymentsList = data.payments || [];
        setPayments(paymentsList);
        
        const total = paymentsList.reduce((sum: number, p: Payment) => sum + p.amount, 0);
        setTotalPaid(total);
        setLoading(false);
      } catch (err) {
        console.error("Error loading payments:", err);
        setError(err instanceof Error ? err.message : 'Failed to load payments');
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
          <p className="mt-4 text-sm text-muted">Loading payments…</p>
        </div>
      </div>
    );
  }

  const methodLabels = {
    PAYSTACK: "Online Payment",
    BANK_TRANSFER: "Bank Transfer",
    CASH: "Cash Payment",
    POS: "POS/Card",
    CHEQUE: "Cheque",
  };

  return (
    <div className="space-y-6 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Payments</h1>
        <p className="mt-2 text-muted">Track all your payments and receipts</p>
      </div>

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
            <div>
              <p className="font-semibold text-red-900">Unable to load payments</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Total Paid</p>
            <p className="mt-2 text-2xl font-bold text-success">{formatMoney(totalPaid)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Count</p>
            <p className="mt-2 text-2xl font-bold text-brand">{payments.length}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Latest</p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {payments.length > 0
                ? new Date(payments[0].paidAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Payments List */}
      {payments.length === 0 ? (
        <div className="rounded-3xl border border-border bg-surface p-12 text-center shadow-sm">
          <CreditCard className="h-16 w-16 text-muted/40 mx-auto mb-4" />
          <p className="text-lg text-muted">No payments recorded yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="rounded-3xl border border-border bg-surface p-4 shadow-sm transition hover:shadow-md hover:border-brand/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="inline-flex rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-success">
                      Paid
                    </span>
                    <span className="text-xs text-muted">
                      {methodLabels[payment.method] || payment.method}
                    </span>
                  </div>
                  <p className="text-sm text-foreground font-medium">School Fees</p>
                  <p className="text-xs text-muted mt-1">
                    Ref: {payment.reference || "—"}
                  </p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-lg font-bold text-success">{formatMoney(payment.amount)}</p>
                  <p className="text-sm font-semibold text-foreground mt-2">
                    {new Date(payment.paidAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  <button className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand/80 transition">
                    <Download className="h-3.5 w-3.5" />
                    Receipt
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
