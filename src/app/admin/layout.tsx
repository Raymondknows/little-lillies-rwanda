'use client';

import { redirect, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import SharedLayout from '@/components/shared-layout';
import PendingSchoolModal from '@/components/pending-school-modal';
import { SubscriptionAlert } from '@/components/subscription-alert';
import { staffLogoutAction } from '@/app/auth/actions';
import { getBackendUrl } from '@/lib/backend-url';

const nav = [
  { href: "/admin", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/admin/fees", label: "Fees", icon: "CreditCard" },
  { href: "/admin/students", label: "Students", icon: "Users" },
  { href: "/admin/classes", label: "Classes", icon: "Layers" },
  { href: "/admin/teachers", label: "Teachers", icon: "Users" },
  // { href: "/admin/teacher-assignments", label: "Assignments", icon: "BookOpen" },
  { href: "/admin/subjects", label: "Subjects", icon: "BookOpen" },
  { href: "/admin/results", label: "Results", icon: "GraduationCap" },
  { href: "/admin/analytics", label: "Analytics", icon: "BarChart3" },
  { href: "/admin/attendance", label: "Attendance", icon: "ClipboardList" },
  { href: "/admin/whatsapp", label: "WhatsApp", icon: "WhatsApp" },
  { href: "/admin/notifications", label: "Notifications", icon: "Bell" },
  { href: "/admin/support", label: "Support", icon: "HelpCircle" },
  { href: "/admin/website", label: "Website", icon: "Globe" },
  { href: "/admin/subscribe", label: "Subscription", icon: "CreditCard" },
  { href: "/admin/settings", label: "Settings", icon: "Settings" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [school, setSchool] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const backendUrl = getBackendUrl();
        
        // Fetch session
        const sessionRes = await fetch(`${backendUrl}/api/admin/verify`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        const sessionData = await sessionRes.json();
        
        if (!sessionData.authenticated) {
          // Use window.location.href for full page reload with proper cookie handling
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return;
        }

        setSession({
          id: sessionData.session.userId,
          email: sessionData.session.email,
          name: sessionData.session.name,
          role: sessionData.session.role,
        });

        // Fetch school
        const schoolRes = await fetch(`${backendUrl}/api/admin/school/${sessionData.session.schoolId}`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (!schoolRes.ok) {
          setError('School not found');
          setLoading(false);
          return;
        }

        const schoolData = await schoolRes.json();
        setSchool(schoolData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading layout data:', err);
        setError('Failed to load data');
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
          <p className="mt-4 text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !session || !school) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Failed to load admin area'}</p>
          <button 
            onClick={() => { 
              if (typeof window !== 'undefined') {
                window.location.href = '/login';
              }
            }}
            className="px-4 py-2 bg-brand text-white rounded hover:bg-brand/90"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {school.status === "TRIAL" && <SubscriptionAlert />}
      <SharedLayout
        navItems={nav}
        school={school}
        session={session}
        logoHref="/admin"
        logoutAction={staffLogoutAction}
      >
        <PendingSchoolModal schoolStatus={school.status} schoolName={school.name} />
        {children}
      </SharedLayout>
    </>
  );
}
