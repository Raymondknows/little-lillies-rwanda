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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Email Center</h1>
        <p className="mt-1 text-muted">Send emails and manage communications with schools</p>
      </div>

      <EmailCenterClient initialSchools={schools} initialEmailLogs={[]} />
    </div>
  );
}
