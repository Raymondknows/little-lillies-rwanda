export type InvoiceStatus = "PENDING" | "PAID" | "PARTIAL" | "OVERDUE" | "CANCELLED";
export type ResultStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export function formatMoney(amountMinor: number, currency = "NGN") {
  const value = amountMinor / 100;
  try {
    return new Intl.NumberFormat(currency === "NGN" ? "en-NG" : "en", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString()}`;
  }
}

export function invoiceStatusLabel(status: InvoiceStatus): string {
  const map: Record<InvoiceStatus, string> = {
    DRAFT: "Draft",
    SENT: "Sent",
    PART_PAID: "Part paid",
    PAID: "Paid",
    OVERDUE: "Overdue",
  };
  return map[status] ?? status;
}

export function invoiceStatusClass(status: InvoiceStatus): string {
  const map: Record<InvoiceStatus, string> = {
    DRAFT: "text-muted",
    SENT: "text-brand",
    PART_PAID: "text-warning",
    PAID: "text-success",
    OVERDUE: "text-error",
  };
  return map[status] ?? "text-muted";
}

export function resultStatusLabel(status: ResultStatus): string {
  const map: Record<ResultStatus, string> = {
    DRAFT: "Draft",
    APPROVED: "Ready to publish",
    PUBLISHED: "Published",
  };
  return map[status] ?? status;
}

export function pupilName(first: string, last: string, middle?: string) {
  return middle ? `${first} ${middle} ${last}` : `${first} ${last}`;
}
