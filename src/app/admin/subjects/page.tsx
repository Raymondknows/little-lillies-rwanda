"use client";

import { useEffect, useState } from "react";
import SubjectsPageClient from "./subjects-client";

export default function AdminSubjectsPage() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subjectClasses, setSubjectClasses] = useState([]);
  const [teacherSubjects, setTeacherSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3006";
        const response = await fetch(`${backendUrl}/api/admin/subjects/data`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch subjects data: ${response.status}`);
        }
        const data = await response.json();
        setClasses(data.classes || []);
        setSubjects(data.subjects || []);
        setSubjectClasses(data.subjectClasses || []);
        setTeacherSubjects(data.teacherSubjects || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching subjects data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted">Loading subjects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-700">Error: {error}</p>
      </div>
    );
  }

  return (
    <SubjectsPageClient
      classes={classes}
      subjects={subjects}
      subjectClasses={subjectClasses}
      teacherSubjects={teacherSubjects}
    />
  );
}
