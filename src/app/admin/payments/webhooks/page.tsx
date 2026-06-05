import React from "react";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function WebhooksPage() {
  const events = await prisma.paystackEvent.findMany({ orderBy: { createdAt: "desc" }, take: 200 });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Paystack Webhook Events</h1>
        <Link href="/admin" className="text-sm text-muted hover:underline">← Admin</Link>
      </div>

      <table className="w-full table-auto text-sm">
        <thead>
          <tr className="text-left text-xs text-muted">
            <th className="p-2">Time</th>
            <th className="p-2">Event</th>
            <th className="p-2">Reference</th>
            <th className="p-2">Processed</th>
            <th className="p-2">Result</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.id} className="border-t">
              <td className="p-2">{e.createdAt.toISOString()}</td>
              <td className="p-2">{e.event}</td>
              <td className="p-2">{e.reference ?? "—"}</td>
              <td className="p-2">{e.processed ? "Yes" : "No"}</td>
              <td className="p-2 break-words">{e.result ?? ""}</td>
              <td className="p-2">
                {!e.processed ? (
                  <form action={`/api/paystack/process/${e.id}`} method="post">
                    <button type="submit" className="rounded bg-brand px-3 py-1 text-white text-sm">Process</button>
                  </form>
                ) : (
                  <span className="text-xs text-muted">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
