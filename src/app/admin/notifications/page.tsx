import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { getCurrentSchoolId } from "@/lib/school";
import { WhatsAppIcon } from "@/components/ui/icons";

export default async function NotificationsPage() {
  const schoolId = await getCurrentSchoolId();

  const notifications = await prisma.notification.findMany({
    where: { schoolId },
    include: {
      guardian: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const stats = {
    total: notifications.length,
    sent: notifications.filter((n) => n.status === "SENT").length,
    failed: notifications.filter((n) => n.status === "FAILED").length,
    pending: notifications.filter((n) => n.status === "PENDING").length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SENT":
        return "success";
      case "FAILED":
        return "error";
      case "PENDING":
        return "warning";
      default:
        return "default";
    }
  };

  const getChannelLabel = (channel: string) => {
    switch (channel) {
      case "WHATSAPP":
        return (
          <span className="inline-flex items-center gap-2">
            <WhatsAppIcon className="h-4 w-4 text-emerald-600" />
            WhatsApp
          </span>
        );
      case "SMS":
        return "SMS";
      case "EMAIL":
        return "Email";
      default:
        return channel;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Notification Logs</h1>
        <p className="mt-1 text-muted">
          Track all messages sent to parents and delivery status.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-sm text-muted">Total sent</p>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {stats.total}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-sm text-muted">Delivered</p>
          <p className="mt-2 text-2xl font-bold text-success">
            {stats.sent}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-sm text-muted">Failed</p>
          <p className="mt-2 text-2xl font-bold text-error">
            {stats.failed}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-sm text-muted">Pending</p>
          <p className="mt-2 text-2xl font-bold text-warning">
            {stats.pending}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        {/* Desktop Table */}
        <table className="hidden sm:table w-full text-left text-sm">
          <thead className="border-b border-border bg-background text-muted">
            <tr>
              <th className="px-4 py-2 font-medium">Type</th>
              <th className="px-4 py-2 font-medium">To</th>
              <th className="px-4 py-2 font-medium">Channel</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Sent at</th>
              <th className="px-4 py-2 font-medium">Details</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((notif) => (
              <tr key={notif.id} className="border-t border-border hover:bg-background/50">
                <td className="px-4 py-2 text-xs font-medium text-foreground">
                  {notif.type.replace("_", " ")}
                </td>
                <td className="px-4 py-2">
                  <div>
                    <p className="font-medium">
                      {notif.guardian.firstName} {notif.guardian.lastName}
                    </p>
                    <p className="text-xs text-muted">
                      {notif.guardian.whatsapp || notif.guardian.email || notif.guardian.phone}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <Badge variant="default">
                    {getChannelLabel(notif.channel)}
                  </Badge>
                </td>
                <td className="px-4 py-2">
                  <Badge variant={getStatusColor(notif.status)}>
                    {notif.status}
                  </Badge>
                </td>
                <td className="px-4 py-2 text-xs text-muted">
                  {notif.sentAt
                    ? new Date(notif.sentAt).toLocaleString("en-NG")
                    : new Date(notif.createdAt).toLocaleString("en-NG")}
                </td>
                <td className="px-4 py-2">
                  {notif.failureReason ? (
                    <p className="text-xs text-error">{notif.failureReason}</p>
                  ) : (
                    <p className="text-xs text-success">✓ Delivered</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile List */}
        <div className="sm:hidden space-y-2 p-4">
          {notifications.map((notif) => (
            <div key={notif.id} className="rounded-lg border border-border bg-surface px-4 py-2">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium truncate">
                  {notif.guardian.firstName} {notif.guardian.lastName}
                </p>
                <Badge variant={getStatusColor(notif.status)}>
                  {notif.status}
                </Badge>
              </div>
              <p className="text-xs text-muted mb-1">
                {notif.guardian.whatsapp || notif.guardian.email || notif.guardian.phone}
              </p>
              <div className="flex items-center justify-between text-xs">
                <Badge variant="default">
                  {getChannelLabel(notif.channel)}
                </Badge>
                <span className="text-muted">
                  {notif.sentAt
                    ? new Date(notif.sentAt).toLocaleString("en-NG")
                    : new Date(notif.createdAt).toLocaleString("en-NG")}
                </span>
              </div>
            </div>
          ))}
        </div>

        {notifications.length === 0 && (
          <div className="px-4 py-4 text-center">
            <p className="text-muted">No notifications sent yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
