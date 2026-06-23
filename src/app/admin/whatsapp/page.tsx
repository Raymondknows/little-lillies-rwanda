"use client";

import { getBackendUrl } from "@/lib/backend-url";
import { useEffect, useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send, Mail, AlertCircle, CheckCircle, Clock, TrendingUp, ArrowUpRight } from "lucide-react";
import SubscriptionModal from "@/components/subscription-modal";

interface Notification {
  id: string;
  date: string;
  guardian: string;
  type: "ISSUE_BILLS" | "SEND_REMINDER" | "ATTENDANCE_UPDATE";
  title: string;
  body: string;
  channel: "WHATSAPP" | "EMAIL";
  status: "SENT" | "FAILED" | "PENDING";
  sentAt?: string;
  failureReason?: string;
  reference?: string;
}

interface NotificationStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  byChannel: { WHATSAPP: number; EMAIL: number };
  byType: { ISSUE_BILLS: number; SEND_REMINDER: number; ATTENDANCE_UPDATE: number };
}

const STATUS_CONFIG: { [key: string]: { label: string; color: string; icon: any } } = {
  SENT: { label: "Sent", color: "bg-green-100 text-green-800", icon: CheckCircle },
  FAILED: { label: "Failed", color: "bg-red-100 text-red-800", icon: AlertCircle },
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
};

const TYPE_CONFIG: { [key: string]: { label: string; color: string } } = {
  ISSUE_BILLS: { label: "Invoice Issued", color: "bg-blue-50 text-blue-900" },
  SEND_REMINDER: { label: "Fee Reminder", color: "bg-orange-50 text-orange-900" },
  ATTENDANCE_UPDATE: { label: "Attendance Update", color: "bg-purple-50 text-purple-900" },
};

const CHANNEL_CONFIG: { [key: string]: { label: string; icon: any; color: string } } = {
  WHATSAPP: { label: "WhatsApp", icon: MessageCircle, color: "text-green-600" },
  EMAIL: { label: "Email", icon: Mail, color: "text-blue-600" },
};

// Fallback config for unknown types/channels/statuses
const getTypeConfig = (type?: string) => 
  (TYPE_CONFIG as any)[type!] || { label: type || "Unknown", color: "bg-gray-50 text-gray-900" };

const getChannelConfig = (channel?: string) => 
  (CHANNEL_CONFIG as any)[channel!] || { label: channel || "Unknown", icon: Send, color: "text-gray-600" };

const getStatusConfig = (status?: string) => 
  (STATUS_CONFIG as any)[status!] || { label: status || "Unknown", color: "bg-gray-100 text-gray-800", icon: AlertCircle };

const PAGE_SIZE_OPTIONS = [10, 50, 100, 200, 500] as const;
const DEFAULT_ITEMS_PER_PAGE = 50;

export default function WhatsAppPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionError, setSubscriptionError] = useState<{
    reason?: string;
    schoolName?: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterChannel, setFilterChannel] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);

  // Fetch notifications on mount and when filters change
  useEffect(() => {
    async function fetchNotifications() {
      setLoading(true);
      setError(null);
      try {
        const backendUrl = getBackendUrl();
        const params = new URLSearchParams({
          limit: String(itemsPerPage * 5), // Fetch more for client-side filtering
          offset: String(0),
        });

        if (filterType !== "ALL") params.append("type", filterType);
        if (filterStatus !== "ALL") params.append("status", filterStatus);
        if (filterChannel !== "ALL") params.append("channel", filterChannel);

        const response = await fetch(`${backendUrl}/api/admin/notifications?${params}`, {
          credentials: "include",
        });

        if (response.status === 403) {
          const data = await response.json();
          if (data?.code === 'SUBSCRIPTION_INACTIVE') {
            setSubscriptionError({
              reason: data.reason || 'Your school subscription is not active.',
              schoolName: data.school?.name,
            });
          }
          return;
        }

        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
          setStats(data.stats);
        } else {
          throw new Error("Failed to load notifications");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load communications");
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, [filterType, filterStatus, filterChannel, itemsPerPage]);

  // Filter notifications by search query
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) =>
      notif.guardian.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.reference?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [notifications, searchQuery]);

  // Paginate notifications
  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredNotifications.slice(start, start + itemsPerPage);
  }, [filteredNotifications, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);

  if (loading && !stats) {
    return (
      <div className="p-6">
        <div className="text-muted">Loading communications...</div>
      </div>
    );
  }

  if (subscriptionError) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2 justify-center mb-4">
            <MessageCircle className="h-8 w-8 text-brand" />
            Communications Log
          </h1>
          <p className="text-muted mb-6">View all notifications sent to parents</p>
        </div>
        <SubscriptionModal reason={subscriptionError.reason} schoolName={subscriptionError.schoolName} />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <MessageCircle className="h-8 w-8 text-brand" />
          Communications Log
        </h1>
        <p className="mt-1 text-muted">View all notifications sent to parents</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Summary Stats */}
      {stats && (
        <div className="hidden sm:grid grid-cols-5 gap-3">
          {/* Total Sent */}
          <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50 flex flex-col">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                <TrendingUp className="h-4 w-4 text-brand" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted">Total Sent</p>
                <p className="mt-1 text-lg font-bold text-foreground">{stats.total}</p>
              </div>
              <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
            </div>
            <p className="mt-2 text-[11px] text-muted">All channels combined</p>
          </div>

          {/* Successful */}
          <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50 flex flex-col">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                <CheckCircle className="h-4 w-4 text-brand" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted">Successful</p>
                <p className="mt-1 text-lg font-bold text-foreground">{stats.sent}</p>
              </div>
              <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
            </div>
            <p className="mt-2 text-[11px] text-muted">{stats.total > 0 ? ((stats.sent / stats.total) * 100).toFixed(0) : 0}% success rate</p>
          </div>

          {/* Failed */}
          <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50 flex flex-col">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                <AlertCircle className="h-4 w-4 text-brand" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted">Failed</p>
                <p className="mt-1 text-lg font-bold text-foreground">{stats.failed}</p>
              </div>
              <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
            </div>
            <p className="mt-2 text-[11px] text-muted">Delivery failures</p>
          </div>

          {/* Pending */}
          <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50 flex flex-col">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                <Clock className="h-4 w-4 text-brand" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted">Pending</p>
                <p className="mt-1 text-lg font-bold text-foreground">{stats.pending}</p>
              </div>
              <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
            </div>
            <p className="mt-2 text-[11px] text-muted">Still processing</p>
          </div>

          {/* Channel Breakdown */}
          <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50 flex flex-col">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                <MessageCircle className="h-4 w-4 text-brand" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted">By Channel</p>
                <p className="mt-1 text-lg font-bold text-foreground">{stats.byChannel.WHATSAPP + stats.byChannel.EMAIL}</p>
              </div>
              <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
            </div>
            <p className="mt-2 text-[11px] text-muted flex justify-between">
              <span>WA: {stats.byChannel.WHATSAPP}</span>
              <span>Email: {stats.byChannel.EMAIL}</span>
            </p>
          </div>
        </div>
      )}

      {/* Mobile Summary Cards */}
      {stats && (
        <div className="sm:hidden space-y-3">
          <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                <TrendingUp className="h-4 w-4 text-brand" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted">Total Sent</p>
                <p className="mt-1 text-lg font-bold text-foreground">{stats.total}</p>
              </div>
              <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
            </div>
          </div>
          <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                <CheckCircle className="h-4 w-4 text-brand" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted">Successful</p>
                <p className="mt-1 text-lg font-bold text-foreground">{stats.sent}</p>
              </div>
              <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
            </div>
          </div>
          <div className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer hover:border-brand/50">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border">
                <AlertCircle className="h-4 w-4 text-brand" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted">Failed</p>
                <p className="mt-1 text-lg font-bold text-foreground">{stats.failed}</p>
              </div>
              <ArrowUpRight className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="grid gap-4 sm:grid-cols-5">
        {/* Search Box */}
        <div className="sm:col-span-2">
          <input
            type="text"
            placeholder="Search by guardian name or reference..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        {/* Type Filter */}
        <select
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="ALL">All Types</option>
          <option value="ISSUE_BILLS">Invoice Issued</option>
          <option value="SEND_REMINDER">Fee Reminder</option>
          <option value="ATTENDANCE_UPDATE">Attendance</option>
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="ALL">All Status</option>
          <option value="SENT">Sent</option>
          <option value="FAILED">Failed</option>
          <option value="PENDING">Pending</option>
        </select>

        {/* Channel Filter */}
        <select
          value={filterChannel}
          onChange={(e) => {
            setFilterChannel(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="ALL">All Channels</option>
          <option value="WHATSAPP">WhatsApp</option>
          <option value="EMAIL">Email</option>
        </select>
      </div>

      {/* Results Info */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Showing {paginatedNotifications.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–
          {Math.min(currentPage * itemsPerPage, filteredNotifications.length)} of {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? "s" : ""}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
        <label className="text-sm text-muted whitespace-nowrap">
          Rows per page
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
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

      {/* Notifications Table */}
      {!loading ? (
        <div className="rounded-lg border border-border overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Guardian</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Channel</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedNotifications.length > 0 ? (
                  paginatedNotifications.map((notif) => {
                    const typeConfig = getTypeConfig(notif.type);
                    const channelConfig = getChannelConfig(notif.channel);
                    const statusConfig = getStatusConfig(notif.status);
                    const ChannelIcon = channelConfig.icon;
                    const StatusIcon = statusConfig.icon;
                    return (
                      <tr key={notif.id} className="hover:bg-surface/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-foreground">
                          {new Date(notif.date).toLocaleDateString()} {new Date(notif.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="font-medium text-foreground">{notif.guardian}</div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Badge className={typeConfig.color}>
                            {typeConfig.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <ChannelIcon className={`h-4 w-4 ${channelConfig.color}`} />
                            <span className="text-foreground">{channelConfig.label}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`h-4 w-4`} />
                            <Badge className={statusConfig.color}>
                              {statusConfig.label}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <code className="bg-surface-2 px-2 py-1 rounded text-xs text-foreground">
                            {notif.reference || "-"}
                          </code>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted">
                      No communications found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border bg-surface px-6 py-4">
              <div className="text-sm text-muted">
                Page {currentPage} of {totalPages} ({filteredNotifications.length} total)
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  variant="secondary"
                  className="text-sm"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  variant="secondary"
                  className="text-sm"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-surface p-8 text-center">
          <p className="text-muted">Loading communications...</p>
        </div>
      )}

      {/* Info Section */}
      <div className="rounded-lg border border-border bg-surface p-6">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          About Communications
        </h3>
        <ul className="space-y-2 text-sm text-muted">
          <li>• All notifications sent via issue bills, reminders, and attendance updates are logged here</li>
          <li>• Each message is sent via both WhatsApp and Email simultaneously</li>
          <li>• View delivery status and failure reasons for troubleshooting</li>
          <li>• Filter by type, status, and channel to find specific communications</li>
          <li>• Reference numbers link back to specific invoices or attendance records</li>
        </ul>
      </div>
    </div>
  );
}
