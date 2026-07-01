"use client";

import { useEffect, useState } from "react";
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
    <div className="px-1.5 py-2.5 space-y-3 sm:px-2 sm:py-4 sm:space-y-4">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Platform
          </span>
        </div>
        <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Email Center</h1>
        <p className="text-sm text-muted sm:text-base">
          Send professional updates, reminders, and announcements to schools.
        </p>
      </div>

      <EmailCenterClient initialSchools={schools} initialEmailLogs={[]} />
    </div>
  );
}
