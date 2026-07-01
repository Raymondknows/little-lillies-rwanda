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
    <div className="p-3 space-y-4 sm:p-6 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Email Center</h1>
        <p className="mt-1 text-sm text-muted sm:text-base">Send emails and manage communications with schools</p>
      </div>

      <EmailCenterClient initialSchools={schools} initialEmailLogs={[]} />
    </div>
  );
}
