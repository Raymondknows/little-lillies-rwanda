"use client";

import { useEffect, useState } from "react";
import { getBackendUrl } from "../../../lib/backend-url";
import PromotionsPageClient from "./promotions-client";
import AdminSkeleton from "@/components/ui/skeleton";
import SubscriptionModal from "../../../components/subscription-modal";
import { UserGuide, type PageHelpGuide } from "../../../components/ui/user-guide";

const PROMOTION_HELP_GUIDE: PageHelpGuide = {
  title: "Student Promotion Guide",
  overview: "Use this tool to preview students in a class, assign promotion decisions, and apply promotions in one audit-safe workflow.",
  steps: [
    "Select the academic year, term and class to review the promotion candidates.",
    "Click Preview promotions to load the current class roster and begin decision entry.",
    "For each pupil, choose Promoted, Repeated, Transferred or Graduated.",
    "Select a target class for promoted or transferred pupils, and optionally add a rationale.",
    "Click Apply decisions to persist the promotion records and update class assignments.",
  ],
  commonTasks: [
    {
      title: "Preview a class for promotion",
      description: "Load pupils for the selected year, term and class before choosing actions.",
    },
    {
      title: "Apply promotion decisions",
      description: "Only apply after selecting at least one decision and valid target classes for promoted/transferred pupils.",
    },
    {
      title: "Review promotion history",
      description: "Load records for the selected year and term to see past promotion actions.",
    },
  ],
  faqs: [
    {
      question: "What happens if I promote a pupil?",
      answer: "The pupil's class assignment is updated and an audit record is created for the decision.",
    },
    {
      question: "Can I change my decisions before applying?",
      answer: "Yes — update selections while the preview is loaded, then click Apply decisions.",
    },
  ],
};

export default function PromotionsPage() {
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionBlocked, setSubscriptionBlocked] = useState<{ reason: string; schoolName?: string } | null>(null);
  const [schoolName, setSchoolName] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const backendUrl = getBackendUrl();

        const [yearsResponse, classesResponse, verifyResponse] = await Promise.all([
          fetch(`${backendUrl}/api/admin/academic-years`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          }),
          fetch(`${backendUrl}/api/admin/classes/data`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          }),
          fetch(`${backendUrl}/api/admin/verify`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          }),
        ]);

        let schoolNameToUse = "";
        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json().catch(() => null);
          if (verifyData?.authenticated && verifyData.session?.schoolId) {
            try {
              const schoolResponse = await fetch(`${backendUrl}/api/admin/school/${verifyData.session.schoolId}`, {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
              });
              if (schoolResponse.ok) {
                const schoolData = await schoolResponse.json().catch(() => null);
                schoolNameToUse = schoolData?.name || "";
              }
            } catch (error) {
              console.error('Failed to fetch school for promotions page:', error);
            }
          }
        }

        if (!yearsResponse.ok || !classesResponse.ok) {
          const maybeError = await yearsResponse.json().catch(() => null) || await classesResponse.json().catch(() => null);
          if ((yearsResponse.status === 403 || classesResponse.status === 403) && maybeError?.code === 'SUBSCRIPTION_INACTIVE') {
            setSubscriptionBlocked({
              reason: maybeError.reason || 'Your school subscription is not active',
              schoolName: schoolNameToUse || undefined,
            });
            return;
          }

          throw new Error(maybeError?.error || 'Failed to load promotion page data');
        }

        const yearsData = await yearsResponse.json();
        const classesData = await classesResponse.json();

        setAcademicYears(yearsData.academicYears || []);
        setClasses(classesData.classes || []);
        setSchoolName(schoolNameToUse);
      } catch (error) {
        console.error('Error loading promotions initial data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminSkeleton />
      </div>
    );
  }

  if (subscriptionBlocked) {
    return <SubscriptionModal reason={subscriptionBlocked.reason} schoolName={subscriptionBlocked.schoolName || schoolName || 'Your School'} />;
  }

  return (
    <>
      <PromotionsPageClient academicYears={academicYears} classes={classes} />
      <UserGuide guide={PROMOTION_HELP_GUIDE} />
    </>
  );
}
