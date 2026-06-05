import Link from "next/link";
import { readFile } from "fs/promises";
import { Button } from "@/components/ui/button";
import { getCurrentSchool } from "@/lib/school";
import { WhatsAppRetryButton } from "@/app/admin/whatsapp/retry-button";
import { WhatsAppIcon } from "@/components/ui/icons";

type DeliveryEntry = {
  time: string;
  to: string;
  body: string;
  success: boolean;
  status?: number;
  reason?: string;
  retriedFrom?: string;
};

async function getWhatsAppDeliveries(): Promise<DeliveryEntry[] | null> {
  try {
    const content = await readFile("publish/whatsapp_deliveries.jsonl", "utf8");
    const records = content
      .trim()
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line) as DeliveryEntry;
        } catch {
          return null;
        }
      })
      .filter((record): record is DeliveryEntry => record !== null);

    return records.slice(-200).reverse();
  } catch (err) {
    return null;
  }
}

export default async function WhatsAppAdminPage() {
  const school = await getCurrentSchool();
  const deliveries = await getWhatsAppDeliveries();
  const failureCount = deliveries?.filter((d) => !d.success).length ?? 0;
  const successCount = deliveries?.filter((d) => d.success).length ?? 0;

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/admin" className="text-sm text-brand hover:underline">
            ← Admin
          </Link>
          <div className="mt-3 flex items-center gap-3">
            <WhatsAppIcon className="h-6 w-6 text-emerald-600" />
            <h1 className="text-3xl font-bold text-foreground">WhatsApp Delivery</h1>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Review message delivery attempts, inspect failure reasons, and retry failed sends.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <WhatsAppRetryButton disabled={failureCount === 0} />
          <Button variant="secondary" href="/admin/settings">
            WhatsApp settings
          </Button>
        </div>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-4">
          <dt className="text-sm text-muted">Recent attempts</dt>
          <dd className="mt-2 text-2xl font-semibold text-foreground">{deliveries?.length ?? 0}</dd>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <dt className="text-sm text-muted">Failures</dt>
          <dd className="mt-2 text-2xl font-semibold text-foreground">{failureCount}</dd>
        </div>
      </dl>

      <section className="mt-8 overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        {/* Desktop Table */}
        <table className="hidden sm:table min-w-full divide-y divide-border text-sm w-full">
          <thead className="bg-background">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-muted">Time</th>
              <th className="px-4 py-3 text-left font-semibold text-muted">Recipient</th>
              <th className="px-4 py-3 text-left font-semibold text-muted">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-muted">Reason</th>
              <th className="px-4 py-3 text-left font-semibold text-muted">Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {deliveries ? (
              deliveries.length > 0 ? (
                deliveries.map((delivery, index) => (
                  <tr key={`${delivery.time}-${index}`}>
                    <td className="whitespace-nowrap px-4 py-3 text-muted">
                      {new Date(delivery.time).toLocaleString("en-NG", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">{delivery.to}</td>
                    <td className="px-4 py-3">
                      {delivery.success ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">Success</span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-800">Failed</span>
                      )}
                    </td>
                    <td className="px-4 py-3 break-words text-xs text-muted">{delivery.reason ?? delivery.status ?? "—"}</td>
                    <td className="px-4 py-3 break-words max-w-xl text-xs text-foreground">{delivery.body}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-muted" colSpan={5}>
                    No WhatsApp delivery logs found yet.
                  </td>
                </tr>
              )
            ) : (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-muted" colSpan={5}>
                  No delivery log file found. Send a reminder or record a message to generate logs.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Mobile List */}
        <div className="sm:hidden space-y-2 p-4">
          {deliveries ? (
            deliveries.length > 0 ? (
              deliveries.map((delivery, index) => (
                <div key={`${delivery.time}-${index}`} className="rounded-lg border border-border bg-surface px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted">
                      {new Date(delivery.time).toLocaleString("en-NG", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="text-xs">
                      {delivery.success ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">Success</span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-800">Failed</span>
                      )}
                    </span>
                  </div>
                  <p className="text-sm font-medium truncate mb-1">{delivery.to}</p>
                  <p className="text-xs text-muted truncate">{delivery.body}</p>
                </div>
              ))
            ) : (
              <div className="text-center text-sm text-muted py-8">
                No WhatsApp delivery logs found yet.
              </div>
            )
          ) : (
            <div className="text-center text-sm text-muted py-8">
              No delivery log file found. Send a reminder or record a message to generate logs.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
