"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminPageShell from "@/components/admin-page-shell";
import { getBackendUrl } from "@/lib/backend-url";
import EmailCenterClient from "./email-center-client";

interface School {
  id: string;
  name: string;
  email?: string;
  createdAt: string;
}

export default function EmailCenterPage() {
  const [schools, setSchools] = useState<School[]>([]);

  useEffect(() => {
    async function fetchSchools() {
      try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/schoolbase-admin/api/schools?limit=1000`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSchools(data.schools || []);
        }
      } catch (error) {
        console.error('Failed to fetch schools:', error);
        setSchools([]);
      }
    }

    fetchSchools();
  }, []);

  return (
    <AdminPageShell
      title="Email Center"
      subtitle="Send professional updates, reminders, and announcements to schools."
      actions={
        <>
          <Link href="/schoolbase-admin/setup-reminders" className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:bg-surface">
            Setup reminders
          </Link>
          <Link href="/schoolbase-admin/support" className="inline-flex items-center justify-center rounded-xl bg-[#0A66C2] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0952a4]">
            Support inbox
          </Link>
        </>
      }
    >
      <div className="space-y-3 sm:space-y-4">
        <EmailCenterClient initialSchools={schools} initialEmailLogs={[]} />
      </div>
    </AdminPageShell>
  );
}
