"use client";

import { useEffect, useState } from "react";
import StudentsPageClient from "./students-client";

export default function StudentsPage() {
  const [pupils, setPupils] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3006";
        const response = await fetch(`${backendUrl}/api/admin/students/data`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        const data = await response.json();
        setPupils(data.pupils || []);
        setClasses(data.classes || []);
      } catch (err) {
        console.error("Error loading students:", err);
        setError("Failed to load students");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return <StudentsPageClient pupils={pupils} classes={classes} />;
}
