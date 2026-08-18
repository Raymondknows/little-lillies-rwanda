export type InvoiceStatus = "PENDING" | "PAID" | "PARTIAL" | "OVERDUE" | "CANCELLED";
export type InvoiceStatusLike = InvoiceStatus | "SENT" | "PART_PAID" | "DRAFT";
export type ResultStatus = "DRAFT" | "APPROVED" | "PUBLISHED";

export function formatMoney(amountMinor: number, currency = "NGN") {
  const value = amountMinor / 100;

  if (currency === "RWF") {
    return `FRw ${value.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  }

  try {
    // Select appropriate locale based on currency
    let locale = "en-US";
    if (currency === "NGN") locale = "en-NG"; // Nigeria

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString()}`;
  }
}

export function invoiceStatusLabel(status: InvoiceStatusLike): string {
  const map: Record<InvoiceStatusLike, string> = {
    PENDING: "Pending",
    PAID: "Paid",
    PARTIAL: "Partial",
    OVERDUE: "Overdue",
    CANCELLED: "Cancelled",
    SENT: "Sent",
    PART_PAID: "Part Paid",
    DRAFT: "Draft",
  };
  return map[status] ?? status;
}

export function invoiceStatusClass(status: InvoiceStatusLike): string {
  const map: Record<InvoiceStatusLike, string> = {
    PENDING: "text-brand",
    PARTIAL: "text-warning",
    PAID: "text-success",
    OVERDUE: "text-error",
    CANCELLED: "text-muted",
    SENT: "text-brand",
    PART_PAID: "text-warning",
    DRAFT: "text-muted",
  };
  return map[status] ?? "text-muted";
}

export function resultStatusLabel(status: ResultStatus): string {
  const map: Record<ResultStatus, string> = {
    DRAFT: "Draft",
    APPROVED: "Ready to Publish",
    PUBLISHED: "Published",
  };
  return map[status] ?? status;
}

export function pupilName(first: string, last: string, middle?: string) {
  return middle ? `${first} ${middle} ${last}` : `${first} ${last}`;
}
