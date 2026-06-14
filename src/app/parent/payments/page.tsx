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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
          <p className="mt-4 text-muted">Loading payments...</p>
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
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Payment History</h1>
        <p className="mt-1 text-muted">Track all your payments</p>
      </div>

      {error && (
        <div className="rounded-lg border border-error bg-error/10 p-4 flex gap-3 mb-6">
          <AlertCircle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-error">Error</h3>
            <p className="text-sm text-error/80 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="rounded-lg border border-border bg-surface p-6 mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Payment Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-2">Total Payments</p>
            <p className="text-3xl font-bold text-success">{formatMoney(totalPaid)}</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-2">Number of Payments</p>
            <p className="text-3xl font-bold text-brand">{payments.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-2">Latest Payment</p>
            <p className="text-lg font-semibold text-foreground">
              {payments.length > 0
                ? new Date(payments[0].paidAt).toLocaleDateString()
                : "No payments yet"}
            </p>
          </div>
        </div>
      </div>

      {/* Payment History Table */}
      {payments.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface p-12 text-center">
          <CreditCard className="h-12 w-12 text-muted mx-auto mb-3" />
          <p className="text-muted">No payments recorded yet</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-3 text-left font-semibold text-foreground">Date</th>
                  <th className="px-6 py-3 text-left font-semibold text-foreground">Description</th>
                  <th className="px-6 py-3 text-left font-semibold text-foreground">Method</th>
                  <th className="px-6 py-3 text-right font-semibold text-foreground">Amount</th>
                  <th className="px-6 py-3 text-center font-semibold text-foreground">Reference</th>
                  <th className="px-6 py-3 text-center font-semibold text-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-border hover:bg-background/50">
                    <td className="px-6 py-3 font-medium text-foreground">
                      {new Date(payment.paidAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-foreground">School Fees</td>
                    <td className="px-6 py-3">
                      <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium text-muted">
                        {methodLabels[payment.method] || payment.method}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right font-bold text-success">
                      {formatMoney(payment.amount)}
                    </td>
                    <td className="px-6 py-3 text-center text-muted text-xs">
                      {payment.reference || "-"}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <button className="inline-flex items-center gap-2 text-brand hover:text-brand/80 text-xs font-semibold transition">
                        <Download className="h-4 w-4" />
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
