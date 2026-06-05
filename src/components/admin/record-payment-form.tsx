"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { recordPayment } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

export function RecordPaymentForm({
  invoiceId,
  balanceMinor,
}: {
  invoiceId: string;
  balanceMinor: number;
  currency?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const balanceNaira = balanceMinor / 100;

  return (
    <form
      className="flex flex-wrap items-end gap-2"
      action={(fd) => {
        startTransition(async () => {
          const res: any = await recordPayment(fd);
          if (res && res.paymentId) {
            router.push(`/admin/fees/receipt/${res.paymentId}`);
            router.refresh();
          }
        });
      }}
    >
      <input type="hidden" name="invoiceId" value={invoiceId} />
      <label className="flex flex-col gap-1 text-xs text-muted">
        Amount (₦)
        <input
          name="amount"
          type="number"
          min={1}
          step={0.01}
          defaultValue={balanceNaira}
          className="w-28 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-muted">
        Method
        <select
          name="method"
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
          defaultValue="CASH"
        >
          <option value="CASH">Cash</option>
          <option value="BANK_TRANSFER">Bank transfer</option>
          <option value="CARD">Card</option>
          <option value="OTHER">Other</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs text-muted">
        Reference
        <input
          name="reference"
          type="text"
          placeholder="Optional"
          className="w-32 rounded-lg border border-border bg-surface px-3 py-2 text-sm"
        />
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Record"}
      </Button>
    </form>
  );
}
