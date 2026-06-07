"use client";

import Link from "next/link";

export default function InvoiceDetailPage() {
  return (
    <div className="mx-auto max-w-5xl px-3 py-4 sm:px-5 sm:py-5">
      <Link href="/admin/fees" className="text-sm font-medium text-brand hover:underline">
        ← Fees
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Invoice Details</h1>
      <div className="mt-6 text-muted">Invoice details available from backend API</div>
    </div>
  );
}
